// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";

import "ds-test/test.sol";
import "../contracts/CompensatorFactory.sol";

contract CompensatorFactoryTest is DSTest {
    CompensatorFactory factory;

    function setUp() public {
        factory = new CompensatorFactory();
    }

    function test_createCompensator() public {
        address delegatee = address(0x123);
        address compensator = factory.createCompensator(delegatee);
        assertEq(factory.getCompensator(delegatee), compensator);
        assertEq(factory.getCompensators()[0], compensator);
    }

}
