// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Pausable} from "openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Initializable} from "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";
import {Base64} from "openzeppelin-contracts/contracts/utils/Base64.sol";

contract SinNFT is ERC1155, Ownable, Pausable, Initializable {
	using Strings for uint256;

	struct SinData {
		string name;
		string description;
		uint256 priceWei;
		bool active;
		uint256 sinId; // Original sinId from deployer
	}

	event SinUpdated(string name, string description, uint256 priceWei, bool active);
	event Absolved(address indexed user, uint256 priceWei);

	SinData public sinData;
	address public treasury;

	error BadPrice();
	error AlreadyAbsolved();
	error Inactive();
	error NotInitialized();

	// Constructor for CREATE2 deployment (no initialization)
	constructor() ERC1155("") Ownable(msg.sender) {
		// No initialization here - will be done via initialize()
	}

	// Initialization function (replaces constructor logic)
	function initialize(
		address _treasury,
		uint256 _sinId,
		string calldata _name,
		string calldata _description,
		uint256 _priceWei
	) external initializer {
		treasury = _treasury;
		sinData = SinData({
			name: _name,
			description: _description,
			priceWei: _priceWei,
			active: true,
			sinId: _sinId
		});
	}

	function updateSin(
		string calldata name,
		string calldata description,
		uint256 priceWei,
		bool active
	) external onlyOwner {
		sinData.name = name;
		sinData.description = description;
		sinData.priceWei = priceWei;
		sinData.active = active;
		emit SinUpdated(name, description, priceWei, active);
	}

	function pause() external onlyOwner { _pause(); }
	function unpause() external onlyOwner { _unpause(); }

	// Soulbound: disallow transfers/approvals
	function safeTransferFrom(address, address, uint256, uint256, bytes memory) public virtual override { 
		revert("NON_TRANSFERABLE"); 
	}
	function safeBatchTransferFrom(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual override { 
		revert("NON_TRANSFERABLE"); 
	}
	function setApprovalForAll(address, bool) public virtual override { 
		revert("NON_TRANSFERABLE"); 
	}

	function absolved(address user) public view returns (bool) {
		return balanceOf(user, 0) > 0;
	}

	function absolve() external payable whenNotPaused {
		SinData memory s = sinData;
		if (!s.active) revert Inactive();
		if (msg.value != s.priceWei) revert BadPrice();
		if (balanceOf(msg.sender, 0) > 0) revert AlreadyAbsolved();

		_mint(msg.sender, 0, 1, ""); // Token ID 0 for this sin
		emit Absolved(msg.sender, msg.value);

		(bool ok, ) = treasury.call{value: msg.value}("");
		require(ok, "TREASURY_SEND_FAIL");
	}

	// Fully on-chain JSON + SVG
	function uri(uint256) public view override returns (string memory) {
		SinData memory s = sinData;
		bytes memory svg = abi.encodePacked(
			'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">',
			'<rect width="100%" height="100%" fill="#111"/>',
			'<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="28" font-family="sans-serif">', s.name, "</text>",
			'<text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14" font-family="sans-serif">Sinder Absolution</text>',
			'<text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="12" font-family="sans-serif">Sin #', s.sinId.toString(), "</text>",
			"</svg>"
		);

		bytes memory json = abi.encodePacked(
			'{"name":"', s.name, '",',
			'"description":"', s.description, '",',
			'"image":"data:image/svg+xml;base64,', Base64.encode(svg), '",',
			'"attributes":[',
				'{"trait_type":"Sin ID","value":"', s.sinId.toString(), '"},',
				'{"trait_type":"Price (ETH)","value":"', _priceEthString(s.priceWei), '"},',
				'{"trait_type":"Active","value":"', (s.active ? "true" : "false"), '"}',
			"]}"
		);

		return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
	}

	function _priceEthString(uint256 weiAmt) internal pure returns (string memory) {
		uint256 intPart = weiAmt / 1e18;
		uint256 frac = weiAmt % 1e18;
		if (frac == 0) return string(abi.encodePacked(intPart.toString(), ".0"));
		uint256 milli = frac / 1e15;
		return string(abi.encodePacked(intPart.toString(), ".", _pad3(milli)));
	}

	function _pad3(uint256 n) internal pure returns (string memory) {
		if (n >= 100) return n.toString();
		if (n >= 10) return string(abi.encodePacked("0", n.toString()));
		return string(abi.encodePacked("00", n.toString()));
	}
}
