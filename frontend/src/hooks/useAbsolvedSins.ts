import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../lib/contracts';

export function useAbsolvedSins(address?: `0x${string}`) {
  const [absolvedSins, setAbsolvedSins] = useState<Set<number>>(new Set());

  const loadAbsolvedSins = useCallback(async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/user/${address}/absolved`);
      const data = await response.json();
      const absolvedIds = new Set<number>(data.absolvedSins?.map((abs: {sinId: number}) => Number(abs.sinId)) || []);
      setAbsolvedSins(absolvedIds);
    } catch (err) {
      console.error('Failed to load absolved sins:', err);
    }
  }, [address]);

  const refreshAbsolvedSins = useCallback(() => {
    loadAbsolvedSins();
  }, [loadAbsolvedSins]);

  useEffect(() => {
    if (address) {
      loadAbsolvedSins();
    }
  }, [address, loadAbsolvedSins]);

  return {
    absolvedSins,
    setAbsolvedSins,
    refreshAbsolvedSins
  };
}
