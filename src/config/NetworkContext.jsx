// src/config/NetworkContext.jsx

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  NETWORKS,
  FAUCET_CONFIGS,
  NETWORK_TYPE,
  getSavedNetwork,
  saveNetwork,
} from './networks';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [networkType, setNetworkType] = useState(getSavedNetwork);

  const chainConfig = useMemo(() => NETWORKS[networkType], [networkType]);
  const faucetConfig = useMemo(() => FAUCET_CONFIGS[networkType], [networkType]);

  const switchNetwork = useCallback(
    (newType) => {
      if (newType === networkType) return;
      if (!NETWORKS[newType]) return;
      saveNetwork(newType);
      setNetworkType(newType);
    },
    [networkType]
  );

  const isTestnet = networkType === NETWORK_TYPE.TESTNET;
  const isMainnet = networkType === NETWORK_TYPE.MAINNET;

  const value = useMemo(
    () => ({
      networkType,
      chainConfig,
      faucetConfig,
      switchNetwork,
      isTestnet,
      isMainnet,
    }),
    [networkType, chainConfig, faucetConfig, switchNetwork, isTestnet, isMainnet]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return ctx;
}
