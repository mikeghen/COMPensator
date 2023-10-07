// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

interface IGovernorBravo {
    function castVote(uint proposalId, uint8 support) external;
}