"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DEPLOYER_ABI } from "../lib/contracts";

interface SinDeployerProps {
  deployerAddress: string;
  onSinDeployed?: () => void;
}

export default function SinDeployer({ deployerAddress, onSinDeployed }: SinDeployerProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceEth: "",
    active: true
  });
  const [isDeploying, setIsDeploying] = useState(false);

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsDeploying(true);
    
    try {
      const priceWei = BigInt(Math.floor(parseFloat(formData.priceEth) * 1e18));
      
      await writeContract({
        address: deployerAddress as `0x${string}`,
        abi: DEPLOYER_ABI,
        functionName: 'deploySin',
        args: [
          formData.name,
          formData.description,
          priceWei,
          formData.active
        ],
      });
    } catch (err) {
      console.error('Error deploying sin:', err);
      setIsDeploying(false);
    }
  };

  // Handle successful deployment - PROPER REACT PATTERN
  useEffect(() => {
    if (isConfirmed && isDeploying) {
      setIsDeploying(false);
      setIsOpen(false);
      setFormData({ name: "", description: "", priceEth: "", active: true });
      onSinDeployed?.();
    }
  }, [isConfirmed, isDeploying, onSinDeployed]);

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-500">Connect wallet to deploy new sins</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Deploy New Sin</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isOpen ? 'Cancel' : 'Deploy Sin'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sin Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="e.g., Procrastination"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="e.g., Put it off till tomorrow"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (ETH)
            </label>
            <input
              type="number"
              step="0.000001"
              min="0.000001"
              value={formData.priceEth}
              onChange={(e) => setFormData(prev => ({ ...prev, priceEth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="0.000001"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Active (available for absolution)
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isPending || isConfirming || isDeploying}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Confirming...' : isConfirming ? 'Deploying...' : 'Deploy Sin'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          {writeError && (
            <div className="text-red-600 text-sm">
              Error: {writeError.message || 'Unknown error occurred'}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
