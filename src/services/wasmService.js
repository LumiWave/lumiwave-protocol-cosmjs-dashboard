// src/services/wasmService.js

import { safeJsonParse, safeStringify } from '../utils/formatters';

/**
 * Upload WASM code (Store Code)
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} senderAddress - Sender address
 * @param {File} wasmFile - WASM file
 * @returns {Promise<Object>} Upload result
 */
export async function uploadWasm(client, senderAddress, wasmFile) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  if (!wasmFile) {
    throw new Error('WASM file is required');
  }

  const buffer = new Uint8Array(await wasmFile.arrayBuffer());
  const result = await client.upload(senderAddress, buffer, 'auto');

  return {
    codeId: result.codeId,
    txhash: result.transactionHash,
    height: result.height,
  };
}

/**
 * Instantiate contract
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} senderAddress - Sender address
 * @param {number} codeId - Code ID
 * @param {string} label - Label
 * @param {string} initMsgJson - Init message JSON
 * @param {string} adminAddress - Admin address (optional)
 * @returns {Promise<Object>} Instantiation result
 */
export async function instantiateContract(
  client,
  senderAddress,
  codeId,
  label,
  initMsgJson,
  adminAddress = ''
) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  if (!codeId || codeId <= 0) {
    throw new Error('Valid codeId is required');
  }

  if (!label || !label.trim()) {
    throw new Error('Label is required');
  }

  const parsed = safeJsonParse(initMsgJson);
  if (!parsed.ok) {
    throw new Error(`initMsg JSON error: ${parsed.error}`);
  }

  const options = adminAddress.trim() ? { admin: adminAddress.trim() } : undefined;

  const result = await client.instantiate(
    senderAddress,
    codeId,
    parsed.value,
    label.trim(),
    'auto',
    options
  );

  return {
    contractAddress: result.contractAddress,
    txhash: result.transactionHash,
    height: result.height,
  };
}
