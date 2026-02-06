// src/services/bankService.js

import { coins } from '@cosmjs/stargate';
import { safeStringify } from '../utils/formatters';

/**
 * 토큰 전송
 * @param {SigningStargateClient} client - Stargate 클라이언트
 * @param {string} fromAddress - 발신자 주소
 * @param {string} toAddress - 수신자 주소
 * @param {string} amount - Base 단위 금액
 * @param {string} denom - Denomination
 * @param {string} memo - 메모 (선택)
 * @returns {Promise<Object>} 트랜잭션 결과
 */
export async function sendTokens(client, fromAddress, toAddress, amount, denom, memo = '') {
  if (!client) {
    throw new Error('Client not initialized');
  }

  if (!toAddress || !toAddress.trim()) {
    throw new Error('Recipient address is required');
  }

  if (BigInt(amount) <= 0n) {
    throw new Error('Amount must be greater than 0');
  }

  const result = await client.sendTokens(
    fromAddress,
    toAddress.trim(),
    coins(amount, denom),
    'auto',
    memo || undefined
  );

  // BigInt가 포함될 수 있으므로 안전하게 처리
  return {
    txhash: result.transactionHash,
    height: result.height,
    gasUsed: result.gasUsed,
    gasWanted: result.gasWanted,
  };
}
