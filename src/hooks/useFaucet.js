// src/hooks/useFaucet.js

import { useState, useCallback } from 'react';
import { requestFaucet } from '../services/faucetService';
import { FAUCET_CONFIG } from '../config/constants';

export function useFaucet() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (address, onSuccess) => {
    try {
      setLoading(true);
      setResult('');

      const response = await requestFaucet(address, FAUCET_CONFIG.apiPath);
      setResult(response.message);

      if (response.success && onSuccess) {
        // Delay before refreshing balances
        setTimeout(() => onSuccess(), 1200);
      }
    } catch (error) {
      console.error('Faucet error:', error);
      setResult(error?.message || 'Faucet request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult('');
  }, []);

  return {
    result,
    loading,
    request,
    clearResult,
  };
}
