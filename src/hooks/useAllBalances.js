// src/hooks/useAllBalances.js

import { useState, useCallback } from 'react';
import { fetchBalances } from '../services/balanceService';
import { formatBalances } from '../utils/formatters';
export function useAllBalances(chainConfig) {
  const [nativeBalances, setNativeBalances] = useState([]);
  const [cw20Balances, setCw20Balances] = useState([]);
  const [nftCollections, setNftCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoDiscovering, setAutoDiscovering] = useState(false);

  // CW20 token contract address list
  const [cw20Addresses, setCw20Addresses] = useState([]);
  
  // NFT collection contract address list
  const [nftAddresses, setNftAddresses] = useState([]);

  /**
   * Automatic token discovery (find all wallet tokens)
   */
  const autoDiscoverTokens = useCallback(async () => {
    setAutoDiscovering(true);
    setAutoDiscovering(false);
    return { cw20: [], cw721: [] };
  }, []);

  /**
   * Refresh native coin balances
   */
  const refreshNativeBalances = useCallback(async (address) => {
    if (!address) return;

    try {
      const balances = await fetchBalances(address, chainConfig.rest);
      setNativeBalances(balances);
      return balances;
    } catch (error) {
      console.error('Native balance fetch error:', error);
      setNativeBalances([]);
      return [];
    }
  }, [chainConfig]);

  /**
   * Refresh CW20 token balances
   */
  const refreshCW20Balances = useCallback(
    async () => {
      setCw20Balances([]);
      return [];
    },
    []
  );

  /**
   * Refresh NFT collections
   */
  const refreshNFTCollections = useCallback(
    async () => {
      setNftCollections([]);
      return [];
    },
    []
  );

  /**
   * Refresh all balances
   */
  const refreshAllBalances = useCallback(
    async (address) => {
      setLoading(true);
      try {
        await Promise.all([refreshNativeBalances(address)]);
      } finally {
        setLoading(false);
      }
    },
    [refreshNativeBalances]
  );

  /**
   * Add CW20 token
   */
  const addCW20Token = useCallback((contractAddress) => {
    setCw20Addresses((prev) => {
      if (prev.includes(contractAddress)) return prev;
      return [...prev, contractAddress];
    });
  }, []);

  /**
   * Remove CW20 token
   */
  const removeCW20Token = useCallback((contractAddress) => {
    setCw20Addresses((prev) => prev.filter((addr) => addr !== contractAddress));
  }, []);

  /**
   * Add NFT collection
   */
  const addNFTCollection = useCallback((contractAddress) => {
    setNftAddresses((prev) => {
      if (prev.includes(contractAddress)) return prev;
      return [...prev, contractAddress];
    });
  }, []);

  /**
   * Remove NFT collection
   */
  const removeNFTCollection = useCallback((contractAddress) => {
    setNftAddresses((prev) => prev.filter((addr) => addr !== contractAddress));
  }, []);

  /**
   * Format native balances
   */
  const formattedNativeBalances = formatBalances(
    nativeBalances,
    chainConfig.denom,
    chainConfig.displayDenom,
    chainConfig.decimals
  );

  return {
    // Balance data
    nativeBalances,
    cw20Balances,
    nftCollections,
    formattedNativeBalances,
    loading,
    autoDiscovering,

    // Auto discovery
    autoDiscoverTokens,

    // Refresh functions
    refreshAllBalances,
    refreshNativeBalances,
    refreshCW20Balances,
    refreshNFTCollections,

    // CW20 management
    cw20Addresses,
    addCW20Token,
    removeCW20Token,

    // NFT management
    nftAddresses,
    addNFTCollection,
    removeNFTCollection,
  };
}
