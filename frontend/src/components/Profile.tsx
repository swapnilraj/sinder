"use client";

import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { Absolution, API_BASE } from "../lib/contracts";

interface ProfileProps {
  userAddress?: `0x${string}`;
}

export interface ProfileRef {
  refresh: () => Promise<void>;
}

const Profile = forwardRef<ProfileRef, ProfileProps>(({ userAddress }, ref) => {
  const [absolutions, setAbsolutions] = useState<Absolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAbsolutions = useCallback(async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/user/${userAddress}/absolved`);
      const data = await response.json();
      
      setAbsolutions(data.absolvedSins || []);
    } catch (err) {
      setError("Failed to load absolutions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useImperativeHandle(ref, () => ({
    refresh: loadAbsolutions
  }), [loadAbsolutions]);

  useEffect(() => {
    if (userAddress) {
      loadAbsolutions();
    }
  }, [userAddress, loadAbsolutions]);

  if (!userAddress) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-500">Connect wallet to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadAbsolutions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Absolved Sins</h3>
        <p className="text-sm text-gray-500">
          {absolutions.length} sin{absolutions.length !== 1 ? 's' : ''} absolved
        </p>
      </div>
      
      {absolutions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😇</div>
          <p className="text-gray-500">No sins absolved yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Swipe right on sins to absolve them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {absolutions.map((absolution, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {absolution.sinName}
                </div>
                <div className="text-sm text-gray-500">
                  {absolution.sinDescription}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {absolution.priceEth} ETH
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(absolution.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
