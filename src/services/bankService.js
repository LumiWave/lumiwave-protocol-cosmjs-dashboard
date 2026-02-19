// src/services/bankService.js

import { coins } from '@cosmjs/stargate';

/**
 * Send tokens
 * @param {SigningStargateClient} client - Stargate client
 * @param {string} fromAddress - Sender address
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in base unit
 * @param {string} denom - Denomination
 * @param {string} memo - Memo (optional)
 * @returns {Promise<Object>} Transaction result
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

  // Keep return payload BigInt-safe
  return {
    txhash: result.transactionHash,
    height: result.height,
    gasUsed: result.gasUsed,
    gasWanted: result.gasWanted,
  };
}
