// src/hooks/useWallet.js

import { useState, useCallback } from 'react';
import { buildChainInfo } from '../keplr';
import { initializeWallet } from '../services/walletService';
import { WALLET_STATUS } from '../config/constants';
import { readExtraCurrenciesFromStorage } from '../utils/currencies';

export function useWallet(chainConfig) {
  const [status, setStatus] = useState(WALLET_STATUS.DISCONNECTED);
  const [walletType, setWalletType] = useState(null);
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState(null);
  const [stargateClient, setStargateClient] = useState(null);
  const [wasmClient, setWasmClient] = useState(null);

  const connect = useCallback(async (wallet) => {
    try {
      setStatus(WALLET_STATUS.CONNECTING);

      const savedExtraCurrencies = readExtraCurrenciesFromStorage();
      const chainInfo = buildChainInfo(chainConfig, {
        extraCurrencies: savedExtraCurrencies,
      });

      setStatus(WALLET_STATUS.SUGGESTING);

      const result = await initializeWallet(wallet, chainInfo, chainConfig.gasPrice, {
        createDenomTypeUrl: chainConfig.tokenFactoryCreateDenomTypeUrl,
        mintTypeUrl: chainConfig.tokenFactoryMintTypeUrl,
        setMetadataTypeUrl: chainConfig.tokenFactorySetMetadataTypeUrl,
      });

      setWalletType(wallet);
      setAddress(result.address);
      setHeight(result.height);
      setStargateClient(result.stargateClient);
      setWasmClient(result.wasmClient);

      setStatus(WALLET_STATUS.CONNECTED);

      return result;
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus(error?.message || 'Connection failed');
      throw error;
    }
  }, [chainConfig]);

  const disconnect = useCallback(() => {
    setWalletType(null);
    setAddress('');
    setHeight(null);
    setStargateClient(null);
    setWasmClient(null);
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
    stargateClient,
    wasmClient,
    connect,
    disconnect,
    copyAddress,
    setStatus,
  };
}
