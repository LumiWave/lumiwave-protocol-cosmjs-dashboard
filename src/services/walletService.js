// src/services/walletService.js

import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { connectWallet, walletCapabilities } from '../wallets';

/**
 * 지갑 연결 및 클라이언트 초기화
 * @param {string} walletType - 지갑 타입 (keplr, leap, cosmostation)
 * @param {Object} chainInfo - 체인 정보
 * @param {string} gasPriceStr - Gas price 문자열
 * @returns {Promise<Object>} 연결 결과
 */
export async function initializeWallet(walletType, chainInfo, gasPriceStr) {
  const gasPrice = GasPrice.fromString(gasPriceStr);

  // 지갑 연결
  const { signer, address } = await connectWallet(walletType, chainInfo);

  // Stargate 클라이언트 (모든 지갑)
  const stargateClient = await SigningStargateClient.connectWithSigner(
    chainInfo.rpc,
    signer,
    { gasPrice }
  );

  // CosmWasm 클라이언트 (Keplr, Leap만)
  let wasmClient = null;
  if (walletCapabilities(walletType).canWasm) {
    wasmClient = await SigningCosmWasmClient.connectWithSigner(
      chainInfo.rpc,
      signer,
      { gasPrice }
    );
  }

  // 현재 블록 높이 조회
  const height = await stargateClient.getHeight();

  return {
    address,
    stargateClient,
    wasmClient,
    height,
  };
}
