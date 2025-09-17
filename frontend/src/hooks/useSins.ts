import { useState, useEffect, useCallback } from 'react';
import { Sin, API_BASE } from '../lib/contracts';

// Fisher-Yates shuffle algorithm for randomizing array order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
      
      // Ensure we have a proper Sin array with type safety
      const sins: Sin[] = Array.isArray(data.sins) ? data.sins : [];
      
      // Randomize the sin order for a fresh experience each time
      const shuffledSins = shuffleArray(sins);
      setSins(shuffledSins);
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
