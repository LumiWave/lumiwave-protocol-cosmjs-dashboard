export function buildChainInfo(env, options = {}) {
  const prefix = env.VITE_BECH32_PREFIX;
  const baseCurrency = {
    coinDenom: env.VITE_DENOM_DISPLAY,
    coinMinimalDenom: env.VITE_DENOM,
    coinDecimals: Number(env.VITE_DECIMALS),
  };
  const extraCurrencies = Array.isArray(options.extraCurrencies) ? options.extraCurrencies : [];
  const currencies = [baseCurrency];
  const minimalDenoms = new Set([String(baseCurrency.coinMinimalDenom)]);

  for (const currency of extraCurrencies) {
    const minimalDenom = String(currency?.coinMinimalDenom || '').trim();
    const coinDenom = String(currency?.coinDenom || '').trim();
    const coinDecimals = Number(currency?.coinDecimals);

    if (!minimalDenom || !coinDenom || !Number.isFinite(coinDecimals) || coinDecimals < 0) {
      continue;
    }

    if (minimalDenoms.has(minimalDenom)) {
      continue;
    }

    currencies.push({
      coinDenom,
      coinMinimalDenom: minimalDenom,
      coinDecimals: coinDecimals,
    });
    minimalDenoms.add(minimalDenom);
  }

  return {
    chainId: env.VITE_CHAIN_ID,
    chainName: env.VITE_CHAIN_NAME,
    rpc: env.VITE_RPC,
    rest: env.VITE_REST,

    bip44: { coinType: 118 },

    bech32Config: {
      bech32PrefixAccAddr: prefix,
      bech32PrefixAccPub: `${prefix}pub`,
      bech32PrefixValAddr: `${prefix}valoper`,
      bech32PrefixValPub: `${prefix}valoperpub`,
      bech32PrefixConsAddr: `${prefix}valcons`,
      bech32PrefixConsPub: `${prefix}valconspub`,
    },

    currencies,

    feeCurrencies: [baseCurrency],

    stakeCurrency: baseCurrency,

    gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },

    // Important for CosmWasm tx support
    features: ["cosmwasm"],
  };
}

export async function connectKeplr(chainInfo) {
  if (!window.keplr) throw new Error("Keplr not installed");

  await window.keplr.experimentalSuggestChain(chainInfo);
  await window.keplr.enable(chainInfo.chainId);

  const signer =
    window.keplr.getOfflineSignerAuto
      ? await window.keplr.getOfflineSignerAuto(chainInfo.chainId)
      : window.getOfflineSigner(chainInfo.chainId);

  return signer;
}
