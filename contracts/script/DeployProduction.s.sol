// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SinDeployerMinimal} from "../src/SinDeployerMinimal.sol";

contract DeployProduction is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with address:", deployerAddress);
        console.log("Balance:", deployerAddress.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the main deployer contract (treasury = deployer)
        SinDeployerMinimal deployer = new SinDeployerMinimal(deployerAddress);
        
        console.log("SinDeployerMinimal deployed at:", address(deployer));
        
        // Deploy production sins with reasonable prices
        deployProductionSins(deployer);
        
        vm.stopBroadcast();
        
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Deployer Address:", address(deployer));
        console.log("Total Sins Deployed:", deployer.nextSinId());
    }
    
    function deployProductionSins(SinDeployerMinimal deployer) internal {
        // Classic Seven Deadly Sins
        deployer.deploySin("Pride", "Excessive self-regard and arrogance", 0.001 ether, true);
        deployer.deploySin("Greed", "Insatiable desire for wealth and material gain", 0.002 ether, true);
        deployer.deploySin("Wrath", "Uncontrolled anger and hatred", 0.0015 ether, true);
        deployer.deploySin("Envy", "Resentment of others' success and possessions", 0.0012 ether, true);
        deployer.deploySin("Lust", "Excessive desire for physical pleasure", 0.0018 ether, true);
        deployer.deploySin("Gluttony", "Overindulgence in food, drink, or consumption", 0.0008 ether, true);
        deployer.deploySin("Sloth", "Laziness and avoidance of work or effort", 0.0005 ether, true);
        
        // Modern Digital Sins
        deployer.deploySin("Doomscrolling", "Endless consumption of negative news and social media", 0.0003 ether, true);
        deployer.deploySin("FOMO", "Fear of missing out on trends and experiences", 0.0007 ether, true);
        deployer.deploySin("Ghosting", "Suddenly cutting off all communication without explanation", 0.0004 ether, true);
        deployer.deploySin("Procrastination", "Delaying important tasks until the last minute", 0.0002 ether, true);
        deployer.deploySin("Humble Bragging", "Disguising boasts as modest self-deprecation", 0.0006 ether, true);
        deployer.deploySin("Virtue Signaling", "Public displays of moral superiority for social credit", 0.0009 ether, true);
        deployer.deploySin("Mansplaining", "Condescendingly explaining things others already know", 0.0011 ether, true);
        
        // Workplace Sins
        deployer.deploySin("Reply All Abuse", "Unnecessarily including everyone in email responses", 0.0001 ether, true);
        deployer.deploySin("Meeting Overload", "Scheduling excessive and unnecessary meetings", 0.0013 ether, true);
        deployer.deploySin("Micromanaging", "Excessive control over employees' every action", 0.0016 ether, true);
        deployer.deploySin("Credit Stealing", "Taking credit for others' work and ideas", 0.0014 ether, true);
        
        // Tech Sins
        deployer.deploySin("Not Reading Documentation", "Asking questions answered in the docs", 0.0001 ether, true);
        deployer.deploySin("Premature Optimization", "Optimizing code before it's actually needed", 0.0004 ether, true);
        deployer.deploySin("Copy-Paste Programming", "Coding without understanding what you're copying", 0.0003 ether, true);
        deployer.deploySin("Hardcoding Values", "Embedding configuration directly in source code", 0.0002 ether, true);
        
        // Social Sins
        deployer.deploySin("Double Dipping", "Using the same chip twice in shared dip", 0.0001 ether, true);
        deployer.deploySin("Loud Phone Calls", "Having personal conversations in public spaces", 0.0002 ether, true);
        deployer.deploySin("Not Returning Shopping Carts", "Leaving carts scattered in parking lots", 0.0001 ether, true);
        deployer.deploySin("Spoiling Movies", "Revealing plot twists without warning", 0.0005 ether, true);
        
        // Crypto/Web3 Sins
        deployer.deploySin("Aping Into Memecoins", "Investing life savings in dog-themed tokens", 0.001 ether, true);
        deployer.deploySin("Not Your Keys Not Your Crypto", "Keeping funds on centralized exchanges", 0.0008 ether, true);
        deployer.deploySin("Gas Fee Rage", "Paying $50 to transfer $10 worth of tokens", 0.0003 ether, true);
        deployer.deploySin("Diamond Hands Delusion", "Holding worthless tokens out of stubbornness", 0.0006 ether, true);
        deployer.deploySin("Shilling Your Bags", "Promoting tokens you're desperately trying to exit", 0.0004 ether, true);
        
        console.log("Production sins deployed successfully!");
    }
}
