// src/hooks/useBalance.js

import { useState, useCallback } from 'react';
import { fetchBalances } from '../services/balanceService';
import { formatBalances } from '../utils/formatters';
import { CHAIN_CONFIG } from '../config/constants';

export function useBalance() {
  const [balancesText, setBalancesText] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshBalances = useCallback(async (address) => {
    if (!address) return;

    try {
      setLoading(true);
      const balances = await fetchBalances(address, CHAIN_CONFIG.rest);
      const formatted = formatBalances(
        balances,
        CHAIN_CONFIG.denom,
        CHAIN_CONFIG.displayDenom,
        CHAIN_CONFIG.decimals
      );
      setBalancesText(formatted);
    } catch (error) {
      console.error('Balance fetch error:', error);
      setBalancesText('(failed to fetch)');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    balancesText,
    loading,
    refreshBalances,
  };
}
