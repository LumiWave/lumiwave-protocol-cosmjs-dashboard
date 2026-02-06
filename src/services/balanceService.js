// src/services/balanceService.js

/**
 * 주소의 잔액을 조회
 */
export async function fetchBalances(address, restEndpoint) {
  const url = `${restEndpoint}cosmos/bank/v1beta1/balances/${address}`;
  
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Balance query failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json?.balances || [];
}
