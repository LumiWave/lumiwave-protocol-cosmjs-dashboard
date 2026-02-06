// src/services/wasmService.js

import { safeJsonParse, safeStringify } from '../utils/formatters';

/**
 * WASM 코드 업로드 (Store Code)
 * @param {SigningCosmWasmClient} client - CosmWasm 클라이언트
 * @param {string} senderAddress - 발신자 주소
 * @param {File} wasmFile - WASM 파일
 * @returns {Promise<Object>} 업로드 결과
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
 * 컨트랙트 인스턴스화
 * @param {SigningCosmWasmClient} client - CosmWasm 클라이언트
 * @param {string} senderAddress - 발신자 주소
 * @param {number} codeId - Code ID
 * @param {string} label - 레이블
 * @param {string} initMsgJson - 초기화 메시지 JSON
 * @param {string} adminAddress - 관리자 주소 (선택)
 * @returns {Promise<Object>} 인스턴스화 결과
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
