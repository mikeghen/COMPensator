// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IComp.sol";
import "./interfaces/IGovernorBravo.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Compensator {
    using SafeERC20 for IComp;

    IComp public constant compToken = IComp(0xc00e94Cb662C3520282E6f5717214004A7f26888);
    IGovernorBravo public constant governorBravo = IGovernorBravo(0xc0Da02939E1441F497fd74F78cE7Decb17B66529);

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

    /// @notice Mapps proposal ID to delegators to their vote incentive for the proposal
    mapping(uint => mapping(address => VoteIncentive)) public voteIncentives;

    modifier onlyDelegate() {
        require(msg.sender == delegate, "Not the delegate");
        _;
    }

    constructor(address _delegate) {
        delegate = _delegate;
        rewardIndex = 1e18;
        compToken.delegate(delegate);
    }

    /// @notice Allows the delegate to deposit COMP to be used for rewards
    /// @param amount The amount of COMP to deposit
    function delegateDeposit(uint256 amount) external onlyDelegate {
        require(amount > 0, "Amount must be greater than 0");

        compToken.transferFrom(delegate, address(this), amount);
        availableRewards += amount;

        // TODO: Event emission
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
        
        // TODO: Event emission
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

    function delegatorDeposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        // TODO: Update the rewards index before updating the state

        // Transfer COMP from delegator to the contract
        compToken.transferFrom(msg.sender, address(this), amount);
        // TODO: Mint them an ERC20 token back for record keeping
        
        // Delegate the COMP tokens held in this contract the delegate
        compToken.delegate(delegate);

        // TODO: Emit and event
    }

    function delegatorWithdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        // TODO: Require this delegator is not currently incentivizing any proposals

        // TODO: Update the rewards index before updating the state

        // TODO: Calculate the pending rewards that can be claimed by the delegator

        // Update reward index and last rewarded timestamp
        lastRewarded = block.timestamp;

        compToken.transfer(msg.sender, amount);

        // TODO: Emit and event
    }

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

    function recoverIncentive(uint proposalId) external {
        require(proposals[proposalId].active == false, "Proposal is still active");
        require(proposals[proposalId].escrowUntil > block.timestamp, "Proposal is not yet resolved");

        // Calculate and transfer rewards based on the outcome
    }

    function claimRewards() external {
        // Calculate and transfer rewards for the delegator
        uint256 rewards = (block.timestamp - lastRewarded) * rewardRate;
        claimedRewards[msg.sender] += rewards;

        // Update reward index and last rewarded timestamp
        rewardIndex += rewards;
        lastRewarded = block.timestamp;
    }

    function getRewards(address delegator) external view returns (uint256) {
        return claimedRewards[delegator];
    }
}