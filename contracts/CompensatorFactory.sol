// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Compensator.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract CompensatorFactory {
    address[] public compensators;
    mapping(address => address) public delegateeToCompensator;
    address public immutable original;

    constructor() {
        Compensator compensator = new Compensator();
        compensator.initialize(msg.sender, "Compensator Implementation");
        original = address(compensator);
    }

    function createCompensator(address delegatee, string memory delegateeName) external returns (address) {
        address clone = Clones.cloneDeterministic(original, keccak256(abi.encode(delegatee)));
        Compensator(clone).initialize(delegatee, delegateeName);
        compensators.push(clone);
        delegateeToCompensator[delegatee] = clone;
        return clone;
    }

    function getCompensator(address delegatee) external view returns (address) {
        return delegateeToCompensator[delegatee];
    }

    function getCompensators() public view returns (address[] memory) {
        return compensators;
    }
}
