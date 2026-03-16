// src/config/networks.js
// 테스트넷과 메인넷 네트워크 설정을 정의한다.

const env = import.meta.env;

export const NETWORK_TYPE = {
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
};

const TESTNET_CONFIG = {
  networkType: NETWORK_TYPE.TESTNET,
  chainId: env.VITE_CHAIN_ID || 'lumiwaveprotocol-testnet',
  chainName: env.VITE_CHAIN_NAME || 'LumiWave Protocol Testnet',
  rpc: env.VITE_RPC || 'https://lwp-testnet.lumiwavelab.com/tendermint/',
  rest: env.VITE_REST || 'https://lwp-testnet.lumiwavelab.com/',
  bech32Prefix: env.VITE_BECH32_PREFIX || 'lumi',
  denom: env.VITE_DENOM || 'ulwp',
  displayDenom: env.VITE_DENOM_DISPLAY || 'LWP',
  decimals: Number(env.VITE_DECIMALS || '6'),
  gasPrice: env.VITE_GAS_PRICE || '0.025ulwp',
  tokenFactoryCreateDenomTypeUrl:
    env.VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL ||
    '/osmosis.tokenfactory.v1beta1.MsgCreateDenom',
  tokenFactoryMintTypeUrl:
    env.VITE_TOKENFACTORY_MINT_TYPE_URL ||
    '/osmosis.tokenfactory.v1beta1.MsgMint',
  tokenFactorySetMetadataTypeUrl:
    env.VITE_TOKENFACTORY_SET_METADATA_TYPE_URL ||
    '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata',
  tokenFactorySetMetadataGasMultiplier: Number(
    env.VITE_TOKENFACTORY_SET_METADATA_GAS_MULTIPLIER || '1.8'
  ),
  hasFaucet: true,
};

const MAINNET_CONFIG = {
  networkType: NETWORK_TYPE.MAINNET,
  chainId: 'lumiwaveprotocol',
  chainName: 'LumiWave Protocol Mainnet',
  rpc: 'https://lwp-mainnet-rpc.lumiwavelab.com',
  rest: 'https://lwp-mainnet-api.lumiwavelab.com',
  grpc: 'lwp-mainnet-grpc.lumiwavelab.com',
  bech32Prefix: 'lumi',
  denom: 'ulwp',
  displayDenom: 'LWP',
  decimals: 6,
  gasPrice: '0.025ulwp',
  tokenFactoryCreateDenomTypeUrl:
    '/osmosis.tokenfactory.v1beta1.MsgCreateDenom',
  tokenFactoryMintTypeUrl:
    '/osmosis.tokenfactory.v1beta1.MsgMint',
  tokenFactorySetMetadataTypeUrl:
    '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata',
  tokenFactorySetMetadataGasMultiplier: 1.8,
  hasFaucet: false,
};

export const NETWORKS = {
  [NETWORK_TYPE.TESTNET]: TESTNET_CONFIG,
  [NETWORK_TYPE.MAINNET]: MAINNET_CONFIG,
};

export const FAUCET_CONFIGS = {
  [NETWORK_TYPE.TESTNET]: {
    baseUrl: env.VITE_FAUCET || '',
    apiPath: (env.VITE_FAUCET_API || '').replace(/\/$/, ''),
  },
  [NETWORK_TYPE.MAINNET]: {
    baseUrl: '',
    apiPath: '',
  },
};

const STORAGE_KEY = 'lumiwave.selectedNetwork';

export function getSavedNetwork() {
  if (typeof window === 'undefined') return NETWORK_TYPE.TESTNET;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === NETWORK_TYPE.MAINNET || saved === NETWORK_TYPE.TESTNET) {
    return saved;
  }
  return NETWORK_TYPE.TESTNET;
}

export function saveNetwork(networkType) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, networkType);
}
