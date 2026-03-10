// src/config/constants.js
// 하위 호환: CHAIN_CONFIG / FAUCET_CONFIG는 테스트넷 기본값으로 유지.
// 네트워크 전환 시에는 useNetwork() 훅의 chainConfig를 사용한다.

import { NETWORKS, FAUCET_CONFIGS, NETWORK_TYPE } from './networks';

export const CHAIN_CONFIG = NETWORKS[NETWORK_TYPE.TESTNET];

export const FAUCET_CONFIG = FAUCET_CONFIGS[NETWORK_TYPE.TESTNET];

export const TABS = {
  DASHBOARD: 'dashboard',
  FAUCET: 'faucet',
  SEND: 'send',
  TOKEN_FACTORY: 'token-factory',
  WASM: 'wasm',
  NFT_DEPLOY: 'nft-deploy',
  NFT_MINT: 'nft-mint',
};

export const WALLET_STATUS = {
  DISCONNECTED: 'Disconnected',
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected',
  SUGGESTING: 'Suggesting chain to wallet...',
  CREATING_CLIENTS: 'Creating CosmJS clients...',
  ADDRESS_COPIED: 'Address copied',
};
