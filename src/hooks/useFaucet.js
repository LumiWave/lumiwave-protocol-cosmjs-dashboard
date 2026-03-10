// src/hooks/useFaucet.js

import { useState, useCallback } from 'react';
import { requestFaucet } from '../services/faucetService';

export function useFaucet(faucetConfig) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (address, onSuccess) => {
    try {
      setLoading(true);
      setResult('');

      const faucetApiBase = (faucetConfig?.apiPath || '').trim();
      const isAbsolute = /^https?:\/\//i.test(faucetApiBase);
      const isRelative = faucetApiBase.startsWith('/');
      if (!isAbsolute && !isRelative) {
        throw new Error('VITE_FAUCET_API must be absolute URL or /api path');
      }

      const response = await requestFaucet(address, faucetApiBase);
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
  }, [faucetConfig]);

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
