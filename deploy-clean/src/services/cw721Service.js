// src/services/cw721Service.js

import { safeJsonParse } from '../utils/formatters';

/**
 * Instantiate a CW721 NFT contract
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} senderAddress - Sender address
 * @param {number} codeId - Code ID
 * @param {string} name - NFT collection name
 * @param {string} symbol - NFT symbol
 * @param {string} minter - Minter address
 * @param {string} adminAddress - Admin address (optional)
 * @returns {Promise<Object>} Instantiation result
 */
export async function instantiateCW721(
  client,
  senderAddress,
  codeId,
  name,
  symbol,
  minter,
  adminAddress = ''
) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  if (!codeId || codeId <= 0) {
    throw new Error('Valid codeId is required');
  }

  if (!name || !name.trim()) {
    throw new Error('Collection name is required');
  }

  if (!symbol || !symbol.trim()) {
    throw new Error('Symbol is required');
  }

  const initMsg = {
    name: name.trim(),
    symbol: symbol.trim(),
    minter: minter || senderAddress,
  };

  const label = `${name.trim()}-nft-collection`;
  const options = adminAddress.trim() ? { admin: adminAddress.trim() } : undefined;

  const result = await client.instantiate(
    senderAddress,
    codeId,
    initMsg,
    label,
    'auto',
    options
  );

  return {
    contractAddress: result.contractAddress,
    txhash: result.transactionHash,
    height: result.height,
  };
}

/**
 * Mint an NFT
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} senderAddress - Sender address (must be minter)
 * @param {string} contractAddress - NFT contract address
 * @param {string} tokenId - Token ID
 * @param {string} owner - NFT owner address
 * @param {string} tokenUri - Token metadata URI (optional)
 * @returns {Promise<Object>} Mint result
 */
export async function mintNFT(
  client,
  senderAddress,
  contractAddress,
  tokenId,
  owner,
  tokenUri = ''
) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  const msg = {
    mint: {
      token_id: tokenId,
      owner: owner || senderAddress,
      token_uri: tokenUri,
    },
  };

  const result = await client.execute(
    senderAddress,
    contractAddress,
    msg,
    'auto'
  );

  return {
    txhash: result.transactionHash,
    height: result.height,
  };
}

/**
 * Query NFTs owned by a user
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} contractAddress - NFT contract address
 * @param {string} owner - Owner address
 * @param {number} limit - Query limit (default: 30)
 * @returns {Promise<Object>} NFT list
 */
export async function queryNFTsByOwner(client, contractAddress, owner, limit = 30) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  try {
    const result = await client.queryContractSmart(contractAddress, {
      tokens: {
        owner,
        limit,
      },
    });

    return {
      contractAddress,
      tokens: result.tokens || [],
    };
  } catch (error) {
    console.error('NFT query error:', error);
    return {
      contractAddress,
      tokens: [],
      error: error.message,
    };
  }
}

/**
 * Query NFT details
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} contractAddress - NFT contract address
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} NFT details
 */
export async function queryNFTInfo(client, contractAddress, tokenId) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  const nftInfo = await client.queryContractSmart(contractAddress, {
    nft_info: { token_id: tokenId },
  });

  const ownerInfo = await client.queryContractSmart(contractAddress, {
    owner_of: { token_id: tokenId },
  });

  return {
    tokenId,
    owner: ownerInfo.owner,
    tokenUri: nftInfo.token_uri,
    extension: nftInfo.extension,
  };
}

/**
 * Query NFT collection info
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string} contractAddress - NFT contract address
 * @returns {Promise<Object>} Collection info
 */
export async function queryNFTCollectionInfo(client, contractAddress) {
  if (!client) {
    throw new Error('CosmWasm client not initialized');
  }

  try {
    const contractInfo = await client.queryContractSmart(contractAddress, {
      contract_info: {},
    });

    const numTokens = await client.queryContractSmart(contractAddress, {
      num_tokens: {},
    });

    return {
      contractAddress,
      name: contractInfo.name,
      symbol: contractInfo.symbol,
      numTokens: numTokens.count,
    };
  } catch (error) {
    console.error('Collection info query error:', error);
    return {
      contractAddress,
      error: error.message,
    };
  }
}

/**
 * Query owned NFTs across multiple collections
 * @param {SigningCosmWasmClient} client - CosmWasm client
 * @param {string[]} contractAddresses - NFT contract address array
 * @param {string} owner - Owner address
 * @returns {Promise<Object[]>} NFT list array
 */
export async function queryMultipleNFTCollections(client, contractAddresses, owner) {
  if (!client || !contractAddresses || contractAddresses.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    contractAddresses.map(async (contractAddr) => {
      const [collectionInfo, nfts] = await Promise.all([
        queryNFTCollectionInfo(client, contractAddr),
        queryNFTsByOwner(client, contractAddr, owner),
      ]);

      return {
        ...collectionInfo,
        ownedTokens: nfts.tokens,
      };
    })
  );

  // Return only successful results
  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}
