// src/services/cw20Service.js

/**
 * Query CW20 token balance
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} contractAddress - CW20 token contract address
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Token info and balance
 */
export async function queryCW20Balance(client, contractAddress, address) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  // Query token info
  const tokenInfo = await client.queryContractSmart(contractAddress, {
    token_info: {},
  });

  // Query balance
  const balance = await client.queryContractSmart(contractAddress, {
    balance: { address },
  });

  return {
    contractAddress,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    balance: balance.balance,
    totalSupply: tokenInfo.total_supply,
  };
}

/**
 * Query balances for multiple CW20 tokens at once
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string[]} contractAddresses - CW20 token contract address array
 * @param {string} address - Wallet address
 * @returns {Promise<Object[]>} Token info and balance array
 */
export async function queryCW20Balances(client, contractAddresses, address) {
  if (!client || !contractAddresses || contractAddresses.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    contractAddresses.map((contractAddr) =>
      queryCW20Balance(client, contractAddr, address)
    )
  );

  // Return only successful results
  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}
