// src/services/walletService.js

import { Registry } from '@cosmjs/proto-signing';
import { GasPrice, SigningStargateClient, defaultRegistryTypes } from '@cosmjs/stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { connectWallet, walletCapabilities } from '../wallets';
import { getTokenFactoryRegistryTypes } from './tokenFactoryTypes';

/**
 * Connect wallet and initialize clients
 * @param {string} walletType - Wallet type (keplr, leap, cosmostation)
 * @param {Object} chainInfo - Chain info
 * @param {string} gasPriceStr - Gas price string
 * @param {Object} tokenFactoryTypeUrls - Tokenfactory message type URLs
 * @returns {Promise<Object>} Connection result
 */
export async function initializeWallet(walletType, chainInfo, gasPriceStr, tokenFactoryTypeUrls = {}) {
  const gasPrice = GasPrice.fromString(gasPriceStr);
  const registry = new Registry(defaultRegistryTypes);
  const registryEntries = getTokenFactoryRegistryTypes(
    tokenFactoryTypeUrls.createDenomTypeUrl,
    tokenFactoryTypeUrls.mintTypeUrl,
    tokenFactoryTypeUrls.setMetadataTypeUrl
  );
  registryEntries.forEach(([typeUrl, type]) => registry.register(typeUrl, type));

  // Connect wallet
  const { signer, address } = await connectWallet(walletType, chainInfo);

  // Stargate client (all wallets)
  const stargateClient = await SigningStargateClient.connectWithSigner(
    chainInfo.rpc,
    signer,
    { gasPrice, registry }
  );

  // CosmWasm client (Keplr and Leap only)
  let wasmClient = null;
  if (walletCapabilities(walletType).canWasm) {
    wasmClient = await SigningCosmWasmClient.connectWithSigner(
      chainInfo.rpc,
      signer,
      { gasPrice }
    );
  }

  // Fetch current block height
  const height = await stargateClient.getHeight();

  return {
    address,
    stargateClient,
    wasmClient,
    height,
  };
}
