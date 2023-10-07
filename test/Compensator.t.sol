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
