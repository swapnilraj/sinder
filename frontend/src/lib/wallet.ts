import { Address } from "viem";

// Porto wallet integration placeholder
// This will be replaced with actual Porto SDK integration

export type Tx = { 
  to: Address; 
  data?: `0x${string}`; 
  value?: bigint 
};

let account: Address | null = null;

export async function connect(): Promise<Address> {
  // TODO: Replace with Porto SDK connect
  // For now, fallback to EOA via RainbowKit
  if (typeof window !== 'undefined' && (window as unknown as {ethereum?: unknown}).ethereum) {
    const [addr] = await ((window as unknown as {ethereum: {request: (params: {method: string}) => Promise<string[]>}}).ethereum.request({ 
      method: "eth_requestAccounts" 
    }));
    account = addr as Address;
    return account;
  }
  throw new Error("No wallet available");
}

export function getAccount(): Address | null {
  return account;
}

export async function sendTx(tx: Tx): Promise<string> {
  // TODO: Replace with Porto relay execute
  // For now, fallback to EOA
  if (typeof window !== 'undefined' && (window as unknown as {ethereum?: unknown}).ethereum) {
    return ((window as unknown as {ethereum: {request: (params: unknown) => Promise<string>}}).ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        to: tx.to,
        data: tx.data ?? "0x",
        value: tx.value ? "0x" + tx.value.toString(16) : "0x0"
      }]
    }));
  }
  throw new Error("No wallet available");
}
