// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "../contracts/Compensator.sol";

contract DeployCompensator is Script {
    Compensator public compensator;

    function setUp() public {
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        compensator = new Compensator(msg.sender);
        console2.log("Compensator contract deployed at: ", address(compensator));

        vm.stopBroadcast();
    }
}

