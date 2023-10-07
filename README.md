# COMPenstator
This project is inspired by a project idea from Compound Grants:

> Build a marketplace where delegates can offer rewards, or solicit payment, for representing COMP-holders in Compound Governance.

## Project Overview
The project has two main features:
### 1. COMP holders delegate their voting power to a delegate and earn COMP form the delegate
* The delegate deposits COMP into the Compensator contract
* The delegate sets a reward rate (in COMP/second)
* COMP holders can delegate their COMP to the delegatee's Compensator
* COMP delegator earn rewards in COMP in proportion to the reward rate and their share of the total COMP delegated to the Compensator

### 2. COMP holders can pay the delegate to vote for a proposal
* Delegators can pay the delegate to vote for or against a proposal
* Delegators stake COMP for a specific option (for or against), the stake is escrowed
* After the delegate votes, the delegate earns the payment from the option they voted
* The delegators that payed for the losing option get their stake back

# Protocol Specifications
## `CompensatorFactory`

### Variables
* `address[] public compensators` - a list of all Compensator contracts created by the factory
* `mapping(address => address) public delegateeToCompensator` - a mapping of delegatees to their Compensator contracts

### Functions
#### `createCompensator(address delegatee) returns (address)`
* Creates a Compensator contract for a delegatee
* Adds the Compensator contract to the list of compensators
* Adds the delegatee and Compensator contract to the delegateeToCompensator mapping

#### `getCompensator(address delegatee) view returns (address)`

## `Compensator`
### Struct
* `Proposal` - a structure representing a compound proposal, stores information related to pay for vote
    * `bool active` - true if the proposal is active, false if it has been executed or defeated
    * `uint paymentFor` - the amount of COMP payed for voting for the proposal
    * `uint paymentAgainst` - the amount of COMP payed for voting against the proposal
    * `uint paymentAbstain` - the amount of COMP payed for abstaining from voting on the proposal
    * `uint outcome` - the outcome of the proposal, true if the delegatee votes for, false if against

### Variables
* `address delegate` - the address of the delegatee
* `uint256 rewardRate` - the reward rate in COMP/second`
* `uint256 rewardIndex` - increases in propotion to the rewards rate and the total rewards claimed
* `uint255 lastRewarded` - Tracks the time of the last reward claim
* `mapping(uint => Proposal) proposals` - a mapping of proposal ids to proposals, key is a vaild COMP proposal ID
* `mapping(address => uint) claimedRewards` - a mapping of delegators to the amount of rewards they've claimed in COMP

### Functions
#### `delegateDeposit(uint256 amount) onlyDelegate`
* Delegate deposits COMP into the Compensator contract for payment to delegators

#### `delegateWithdraw(uint256 amount) onlyDelegate`
* Delegate withdraws COMP from the Compensator contract

#### `setRewardRate(uint256 amount) onlyDelegate`
* Delegate sets the reward rate for delegators in COMP/second

#### `registerProposal(uint proposalId) onlyDelegate`
* Register a proposal to be voted on by the delegatee

#### `castVote(uint proposalId, bool support) onlyDelegate`
* Delegate votes on a COMP proposal

#### `claimVoteReward(uint proposalId) onlyDelegate`
* Delegate claims their reward for voting on a proposal

#### `delegate(uint256 amount)`
* Delegator delegates COMP to the delegatee's Compensator contract
* COMP is deposited into the Compensator contract

#### `undelegate(uint256 amount)`
* Delegator undelegates COMP from the delegatee's Compensator contract
* COMP is withdrawn from the Compensator contract
* Any COMP rewards are claimed on withdraw

#### `incentivize(uint proposalId, bool support, uint amount)`
* Delegator pays the delegatee to vote for/against a proposal

#### `claimRewards()`
* Delegator claims their rewards in COMP

#### `getRewards(address delegator) view returns (uint256)`
* Returns the amount of COMP rewards a delegator has earned but not claimed
