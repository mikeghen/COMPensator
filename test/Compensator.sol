// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Compensator} from "../src/Compensator.sol";

contract CompensatorTest is Test {
    Compensator public compensator;

    function setUp() public {
        compensator = new Compensator();
        compensator.setNumber(0);
    }

    function test_Increment() public {
        compensator.increment();
        assertEq(compensator.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        compensator.setNumber(x);
        assertEq(compensator.number(), x);
    }
}
