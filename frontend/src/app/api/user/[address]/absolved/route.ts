import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
const DEPLOYER_ADDRESS = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || '0xC1952E19E01F570eF2A0B3711AdDEF9E78500182';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL)
});

const DEPLOYER_ABI = [
  {
    "inputs": [],
    "name": "nextSinId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "sinId", "type": "uint256"}],
    "name": "getSinInfo",
    "outputs": [
      {"internalType": "address", "name": "contractAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "priceWei", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const SIN_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function loadAllSins() {
  try {
    const nextSinId = await client.readContract({
      address: DEPLOYER_ADDRESS as `0x${string}`,
      abi: DEPLOYER_ABI,
      functionName: 'nextSinId'
    });

    const sins = [];
    
    for (let i = 0; i < Number(nextSinId); i++) {
      try {
        const result = await client.readContract({
          address: DEPLOYER_ADDRESS as `0x${string}`,
          abi: DEPLOYER_ABI,
          functionName: 'getSinInfo',
          args: [i]
        });

        const [contractAddress, name, description, priceWei, active] = result as [string, string, string, bigint, boolean];

        const sin = {
          id: i,
          contract: contractAddress,
          name,
          description,
          priceWei: priceWei.toString(),
          priceEth: formatEther(priceWei),
          active,
          createdAt: Date.now()
        };

        sins.push(sin);
      } catch (error) {
        console.error(`Error loading sin ${i}:`, error);
      }
    }

    return sins;
  } catch (error) {
    console.error('Error loading sins:', error);
    throw error;
  }
}

async function getUserAbsolvedSins(userAddress: string) {
  try {
    const sins = await loadAllSins();
    const absolvedSins = [];

    for (const sin of sins) {
      try {
        const balance = await client.readContract({
          address: sin.contract as `0x${string}`,
          abi: SIN_NFT_ABI,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`, BigInt(0)] // Token ID is always 0 for sins
        });

        if (Number(balance) > 0) {
          absolvedSins.push({
            sinId: sin.id,
            sinName: sin.name,
            sinDescription: sin.description,
            priceWei: sin.priceWei,
            priceEth: sin.priceEth,
            timestamp: Date.now() // Placeholder
          });
        }
      } catch (error) {
        console.error(`Error checking balance for sin ${sin.id}:`, error);
      }
    }

    return absolvedSins;
  } catch (error) {
    console.error('Error loading user absolved sins:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await context.params;
    
    if (!address) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    const absolvedSins = await getUserAbsolvedSins(address);
    return NextResponse.json({ absolvedSins });
  } catch (error: unknown) {
    console.error('User absolved sins API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
