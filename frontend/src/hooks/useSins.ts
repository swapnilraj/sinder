import { useState, useEffect, useCallback } from 'react';
import { Sin, API_BASE } from '../lib/contracts';

export function useSins() {
  const [sins, setSins] = useState<Sin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/sins?limit=100`);
      const data = await response.json();
      setSins(data.sins || []);
    } catch (err) {
      setError("Failed to load sins");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only load on mount - no external triggers
  useEffect(() => {
    loadSins();
  }, [loadSins]);

  return {
    sins,
    loading,
    error,
    loadSins,
    setSins
  };
}
