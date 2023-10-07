// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Compensator} from "../src/Compensator.sol";
import {IComp} from "../src/interfaces/IComp.sol";
import {IGovernorBravo} from "../src/interfaces/IGovernorBravo.sol";

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
        assertEq(compToken.getCurrentVotes(delegate), 100 ether);
    }

    function test_delegatorWithdraw() public {
        vm.startPrank(delegator1);
        compToken.approve(address(compensator), 100 ether);
        compensator.delegatorDeposit(100 ether);
        vm.stopPrank();
        
        assertEq(compToken.getCurrentVotes(delegate), 100 ether);

        uint initialBalanceCompensator = compToken.balanceOf(address(compensator));
        uint initialBalanceDelegator = compToken.balanceOf(delegator1);

        vm.prank(delegator1);
        compensator.delegatorWithdraw(100 ether);

        uint finalBalanceCompensator = compToken.balanceOf(address(compensator));
        uint finalBalanceDelegator = compToken.balanceOf(delegator1);

        assertEq(finalBalanceCompensator, initialBalanceCompensator - 100 ether);
        assertEq(finalBalanceDelegator, initialBalanceDelegator + 100 ether);
        assertEq(compToken.getCurrentVotes(delegate), 0);
    }

}
