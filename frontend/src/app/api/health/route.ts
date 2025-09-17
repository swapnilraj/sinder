import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
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
  }
];

export async function GET() {
  try {
    const nextSinId = await client.readContract({
      address: DEPLOYER_ADDRESS as `0x${string}`,
      abi: DEPLOYER_ABI,
      functionName: 'nextSinId'
    });

    return NextResponse.json({
      status: 'healthy',
      sinsLoaded: Number(nextSinId),
      deployerAddress: DEPLOYER_ADDRESS,
      lastKnownSinId: Number(nextSinId),
      timestamp: Date.now()
    });
  } catch (error: unknown) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
