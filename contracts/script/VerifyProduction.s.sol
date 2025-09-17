// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SinDeployerMinimal} from "../src/SinDeployerMinimal.sol";
import {SinNFT} from "../src/SinNFT.sol";

contract VerifyProduction is Script {
    function run() external view {
        address deployerAddress = 0xC1952E19E01F570eF2A0B3711AdDEF9E78500182;
        
        console.log("=== PRODUCTION DEPLOYMENT VERIFICATION ===");
        console.log("Verifying SinDeployer at:", deployerAddress);
        
        SinDeployerMinimal deployer = SinDeployerMinimal(deployerAddress);
        
        uint256 nextSinId = deployer.nextSinId();
        console.log("Next Sin ID:", nextSinId);
        console.log("Total Sins Deployed:", nextSinId);
        
        console.log("\n=== PRODUCTION SINS LIST ===");
        
        for (uint256 i = 0; i < nextSinId; i++) {
            (address sinContract, string memory name, string memory description, uint256 priceWei, bool active) = deployer.getSinInfo(i);
            
            console.log("Sin", i, "- Contract:", sinContract);
            console.log("Sin", i, "- Name:", name);
            console.log("Sin", i, "- Description:", description);
            console.log("Sin", i, "- Price (wei):", priceWei);
            console.log("Sin", i, "- Price (ETH):", priceWei / 1e18);
            console.log("Sin", i, "- Active:", active);
            
            // Test the SinNFT contract
            SinNFT sinNFT = SinNFT(sinContract);
            string memory uri = sinNFT.uri(0);
            console.log("Sin", i, "- URI length:", bytes(uri).length);
            console.log("---");
        }
        
        console.log("=== VERIFICATION COMPLETE ===");
        console.log("All", nextSinId, "production sins verified successfully!");
    }
}
