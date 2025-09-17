import { parseAbi } from "viem";

// Contract ABIs
export const DEPLOYER_ABI = parseAbi([
  'function nextSinId() view returns (uint256)',
  'function sinContracts(uint256) view returns (address)',
  'function getSinInfo(uint256) view returns (address, string, string, uint256, bool)',
  'function getAllSins() view returns (uint256[], address[], string[], uint256[], bool[])',
  'function deploySin(string calldata name, string calldata description, uint256 priceWei, bool active) external returns (uint256 sinId, address sinContract)',
  'event SinDeployed(uint256 indexed sinId, address indexed sinContract, string name, uint256 priceWei)',
  'event SinUpdated(uint256 indexed sinId, string name, uint256 priceWei, bool active)'
]);

export const SINNFT_ABI = parseAbi([
  'function balanceOf(address, uint256) view returns (uint256)',
  'function uri(uint256) view returns (string)',
  'function absolve() payable',
  'event Absolved(address indexed user, uint256 priceWei)'
]);

// Contract addresses - fully configurable via environment
export const CONTRACTS: Record<number, string> = {
  84532: process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || "0xC1952E19E01F570eF2A0B3711AdDEF9E78500182", // Base Sepolia - Production deployer
};

// Validate required environment variables at runtime
export function getDeployerAddress(): string {
  const address = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || "0xC1952E19E01F570eF2A0B3711AdDEF9E78500182";
  if (!address) {
    throw new Error("NEXT_PUBLIC_DEPLOYER_ADDRESS environment variable is required");
  }
  return address;
}

// API endpoints - now using Next.js API routes
export const API_BASE = '';

export interface Sin {
  id: number;
  contract: string;
  name: string;
  description: string;
  priceWei: string;
  priceEth: string;
  active: boolean;
  createdAt: number;
}

export interface Absolution {
  sinId: number;
  sinName: string;
  sinDescription: string;
  priceWei: string;
  priceEth: string;
  timestamp: number;
}
