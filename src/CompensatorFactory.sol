// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Compensator.sol";

contract CompensatorFactory {
    address[] public compensators;
    mapping(address => address) public delegateeToCompensator;

    function createCompensator(address delegatee) external returns (address) {
        Compensator compensator = new Compensator(delegatee);
        compensators.push(address(compensator));
        delegateeToCompensator[delegatee] = address(compensator);
        return address(compensator);
    }

    function getCompensator(address delegatee) external view returns (address) {
        return delegateeToCompensator[delegatee];
    }
}
