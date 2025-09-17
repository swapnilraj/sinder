// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {SinDeployer} from "../src/SinDeployer.sol";
import {SinNFT} from "../src/SinNFT.sol";

contract SinDeployerTest is Test {
	SinDeployer deployer;
	address alice = address(0xA11CE);
	address bob = address(0xB0B);

	function setUp() public {
		deployer = new SinDeployer(address(this));
	}

	// Allow this contract to receive ETH
	receive() external payable {}

	function testDeploySin() public {
		(uint256 sinId, address sinContract) = deployer.deploySin(
			"Procrastination", 
			"Put it off till tomorrow", 
			0.01 ether, 
			true
		);
		
		assertEq(sinId, 0);
		assertTrue(sinContract != address(0));
		
		// Verify deterministic address
		address predicted = deployer.predictSinAddress(sinId);
		assertEq(sinContract, predicted);
		
		// Get sin info
		(address contractAddr, string memory name, , uint256 price, bool active) = deployer.getSinInfo(sinId);
		assertEq(contractAddr, sinContract);
		assertEq(name, "Procrastination");
		assertEq(price, 0.01 ether);
		assertTrue(active);
	}

	function testAbsolveSin() public {
		// Deploy a sin
		(, address sinContract) = deployer.deploySin(
			"Procrastination", 
			"Put it off till tomorrow", 
			0.01 ether, 
			true
		);
		
		// Give treasury some ETH to receive funds
		vm.deal(address(this), 1 ether);
		
		// Absolve the sin
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		SinNFT(sinContract).absolve{value: 0.01 ether}();
		
		assertTrue(SinNFT(sinContract).absolved(alice));
		assertEq(SinNFT(sinContract).balanceOf(alice, 0), 1);
	}

	function testUpdateSin() public {
		// Deploy a sin
		(uint256 sinId, ) = deployer.deploySin(
			"Procrastination", 
			"Put it off till tomorrow", 
			0.01 ether, 
			true
		);
		
		// Update the sin
		deployer.updateSin(sinId, "Updated Name", "Updated description", 0.02 ether, false);
		
		(, string memory name, string memory description, uint256 price, bool active) = deployer.getSinInfo(sinId);
		assertEq(name, "Updated Name");
		assertEq(description, "Updated description");
		assertEq(price, 0.02 ether);
		assertFalse(active);
	}

	function testGetAllSins() public {
		// Deploy multiple sins
		deployer.deploySin("Sin 1", "Description 1", 0.01 ether, true);
		deployer.deploySin("Sin 2", "Description 2", 0.02 ether, false);
		
		(uint256[] memory sinIds, address[] memory contracts, string[] memory names, uint256[] memory prices, bool[] memory activeFlags) = deployer.getAllSins();
		
		assertEq(sinIds.length, 2);
		assertEq(sinIds[0], 0);
		assertEq(sinIds[1], 1);
		assertEq(names[0], "Sin 1");
		assertEq(names[1], "Sin 2");
		assertEq(prices[0], 0.01 ether);
		assertEq(prices[1], 0.02 ether);
		assertTrue(activeFlags[0]);
		assertFalse(activeFlags[1]);
	}

	function testPredictAddress() public {
		// Predict address before deployment
		address predicted = deployer.predictSinAddress(0);
		
		// Deploy and verify
		(, address deployed) = deployer.deploySin("Test", "Test desc", 0.01 ether, true);
		assertEq(deployed, predicted);
	}

	function testAccessControl() public {
		vm.prank(alice);
		vm.expectRevert();
		deployer.deploySin("Test", "Test", 0.01 ether, true);
		
		vm.prank(alice);
		vm.expectRevert();
		deployer.updateSin(0, "Test", "Test", 0.01 ether, true);
	}

	function testInvalidSinId() public {
		vm.expectRevert(SinDeployer.InvalidSinId.selector);
		deployer.getSinInfo(999);
		
		vm.expectRevert(SinDeployer.InvalidSinId.selector);
		deployer.updateSin(999, "Test", "Test", 0.01 ether, true);
	}

	function testZeroAddress() public {
		vm.expectRevert(SinDeployer.ZeroAddress.selector);
		new SinDeployer(address(0));
		
		vm.expectRevert(SinDeployer.ZeroAddress.selector);
		deployer.setTreasury(address(0));
	}

	function testPausable() public {
		deployer.pause();
		
		vm.expectRevert();
		deployer.deploySin("Test", "Test", 0.01 ether, true);
		
		deployer.unpause();
		deployer.deploySin("Test", "Test", 0.01 ether, true);
	}
}
