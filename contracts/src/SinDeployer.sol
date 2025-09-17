// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Pausable} from "openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Create2} from "openzeppelin-contracts/contracts/utils/Create2.sol";
import {SinNFT} from "./SinNFT.sol";

contract SinDeployer is Ownable, Pausable {
	struct SinTemplate {
		string name;
		string description;
		uint256 priceWei;
		bool active;
	}

	event SinDeployed(
		uint256 indexed sinId,
		address indexed sinContract,
		string name,
		uint256 priceWei
	);
	event SinUpdated(uint256 indexed sinId, string name, uint256 priceWei, bool active);

	mapping(uint256 => address) public sinContracts; // sinId => contract address
	mapping(uint256 => SinTemplate) public sinTemplates; // sinId => template
	uint256 public nextSinId;
	address public treasury;

	// CREATE2 salt for deterministic addresses
	bytes32 public constant SALT = keccak256("SINDER_SIN_NFT_SALT");

	error InvalidSinId();
	error ZeroAddress();
	error ContractAlreadyExists();

	constructor(address _treasury) Ownable(msg.sender) {
		if (_treasury == address(0)) revert ZeroAddress();
		treasury = _treasury;
	}

	function setTreasury(address _treasury) external onlyOwner {
		if (_treasury == address(0)) revert ZeroAddress();
		treasury = _treasury;
	}

	function pause() external onlyOwner { _pause(); }
	function unpause() external onlyOwner { _unpause(); }

	function deploySin(
		string calldata name,
		string calldata description,
		uint256 priceWei,
		bool active
	) external onlyOwner whenNotPaused returns (uint256 sinId, address sinContract) {
		sinId = nextSinId++;
		
		// Create unique salt for this sin
		bytes32 uniqueSalt = keccak256(abi.encodePacked(SALT, sinId));
		
		// Calculate deterministic address
		bytes32 bytecodeHash = keccak256(type(SinNFT).creationCode);
		sinContract = Create2.computeAddress(uniqueSalt, bytecodeHash, address(this));
		
		// Check if contract already exists at this address
		uint256 codeSize;
		assembly {
			codeSize := extcodesize(sinContract)
		}
		if (codeSize > 0) revert ContractAlreadyExists();
		
		// Deploy using CREATE2
		SinNFT newSinNFT = new SinNFT{salt: uniqueSalt}();
		
		// Initialize the contract
		newSinNFT.initialize(treasury, sinId, name, description, priceWei);
		
		// Store template and contract address
		sinTemplates[sinId] = SinTemplate({
			name: name,
			description: description,
			priceWei: priceWei,
			active: active
		});
		sinContracts[sinId] = sinContract;

		emit SinDeployed(sinId, sinContract, name, priceWei);
	}

	function updateSin(
		uint256 sinId,
		string calldata name,
		string calldata description,
		uint256 priceWei,
		bool active
	) external onlyOwner {
		if (sinContracts[sinId] == address(0)) revert InvalidSinId();
		
		sinTemplates[sinId] = SinTemplate({
			name: name,
			description: description,
			priceWei: priceWei,
			active: active
		});

		// Update the deployed contract
		SinNFT(sinContracts[sinId]).updateSin(name, description, priceWei, active);

		emit SinUpdated(sinId, name, priceWei, active);
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

	function getAllSins() external view returns (
		uint256[] memory sinIds,
		address[] memory contracts,
		string[] memory names,
		uint256[] memory prices,
		bool[] memory activeFlags
	) {
		uint256 count = nextSinId;
		sinIds = new uint256[](count);
		contracts = new address[](count);
		names = new string[](count);
		prices = new uint256[](count);
		activeFlags = new bool[](count);

		for (uint256 i = 0; i < count; i++) {
			sinIds[i] = i;
			contracts[i] = sinContracts[i];
			SinTemplate memory template = sinTemplates[i];
			names[i] = template.name;
			prices[i] = template.priceWei;
			activeFlags[i] = template.active;
		}
	}

	// Predict the address of a sin contract before deployment
	function predictSinAddress(uint256 sinId) external view returns (address) {
		bytes32 uniqueSalt = keccak256(abi.encodePacked(SALT, sinId));
		bytes32 bytecodeHash = keccak256(type(SinNFT).creationCode);
		return Create2.computeAddress(uniqueSalt, bytecodeHash, address(this));
	}
}
