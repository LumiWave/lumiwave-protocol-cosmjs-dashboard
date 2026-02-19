// src/services/tokenFactoryService.js

import { CHAIN_CONFIG } from '../config/constants';

function ensureDeliverTxSuccess(result, action) {
  if (result?.code === 0) return;

  const code = result?.code ?? 'unknown';
  const rawLog = result?.rawLog || 'No rawLog';
  throw new Error(`${action} failed (code ${code}): ${rawLog}`);
}

function extractAttribute(events, keys = []) {
  if (!Array.isArray(events) || events.length === 0) return '';
  const keySet = new Set(keys.map((k) => k.toLowerCase()));

  for (const event of events) {
    if (!event?.attributes?.length) continue;

    for (const attr of event.attributes) {
      const key = String(attr?.key || '').toLowerCase();
      if (keySet.has(key) && attr?.value) {
        return String(attr.value);
      }
    }
  }

  return '';
}

function buildFactoryDenom(address, subdenom) {
  return `factory/${address}/${subdenom}`;
}

// 토큰 메타데이터 메시지 바디를 표준 구조로 만든다.
// base/display 단위를 포함해 지갑 표시 정보를 구성한다.
function buildTokenMetadata(denom, displayDenom, symbol, name, description, decimals, uri = '') {
  const units = [
    {
      denom,
      exponent: 0,
      aliases: [],
    },
  ];

  if (displayDenom && displayDenom !== denom) {
    units.push({
      denom: displayDenom,
      exponent: decimals,
      aliases: [],
    });
  }

  return {
    description: description || '',
    denomUnits: units,
    base: denom,
    display: displayDenom || denom,
    name: name || symbol || displayDenom || denom,
    symbol: symbol || displayDenom || denom,
    uri: uri || '',
    uriHash: '',
  };
}

export async function createTokenFactoryDenom(client, senderAddress, subdenom, memo = '') {
  if (!client) {
    throw new Error('Stargate client not initialized');
  }

  if (!senderAddress?.trim()) {
    throw new Error('Sender address is required');
  }

  const cleanSubdenom = (subdenom || '').trim();
  if (!cleanSubdenom) {
    throw new Error('Subdenom is required');
  }
  if (/\s/.test(cleanSubdenom)) {
    throw new Error('Subdenom cannot include whitespace');
  }
  if (cleanSubdenom.length > 44) {
    throw new Error('Subdenom must be 44 chars or less');
  }

  const typeUrl = CHAIN_CONFIG.tokenFactoryCreateDenomTypeUrl;
  if (!typeUrl?.trim()) {
    throw new Error('Tokenfactory create-denom type URL is not configured');
  }

  const result = await client.signAndBroadcast(
    senderAddress,
    [
      {
        typeUrl,
        value: {
          sender: senderAddress,
          subdenom: cleanSubdenom,
        },
      },
    ],
    'auto',
    memo.trim() || undefined
  );

  ensureDeliverTxSuccess(result, 'Create denom');

  const newDenom =
    extractAttribute(result.events, ['new_token_denom', 'new_denom', 'denom']) ||
    buildFactoryDenom(senderAddress, cleanSubdenom);

  return {
    subdenom: cleanSubdenom,
    newDenom,
    txhash: result.transactionHash,
    height: result.height,
    gasUsed: result.gasUsed,
    gasWanted: result.gasWanted,
  };
}

export async function mintTokenFactoryDenom(
  client,
  senderAddress,
  denom,
  baseAmount,
  mintToAddress = '',
  memo = ''
) {
  if (!client) {
    throw new Error('Stargate client not initialized');
  }

  if (!senderAddress?.trim()) {
    throw new Error('Sender address is required');
  }

  const cleanDenom = (denom || '').trim();
  if (!cleanDenom) {
    throw new Error('Denom is required');
  }

  let normalizedAmount;
  try {
    normalizedAmount = BigInt(baseAmount).toString();
  } catch {
    throw new Error('Amount must be a valid number');
  }

  if (BigInt(normalizedAmount) <= 0n) {
    throw new Error('Amount must be greater than 0');
  }

  const typeUrl = CHAIN_CONFIG.tokenFactoryMintTypeUrl;
  if (!typeUrl?.trim()) {
    throw new Error('Tokenfactory mint type URL is not configured');
  }

  const mintTo = mintToAddress?.trim() || senderAddress;

  const result = await client.signAndBroadcast(
    senderAddress,
    [
      {
        typeUrl,
        value: {
          sender: senderAddress,
          amount: {
            denom: cleanDenom,
            amount: normalizedAmount,
          },
          mintToAddress: mintTo,
        },
      },
    ],
    'auto',
    memo.trim() || undefined
  );

  ensureDeliverTxSuccess(result, 'Mint token');

  return {
    denom: cleanDenom,
    amount: normalizedAmount,
    mintToAddress: mintTo,
    txhash: result.transactionHash,
    height: result.height,
    gasUsed: result.gasUsed,
    gasWanted: result.gasWanted,
  };
}

// Tokenfactory denom 메타데이터를 체인에 등록한다.
// Keplr 같은 지갑에서 심볼/소수점 표시가 가능하도록 설정한다.
export async function setTokenFactoryDenomMetadata(
  client,
  senderAddress,
  denom,
  {
    displayDenom,
    symbol = '',
    name = '',
    description = '',
    decimals = 6,
    uri = '',
  },
  memo = ''
) {
  if (!client) {
    throw new Error('Stargate client not initialized');
  }

  if (!senderAddress?.trim()) {
    throw new Error('Sender address is required');
  }

  const cleanDenom = (denom || '').trim();
  if (!cleanDenom) {
    throw new Error('Denom is required');
  }

  const cleanDisplayDenom = (displayDenom || '').trim();
  if (!cleanDisplayDenom) {
    throw new Error('Display denom is required');
  }

  const parsedDecimals = Number(decimals);
  if (!Number.isInteger(parsedDecimals) || parsedDecimals < 0 || parsedDecimals > 18) {
    throw new Error('Decimals must be an integer between 0 and 18');
  }

  const metadata = buildTokenMetadata(
    cleanDenom,
    cleanDisplayDenom,
    (symbol || '').trim(),
    (name || '').trim(),
    (description || '').trim(),
    parsedDecimals,
    (uri || '').trim()
  );

  const typeUrl = CHAIN_CONFIG.tokenFactorySetMetadataTypeUrl;
  if (!typeUrl?.trim()) {
    throw new Error('Tokenfactory set-metadata type URL is not configured');
  }
  const metadataGasMultiplier =
    Number.isFinite(CHAIN_CONFIG.tokenFactorySetMetadataGasMultiplier) &&
    CHAIN_CONFIG.tokenFactorySetMetadataGasMultiplier > 1
      ? CHAIN_CONFIG.tokenFactorySetMetadataGasMultiplier
      : 1.8;

  const result = await client.signAndBroadcast(
    senderAddress,
    [
      {
        typeUrl,
        value: {
          sender: senderAddress,
          metadata,
        },
      },
    ],
    metadataGasMultiplier,
    memo.trim() || undefined
  );

  ensureDeliverTxSuccess(result, 'Set denom metadata');

  return {
    denom: cleanDenom,
    displayDenom: cleanDisplayDenom,
    symbol: metadata.symbol,
    name: metadata.name,
    decimals: parsedDecimals,
    txhash: result.transactionHash,
    height: result.height,
    gasUsed: result.gasUsed,
    gasWanted: result.gasWanted,
  };
}
