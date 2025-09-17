"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sin, SINNFT_ABI, getDeployerAddress } from "../lib/contracts";
import SinCard from "../components/SinCard";
import Profile, { ProfileRef } from "../components/Profile";
import SinDeployer from "../components/SinDeployer";
import { useSins } from "../hooks/useSins";
import { useAbsolvedSins } from "../hooks/useAbsolvedSins";

export default function Home() {
  const { address } = useAccount();
  // const chainId = useChainId(); // Unused for now
  const profileRef = useRef<ProfileRef>(null);
  const [absolvingSin, setAbsolvingSin] = useState<Sin | null>(null);
  const [sinDeployedTrigger, setSinDeployedTrigger] = useState(0);
  
  // Custom hooks for clean data management
  const { sins, loading, error, loadSins, setSins } = useSins();
  const { absolvedSins, setAbsolvedSins } = useAbsolvedSins(address);
  
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction completion
  useEffect(() => {
    if (isConfirmed && absolvingSin) {
      console.log('Sin absolved successfully!');
      setSins(prev => prev.filter(sin => sin.id !== absolvingSin.id));
      setAbsolvedSins(prev => new Set([...prev, absolvingSin.id]));
      setAbsolvingSin(null);
      
      // Refresh profile after a short delay to allow blockchain state to update
      setTimeout(() => {
        profileRef.current?.refresh();
      }, 2000);
    }
  }, [isConfirmed, absolvingSin, setSins, setAbsolvedSins]);

  // Handle sin deployment success - PROPER REACT PATTERN
  useEffect(() => {
    if (sinDeployedTrigger > 0) {
      // Reload data after sin deployment
      loadSins();
      profileRef.current?.refresh();
    }
  }, [sinDeployedTrigger, loadSins]);

  const handleSinDeployed = useCallback(() => {
    // Simply trigger the effect - no direct state updates
    setSinDeployedTrigger(prev => prev + 1);
  }, []);

  const handleSwipe = async (sinId: number, direction: 'left' | 'right') => {
    if (direction === 'right') {
      const sin = sins.find(s => s.id === sinId);
      if (!sin || !address) {
        console.error('Sin not found or wallet not connected');
        return;
      }
      
      // Check if sin is already absolved
      if (absolvedSins.has(sinId)) {
        console.log(`Sin ${sinId} already absolved, skipping transaction`);
        // Just remove from stack
        setSins(prev => prev.filter(s => s.id !== sinId));
        return;
      }
      
      setAbsolvingSin(sin);
      
      try {
        await writeContract({
          address: sin.contract as `0x${string}`,
          abi: SINNFT_ABI,
          functionName: 'absolve',
          value: BigInt(sin.priceWei),
        });
      } catch (err) {
        console.error('Error calling absolve:', err);
        setAbsolvingSin(null);
      }
    } else {
      // Just remove from stack for left swipe
      setSins(prev => prev.filter(sin => sin.id !== sinId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadSins}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sinder</h1>
          <ConnectButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Swipe Interface */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Swipe Sins</h2>
            {sins.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">No more sins to swipe!</p>
                <button 
                  onClick={loadSins}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reload
                </button>
              </div>
            ) : (
              <div className="relative h-96">
                {sins.slice(0, 3).map((sin, index) => (
                  <SinCard
                    key={sin.id}
                    sin={sin}
                    onSwipe={handleSwipe}
                    zIndex={sins.length - index}
                    disabled={isPending || isConfirming}
                    isAbsolved={absolvedSins.has(sin.id)}
                  />
                ))}
                
                {/* Transaction Status */}
                {(isPending || isConfirming) && absolvingSin && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-white p-6 rounded-lg text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-700 mb-2">
                        {isPending ? 'Confirming transaction...' : 'Processing absolution...'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Absolving: {absolvingSin.name}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Error Display */}
                {writeError && (
                  <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-red-600 mb-2">Transaction Failed</p>
                      <p className="text-sm text-red-500 mb-4">
                        {writeError.message || 'Unknown error occurred'}
                      </p>
                      <button 
                        onClick={() => setAbsolvingSin(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500">
              Swipe right to absolve (pay), left to skip
            </p>
            {!address && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Connect your wallet to absolve sins
                </p>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
            <Profile ref={profileRef} userAddress={address} />
            
            {/* Sin Deployer */}
            <SinDeployer 
              deployerAddress={getDeployerAddress()}
              onSinDeployed={handleSinDeployed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}