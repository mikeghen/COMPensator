// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./interfaces/IComp.sol";
import "./interfaces/IGovernorBravo.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Compensator is ERC20 {
    using SafeERC20 for IComp;

    //////////////////////////
    // Variables
    //////////////////////////

    /// @notice The COMP governance token
    IComp public constant compToken = IComp(0xc00e94Cb662C3520282E6f5717214004A7f26888);

    /// @notice The Governor Bravo contract for COMP governance
    IGovernorBravo public constant governorBravo = IGovernorBravo(0xc0Da02939E1441F497fd74F78cE7Decb17B66529);

    /// @notice The address of the delegate
    address public delegate;

    /// @notice The amount of COMP deposited by the delegate available for rewards to delegators
    uint256 public availableRewards;

    /// @notice The rate at which COMP is distributed to delegators (COMP per second)
    uint256 public rewardRate;

    /// @notice Current reward index used for distributing COMP rewards to delegators
    uint256 public rewardIndex;

    /// @notice Timestamp of the last time rewards were claimed (i.e. the rewardIndex was updated)
    uint256 public lastRewarded;

    /// @notice Mapps delegator to their claimed rewards
    mapping(address => uint) public claimedRewards;

    /// @notice Delegator starting reward index, used for calculating rewards
    mapping(address => uint) public startRewardIndex;

    //////////////////////////
    // Events
    //////////////////////////

    event DelegateDeposit(address indexed delegate, uint256 amount);
    event DelegateWithdraw(address indexed delegate, uint256 amount);
    event RewardRateUpdate(address indexed delegate, uint256 newRate);
    event ProposalRegister(address indexed delegate, uint256 proposalId);
    event ProposalVote(address indexed delegate, uint256 proposalId, uint256 outcome);
    event ProposalClaim(address indexed delegate, uint256 proposalId, uint256 outcome);
    event DelegatorDeposit(address indexed delegator, uint256 amount);
    event DelegatorWithdraw(address indexed delegator, uint256 amount);
    event Incentivize(address indexed delegator, uint256 proposalId, uint256 amount, uint256 outcome);
    event RecoverIncentive(address indexed delegator, uint256 proposalId, uint256 amount);
    event ClaimRewards(address indexed delegator, uint256 amount);

    //////////////////////////
    // Modifiers
    //////////////////////////

    modifier onlyDelegate() {
        require(msg.sender == delegate, "Not the delegate");
        _;
    }

    //////////////////////////
    // Constructor
    //////////////////////////

    constructor(address _delegate) ERC20("Compensator", "COMPSTR") {
        delegate = _delegate;
        rewardIndex = 1e18;
        compToken.delegate(delegate);
    }

    //////////////////////////
    // View Methods
    //////////////////////////

    /// @notice Calculates the timestamp where rewards will be distributed until
    /// using the rewardsRate and availableRewards
    /// @return until The timestamp where rewards will be distributed until
    function rewardsUntil() external view returns (uint256) {
        if (rewardRate == 0) {
            return block.timestamp;
        }
        uint256 remainingRewardsTime = availableRewards / rewardRate;
        return lastRewarded + remainingRewardsTime;
    }

    /// @notice Returns the amount of pending rewards for the delegator
    /// @param delegator The address of the delegator
    /// @return The total amount of rewards available to be claimed by delegators
    function getPendingRewards(address delegator) external view returns (uint256) {
        // Are there enough rewards?
        uint currIndex = _getCurrentRewardsIndex();
    return balanceOf(delegator) * (currIndex - startRewardIndex[delegator]) / 1e18;
    }

    //////////////////////////
    // Delegate/Owner Methods
    //////////////////////////

    /// @notice Allows the delegate to deposit COMP to be used for rewards
    /// @param amount The amount of COMP to deposit
    function delegateDeposit(uint256 amount) external onlyDelegate {
        require(amount > 0, "Amount must be greater than 0");

        compToken.transferFrom(delegate, address(this), amount);
        availableRewards += amount;
        _updateRewardsIndex();

        emit DelegateDeposit(delegate, amount);
    }

    /// @notice Allows the delegate to withdraw COMP that is not used for rewards
    /// @param amount The amount of COMP to withdraw
    function delegateWithdraw(uint256 amount) external onlyDelegate {
        require(amount > 0, "Amount must be greater than 0");

        // TODO: Calculate the amount of pending rewards that can be claimed by delegators
        // Require that the amount is less than the available rewards - pending rewards
        require(amount <= availableRewards, "Amount must be less than available rewards");

        availableRewards -= amount;
        compToken.transfer(delegate, amount);
        
        emit DelegateWithdraw(delegate, amount);
    }

    /// @notice Allows the delegate to update the reward rate
    /// @param newRate The new reward rate in COMP per second
    function setRewardRate(uint256 newRate) external onlyDelegate {
        require(newRate >= 0, "Reward rate must be non-negative");

        _updateRewardsIndex();
        rewardRate = newRate;
        
        emit RewardRateUpdate(delegate, newRate);
    }

    //////////////////////////
    // Delegator Methods
    //////////////////////////

    /// @notice Allows a delegator to delegate tokens to the delegate to receive rewards
    /// @param amount The amount of COMP to delegate
    function delegatorDeposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        _updateRewardsIndex();

        // Transfer COMP from delegator to the contract
        compToken.transferFrom(msg.sender, address(this), amount);

        // Update this delegator's starting reward index
        startRewardIndex[msg.sender] = rewardIndex;

        // Mint them an ERC20 token back for record keeping
        _mint(msg.sender, amount);

        emit DelegatorDeposit(msg.sender, amount);
    }

    /// @notice Allows a delegator to withdraw tokens from the contract
    /// @param amount The amount of COMP to withdraw
    function delegatorWithdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        _claimRewards(msg.sender); // updates the index and transfers rewards
        _burn(msg.sender, amount);
        compToken.transfer(msg.sender, amount);

        emit DelegatorWithdraw(msg.sender, amount);
    }

    /// @notice Allows a delegator to claim their rewards for delegating
    function claimRewards() external {
        _claimRewards(msg.sender);
    }

    /// @notice Allows a delegator to claim their rewards for delegating
    /// @param delegator The address of the delegator
    function _claimRewards(address delegator) internal {
        _updateRewardsIndex();
        uint pendingRewards = balanceOf(delegator) * (rewardIndex - startRewardIndex[delegator]) / 1e18;
        startRewardIndex[msg.sender] = rewardIndex;
        compToken.transfer(msg.sender, pendingRewards);
        emit ClaimRewards(msg.sender, pendingRewards);
    }

    /// @notice Update the reward index based on how much time has passed and the rewards rate
    function _updateRewardsIndex() internal {
        // How much time has passed since the last update?
        uint256 timeDelta = block.timestamp - lastRewarded;

        // How much COMP is to be allocated to rewards?
        uint256 rewards = timeDelta * rewardRate;

        // Adjust the available rewards by the amount allocated
        if(rewards > availableRewards) {
            availableRewards = 0;
            rewards = availableRewards;
        } else {
            availableRewards -= rewards;
        }   

        // Update the reward index
        uint supply = totalSupply();
        if(supply > 0) {
            rewardIndex += rewards * 1e18 / supply;
        } 

        // Update the last rewarded timestamp
        lastRewarded = block.timestamp;
    }

    /// @notice Returns the current rewards index, adjusted for time since last rewarded
    function _getCurrentRewardsIndex() internal view returns (uint256) {
        uint256 timeDelta = block.timestamp - lastRewarded;
        uint256 rewards = timeDelta * rewardRate;
        uint supply = totalSupply();
        if(supply > 0) {
            return rewardIndex + rewards * 1e18 / supply;
        } else {
            return rewardIndex;
        }
    }

    //////////////////////////
    // ERC20 Overrides
    //////////////////////////

    // TODO: No transfers other than mint/burn is allowed
}