// src/services/walletService.js

import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { connectWallet, walletCapabilities } from '../wallets';

/**
 * Connect wallet and initialize clients
 * @param {string} walletType - Wallet type (keplr, leap, cosmostation)
 * @param {Object} chainInfo - Chain info
 * @param {string} gasPriceStr - Gas price string
 * @returns {Promise<Object>} Connection result
 */
export async function initializeWallet(walletType, chainInfo, gasPriceStr) {
  const gasPrice = GasPrice.fromString(gasPriceStr);

  // Connect wallet
  const { signer, address } = await connectWallet(walletType, chainInfo);

  // Stargate client (all wallets)
  const stargateClient = await SigningStargateClient.connectWithSigner(
    chainInfo.rpc,
    signer,
    { gasPrice }
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
