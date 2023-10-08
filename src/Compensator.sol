// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IComp.sol";
import "./interfaces/IGovernorBravo.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Compensator is ERC20 {
    using SafeERC20 for IComp;

    IComp public constant compToken = IComp(0xc00e94Cb662C3520282E6f5717214004A7f26888);
    IGovernorBravo public constant governorBravo = IGovernorBravo(0xc0Da02939E1441F497fd74F78cE7Decb17B66529);

    //////////////////////////
    // Structures
    //////////////////////////

    struct Proposal {
        bool active; // Whether the proposal is still active
        uint256 escrowUntil; // Timestamp when the proposal is rewards can be released
        uint256 paymentFor; // Amount of COMP to incentivize the for vote
        uint256 paymentAgainst; // Amount of COMP to incentivize the against vote
        uint256 outcome; // 0 = abstain, 1 = for, 2 = against
    }

    struct VoteIncentive {
        uint256 amount; // Amount of COMP to incentivize with
        uint256 outcome; // 0 = abstain, 1 = for, 2 = against
    }

    /// @notice Delegators deposit COMP to receive COMPSTR tokens
    /// This starts a DelegatorPosition. On each additional deposit, 
    /// the rewards accumulated are distributed and the DelegatorPosition's
    /// startRewardIndex is reset


    //////////////////////////
    // Variables
    //////////////////////////

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

    /// @notice Mapps proposal ID to proposal information
    mapping(uint => Proposal) public proposals;

    /// @notice Mapps delegator to their claimed rewards
    mapping(address => uint) public claimedRewards;

    /// @notice Delegator starting reward index, used for calculating rewards
    mapping(address => uint) public startRewardIndex;

    /// @notice Mapps proposal ID to delegators to their vote incentive for the proposal
    mapping(uint => mapping(address => VoteIncentive)) public voteIncentives;

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

        // TODO: Trigger an update to the rewardsIndex before updating the rate

        rewardRate = newRate;

        // TODO: Event emission
    }

    /// @notice Allows the delegate to register a new proposal
    /// @param proposalId The ID of the COMP proposal to register for rewards
    function registerProposal(uint proposalId) external onlyDelegate {
        require(proposals[proposalId].active == false, "Proposal already registered");

        // Register a new proposal
        proposals[proposalId] = Proposal({
            active: true,
            escrowUntil: block.timestamp + 10 days, 
            paymentFor: 0,
            paymentAgainst: 0,
            outcome: 0
        });


        // TODO: Event emission
    }

    /// @notice Allows the delegate to cast their vote on a proposal, proxies to governorBravo
    /// @param proposalId The ID of the COMP proposal to vote on
    /// @param support Whether to vote for or against the proposal
    function castVote(uint proposalId, bool support) external onlyDelegate {
        require(proposals[proposalId].active, "Proposal is not active");

        // TODO: Cast the vote on the proposal
        // governorBravo.castVote(proposalId, support ? 1 : 2);

        // TODO: Update the state of the proposal locally
    }

    function claimVoteReward(uint proposalId) external onlyDelegate {
        require(proposals[proposalId].active == false, "Proposal is still active");
        require(proposals[proposalId].outcome > 0, "Delegate has not voted");

        // Calculate and transfer rewards based on the outcome
        uint256 rewards = proposals[proposalId].outcome == 1
            ? proposals[proposalId].paymentFor
            : proposals[proposalId].paymentAgainst;

        claimedRewards[delegate] += rewards;

        // Update reward index and last rewarded timestamp
        rewardIndex += rewards;
        lastRewarded = block.timestamp;
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

    /// @notice Returns the amount of pending rewards for the delegator
    /// @param delegator The address of the delegator
    /// @return The total amount of rewards available to be claimed by delegators
    function getPendingRewards(address delegator) external view returns (uint256) {
        // Are there enough rewards?
        uint supply = totalSupply();
        uint indexChange = rewardIndex - startRewardIndex[delegator];
        uint totalRewards = supply * indexChange / 1e18;
        if(totalRewards > availableRewards) {
            totalRewards = availableRewards;
            return totalRewards * balanceOf(delegator) / supply;
        }
        return balanceOf(msg.sender) * indexChange / 1e18;
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


    ////////////////////////////////
    // Proposal Incentives Methods
    ////////////////////////////////

    /// @notice Allows a delegator to incentivize a proposal outcome with COMP
    /// @param proposalId The ID of the COMP proposal to incentivize
    /// @param support Whether to incentivize the for or against vote
    /// @param amount The amount of COMP to incentivize with
    function incentivize(uint proposalId, bool support, uint amount) external {
        require(proposals[proposalId].active, "Proposal is not active");

        // Transfer COMP from the delegator to the contract
        // Assume ERC20 transfer function is available
        compToken.transferFrom(msg.sender, address(this), amount);

        // Update the payment information for the specified proposal
        if (support) {
            proposals[proposalId].paymentFor += amount;
        } else {
            proposals[proposalId].paymentAgainst += amount;
        }
    }

    /// @notice Recover incentives from a proposal if the option incentivized was not the outcome
    /// @param proposalId The ID of the COMP proposal to recover incentives from
    function recoverIncentive(uint proposalId) external {
        require(proposals[proposalId].active == false, "Proposal is still active");
        require(proposals[proposalId].escrowUntil > block.timestamp, "Proposal is not yet resolved");

        // Calculate and transfer rewards based on the outcome
    }


    //////////////////////////
    // ERC20 Overrides
    //////////////////////////

    // TODO: No transfers other than mint/burn is allowed
}