// src/hooks/useWallet.js

import { useState, useRef, useCallback } from 'react';
import { buildChainInfo } from '../keplr';
import { initializeWallet } from '../services/walletService';
import { CHAIN_CONFIG, WALLET_STATUS } from '../config/constants';

export function useWallet() {
  const [status, setStatus] = useState(WALLET_STATUS.DISCONNECTED);
  const [walletType, setWalletType] = useState(null);
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState(null);

  const stargateRef = useRef(null);
  const wasmRef = useRef(null);

  const connect = useCallback(async (wallet) => {
    try {
      setStatus(WALLET_STATUS.CONNECTING);

      const chainInfo = buildChainInfo(import.meta.env);

      setStatus(WALLET_STATUS.SUGGESTING);

      const result = await initializeWallet(wallet, chainInfo, CHAIN_CONFIG.gasPrice);

      setWalletType(wallet);
      setAddress(result.address);
      setHeight(result.height);
      stargateRef.current = result.stargateClient;
      wasmRef.current = result.wasmClient;

      setStatus(WALLET_STATUS.CONNECTED);

      return result;
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus(error?.message || 'Connection failed');
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletType(null);
    setAddress('');
    setHeight(null);
    stargateRef.current = null;
    wasmRef.current = null;
    setStatus(WALLET_STATUS.DISCONNECTED);
  }, []);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setStatus(WALLET_STATUS.ADDRESS_COPIED);
    setTimeout(() => setStatus(WALLET_STATUS.CONNECTED), 900);
  }, [address]);

  return {
    status,
    walletType,
    address,
    height,
    stargateClient: stargateRef.current,
    wasmClient: wasmRef.current,
    connect,
    disconnect,
    copyAddress,
    setStatus,
  };
}
