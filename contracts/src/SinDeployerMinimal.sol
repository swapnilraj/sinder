// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Create2} from "openzeppelin-contracts/contracts/utils/Create2.sol";
import {SinNFT} from "./SinNFT.sol";

contract SinDeployerMinimal is Ownable {
	struct SinTemplate {
		string name;
		string description;
		uint256 priceWei;
		bool active;
	}

	event SinDeployed(uint256 indexed sinId, address indexed sinContract, string name, uint256 priceWei);

	mapping(uint256 => address) public sinContracts;
	mapping(uint256 => SinTemplate) public sinTemplates;
	uint256 public nextSinId;
	address public treasury;

	bytes32 public constant SALT = keccak256("SINDER_SIN_NFT_SALT");

	error InvalidSinId();
	error ZeroAddress();

	constructor(address _treasury) Ownable(msg.sender) {
		if (_treasury == address(0)) revert ZeroAddress();
		treasury = _treasury;
	}

	function setTreasury(address _treasury) external onlyOwner {
		if (_treasury == address(0)) revert ZeroAddress();
		treasury = _treasury;
	}

	function deploySin(
		string calldata name,
		string calldata description,
		uint256 priceWei,
		bool active
	) external onlyOwner returns (uint256 sinId, address sinContract) {
		sinId = nextSinId++;
		
		bytes32 uniqueSalt = keccak256(abi.encodePacked(SALT, sinId));
		bytes32 bytecodeHash = keccak256(type(SinNFT).creationCode);
		sinContract = Create2.computeAddress(uniqueSalt, bytecodeHash, address(this));
		
		SinNFT newSinNFT = new SinNFT{salt: uniqueSalt}();
		newSinNFT.initialize(treasury, sinId, name, description, priceWei);
		
		sinTemplates[sinId] = SinTemplate({
			name: name,
			description: description,
			priceWei: priceWei,
			active: active
		});
		sinContracts[sinId] = sinContract;

		emit SinDeployed(sinId, sinContract, name, priceWei);
	}

	function getSinInfo(uint256 sinId) external view returns (
		address sinContract,
		string memory name,
		string memory description,
		uint256 priceWei,
		bool active
	) {
		if (sinContracts[sinId] == address(0)) revert InvalidSinId();
		SinTemplate memory template = sinTemplates[sinId];
		return (sinContracts[sinId], template.name, template.description, template.priceWei, template.active);
	}
}
