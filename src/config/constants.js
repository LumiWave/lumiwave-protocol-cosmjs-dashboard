// src/config/constants.js

const env = import.meta.env;

export const CHAIN_CONFIG = {
  chainId: env.VITE_CHAIN_ID || 'lumiwaveprotocol',
  chainName: env.VITE_CHAIN_NAME || 'LumiWave Protocol Testnet',
  rpc: env.VITE_RPC || '',
  rest: env.VITE_REST || '',
  bech32Prefix: env.VITE_BECH32_PREFIX || 'lumi',
  denom: env.VITE_DENOM || 'ulwp',
  displayDenom: env.VITE_DENOM_DISPLAY || 'LWP',
  decimals: Number(env.VITE_DECIMALS || '6'),
  gasPrice: env.VITE_GAS_PRICE || '0.025ulwp',
  tokenFactoryCreateDenomTypeUrl:
    env.VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL ||
    '/osmosis.tokenfactory.v1beta1.MsgCreateDenom',
  tokenFactoryMintTypeUrl:
    env.VITE_TOKENFACTORY_MINT_TYPE_URL || '/osmosis.tokenfactory.v1beta1.MsgMint',
  tokenFactorySetMetadataTypeUrl:
    env.VITE_TOKENFACTORY_SET_METADATA_TYPE_URL ||
    '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata',
  tokenFactorySetMetadataGasMultiplier: Number(
    env.VITE_TOKENFACTORY_SET_METADATA_GAS_MULTIPLIER || '1.8'
  ),
};

export const FAUCET_CONFIG = {
  baseUrl: env.VITE_FAUCET || '',
  apiPath: (env.VITE_FAUCET_API || '').replace(/\/$/, ''),
};

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
