// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {SinNFT} from "../src/SinNFT.sol";

contract SinNFTTest is Test {
	SinNFT sinNFT;
	address alice = address(0xA11CE);
	address bob = address(0xB0B);
	address treasury = address(0x123);

	function setUp() public {
		sinNFT = new SinNFT();
		sinNFT.initialize(treasury, 0, "Procrastination", "Put it off till tomorrow", 0.01 ether);
	}

	function testInitialize() public {
		assertEq(sinNFT.treasury(), treasury);
		(string memory name, string memory description, uint256 priceWei, bool active, uint256 sinId) = sinNFT.sinData();
		assertEq(name, "Procrastination");
		assertEq(description, "Put it off till tomorrow");
		assertEq(priceWei, 0.01 ether);
		assertTrue(active);
		assertEq(sinId, 0);
	}

	function testAbsolve() public {
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
		
		assertTrue(sinNFT.absolved(alice));
		assertEq(sinNFT.balanceOf(alice, 0), 1);
	}

	function testAbsolveWrongPrice() public {
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		vm.expectRevert(SinNFT.BadPrice.selector);
		sinNFT.absolve{value: 0.02 ether}();
	}

	function testAbsolveAlreadyAbsolved() public {
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
		
		vm.prank(alice);
		vm.expectRevert(SinNFT.AlreadyAbsolved.selector);
		sinNFT.absolve{value: 0.01 ether}();
	}

	function testAbsolveInactive() public {
		sinNFT.updateSin("Test", "Test", 0.01 ether, false);
		
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		vm.expectRevert(SinNFT.Inactive.selector);
		sinNFT.absolve{value: 0.01 ether}();
	}

	function testUpdateSin() public {
		sinNFT.updateSin("New Name", "New description", 0.02 ether, false);
		
		(string memory name, string memory description, uint256 priceWei, bool active,) = sinNFT.sinData();
		assertEq(name, "New Name");
		assertEq(description, "New description");
		assertEq(priceWei, 0.02 ether);
		assertFalse(active);
	}

	function testSoulboundTransfers() public {
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
		
		vm.prank(alice);
		vm.expectRevert("NON_TRANSFERABLE");
		sinNFT.safeTransferFrom(alice, bob, 0, 1, "");
		
		vm.prank(alice);
		vm.expectRevert("NON_TRANSFERABLE");
		sinNFT.setApprovalForAll(bob, true);
	}

	function testUri() public {
		string memory uri = sinNFT.uri(0);
		assertTrue(bytes(uri).length > 0);
		assertTrue(bytes(uri).length > 100); // Should be substantial JSON
	}

	function testTreasuryReceivesFunds() public {
		uint256 treasuryBalanceBefore = treasury.balance;
		
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
		
		assertEq(treasury.balance, treasuryBalanceBefore + 0.01 ether);
	}

	function testAccessControl() public {
		vm.prank(alice);
		vm.expectRevert();
		sinNFT.updateSin("Test", "Test", 0.01 ether, true);
	}

	function testPausable() public {
		sinNFT.pause();
		
		vm.deal(alice, 1 ether);
		vm.prank(alice);
		vm.expectRevert();
		sinNFT.absolve{value: 0.01 ether}();
		
		sinNFT.unpause();
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
	}

	function testMultipleAbsolutions() public {
		vm.deal(alice, 1 ether);
		vm.deal(bob, 1 ether);
		
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
		
		vm.prank(bob);
		sinNFT.absolve{value: 0.01 ether}();
		
		assertTrue(sinNFT.absolved(alice));
		assertTrue(sinNFT.absolved(bob));
		assertEq(sinNFT.balanceOf(alice, 0), 1);
		assertEq(sinNFT.balanceOf(bob, 0), 1);
	}

	function testEvents() public {
		vm.deal(alice, 1 ether);
		
		vm.expectEmit(true, false, false, true);
		emit SinNFT.Absolved(alice, 0.01 ether);
		
		vm.prank(alice);
		sinNFT.absolve{value: 0.01 ether}();
	}
}
