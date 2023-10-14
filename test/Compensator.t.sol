// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Compensator} from "../contracts/Compensator.sol";
import {IComp} from "../contracts/interfaces/IComp.sol";
import {IGovernorBravo} from "../contracts/interfaces/IGovernorBravo.sol";

contract CompensatorTest is Test {
    address internal constant COMP_TOKEN_ADDRESS = 0xc00e94Cb662C3520282E6f5717214004A7f26888;
    address internal constant GOVERNOR_BRAVO_ADDRESS = 0xc0Da02939E1441F497fd74F78cE7Decb17B66529;

    IComp public compToken = IComp(COMP_TOKEN_ADDRESS);
    IGovernorBravo public governorBravo = IGovernorBravo(GOVERNOR_BRAVO_ADDRESS);

    Compensator public compensator;

    address payable public delegate = payable(makeAddr("delegate"));
    address payable public delegator1 = payable(makeAddr("delegator1"));
    address payable public delegator2 = payable(makeAddr("delegator2"));
    address payable public delegator3 = payable(makeAddr("delegator3"));

    function setUp() public {
        compensator = new Compensator(delegate);

        // Give the delegate some COMP
        deal(address(compToken), delegate, 1000 ether);
        deal(address(compToken), delegator1, 1000 ether);
        deal(address(compToken), delegator2, 1000 ether);
        deal(address(compToken), delegator3, 1000 ether);

    }
}

contract CompensatorDelegateTest is CompensatorTest {

    function test_setRewardRate() public {
        vm.prank(delegate);
        compensator.setRewardRate(100 ether);

        assertEq(compensator.rewardRate(), 100 ether);
    }

    function test_delegateDeposit() public {
        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegate = compToken.balanceOf(delegate);

        vm.startPrank(delegate);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegateDeposit(100 ether);
        vm.stopPrank();

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegate = compToken.balanceOf(delegate);

        assertEq(finalBalanceCompensator, initialBalanceCompensator + 100 ether);
        assertEq(finalBalanceDelegate, initialBalanceDelegate - 100 ether);
    }

    function test_delegateWithdraw() public {
        vm.startPrank(delegate);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegateDeposit(100 ether);
        vm.stopPrank();

        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegate = compToken.balanceOf(delegate);

        vm.prank(delegate);
        compensator.delegateWithdraw(100 ether);

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegate = compToken.balanceOf(delegate);

        assertEq(finalBalanceCompensator, initialBalanceCompensator - 100 ether);
        assertEq(finalBalanceDelegate, initialBalanceDelegate + 100 ether);
    }
}

contract CompensatorDelegatorTest is CompensatorTest {

    function test_delegatorDeposit() public {
        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegator = compToken.balanceOf(delegator1);

        vm.startPrank(delegator1);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegator = compToken.balanceOf(delegator1);

        assertEq(finalBalanceCompensator, initialBalanceCompensator + 100 ether);
        assertEq(finalBalanceDelegator, initialBalanceDelegator - 100 ether);
        assertEq(compensator.balanceOf(delegator1), 100 ether);
        assertEq(compToken.getCurrentVotes(delegate), 100 ether);
    }

    function test_delegatorWithdraw() public {
        vm.startPrank(delegator1);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        assertEq(compToken.getCurrentVotes(delegate), 100 ether);
        assertEq(compensator.balanceOf(delegator1), 100 ether);
        
        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegator = compToken.balanceOf(delegator1);

        vm.prank(delegator1);
        compensator.delegatorWithdraw(100 ether);

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegator = compToken.balanceOf(delegator1);

        assertEq(finalBalanceCompensator, initialBalanceCompensator - 100 ether);
        assertEq(finalBalanceDelegator, initialBalanceDelegator + 100 ether);
        assertEq(compensator.balanceOf(delegator1), 0);
        assertEq(compToken.getCurrentVotes(delegate), 0);
    }

    function test_claimRewardsSingleDelegator() public {
        uint oneHundredEther = 100 ether;
        uint year = 365 days;
        // Delegate deposits
        vm.startPrank(delegate);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegateDeposit(100 ether);
        compensator.setRewardRate(oneHundredEther / year); // 100 COMP / year
        vm.stopPrank();

        // Delegator 1 deposits
        vm.startPrank(delegator1);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        // Advance 1 day
        vm.warp(block.timestamp + 1 days);

        // Delegator 1 claims rewards
        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegator = compToken.balanceOf(delegator1);

        vm.prank(delegator1);
        compensator.claimRewards();

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegator = compToken.balanceOf(delegator1);

        uint expectedRewards = oneHundredEther / year * 1 days;
        assertEq(finalBalanceCompensator, initialBalanceCompensator - expectedRewards);
        assertEq(finalBalanceDelegator, initialBalanceDelegator + expectedRewards);
    }

    function test_claimRewardsMultipleDelegators() public {
        uint oneHundredEther = 100 ether;
        uint year = 365 days;
        // Delegate deposits
        vm.startPrank(delegate);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegateDeposit(100 ether);
        compensator.setRewardRate(oneHundredEther / year); // 100 COMP / year
        vm.stopPrank();

        // Delegator 1 deposits
        vm.startPrank(delegator1);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        // Advance 1 day
        vm.warp(block.timestamp + 1 days);

        // Delegator 2 deposits
        vm.startPrank(delegator2);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        // Advance 1 day
        vm.warp(block.timestamp + 1 days);

        // Delegator 3 deposits
        vm.startPrank(delegator3);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();

        // Advance 1 day
        vm.warp(block.timestamp + 1 days); // minus 2 seconds to account two txns

        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegator1 = compToken.balanceOf(delegator1);
        uint initialBalanceDelegator2 = compToken.balanceOf(delegator2);
        uint initialBalanceDelegator3 = compToken.balanceOf(delegator3);

        // Delegators claim rewards
        vm.prank(delegator1);
        compensator.claimRewards();

        vm.prank(delegator2);
        compensator.claimRewards();

        vm.prank(delegator3);
        compensator.claimRewards();

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegator1 = compToken.balanceOf(delegator1);
        uint finalBalanceDelegator2 = compToken.balanceOf(delegator2);
        uint finalBalanceDelegator3 = compToken.balanceOf(delegator3);

        uint oneDayReward = oneHundredEther / year * 1 days;
        uint delegator3ExpectedRewards = oneDayReward / 3;
        uint delegator2ExpectedRewards = oneDayReward / 2 + delegator3ExpectedRewards;
        uint delegator1ExpectedRewards = oneDayReward + delegator2ExpectedRewards;

        assertEq(finalBalanceDelegator1, initialBalanceDelegator1 + delegator1ExpectedRewards);
        assertEq(finalBalanceDelegator2, initialBalanceDelegator2 + delegator2ExpectedRewards);
        assertEq(finalBalanceDelegator3, initialBalanceDelegator3 + delegator3ExpectedRewards);
        assertEq(finalBalanceCompensator, initialBalanceCompensator - 3 * oneDayReward);
    }
}
