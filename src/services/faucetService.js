// src/services/faucetService.js

import { safeStringify } from '../utils/formatters';

/**
 * Faucet 요청
 * @param {string} address - 받을 주소
 * @param {string} faucetApiBase - Faucet API 엔드포인트
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function requestFaucet(address, faucetApiBase) {
  if (!address) {
    throw new Error('Address is required');
  }

  if (!faucetApiBase) {
    throw new Error('VITE_FAUCET_API is not set');
  }

  const endpoint = `${faucetApiBase}/`;
  const body = {
    query: 'mutation($input: SendInput!) { send(input: $input) }',
    variables: { input: { toAddress: address } },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  // Rate limit 처리
  if (response.status === 429) {
    return {
      success: false,
      message: '⏳ Faucet limited: 1 request per IP per 24h. Try again later.',
    };
  }

  if (!response.ok) {
    throw new Error(`Faucet HTTP ${response.status}: ${text}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Unexpected faucet response: ${text}`);
  }

  if (!json?.data || json.data.send !== null) {
    throw new Error(`Unexpected faucet response: ${safeStringify(json)}`);
  }

  return {
    success: true,
    message: '✅ Faucet request successful. Tokens are being sent.',
  };
}
