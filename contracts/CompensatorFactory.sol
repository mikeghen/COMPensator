// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Compensator.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract CompensatorFactory {
    address[] public compensators;
    mapping(address => address) public delegateeToCompensator;


    function createCompensator(address delegatee, string memory delegateeName) external returns (address) {
        Compensator compensator = new Compensator();       
        compensator.initialize(delegatee, delegateeName);
        compensators.push(address(compensator));
        delegateeToCompensator[delegatee] = address(compensator);
        return address(compensator);
    }

    function getCompensator(address delegatee) external view returns (address) {
        return delegateeToCompensator[delegatee];
    }

    function getCompensators() public view returns (address[] memory) {
        return compensators;
    }
}
