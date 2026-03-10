// chainConfig: networks.js 형식 또는 VITE_* env 형식 모두 지원
export function buildChainInfo(cfg, options = {}) {
  // networks.js 형식이면 직접 사용, env 형식이면 변환
  const isNetworkConfig = !!cfg.bech32Prefix;
  const prefix = isNetworkConfig ? cfg.bech32Prefix : cfg.VITE_BECH32_PREFIX;
  const baseCurrency = {
    coinDenom: isNetworkConfig ? cfg.displayDenom : cfg.VITE_DENOM_DISPLAY,
    coinMinimalDenom: isNetworkConfig ? cfg.denom : cfg.VITE_DENOM,
    coinDecimals: Number(isNetworkConfig ? cfg.decimals : cfg.VITE_DECIMALS),
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
    chainId: isNetworkConfig ? cfg.chainId : cfg.VITE_CHAIN_ID,
    chainName: isNetworkConfig ? cfg.chainName : cfg.VITE_CHAIN_NAME,
    rpc: isNetworkConfig ? cfg.rpc : cfg.VITE_RPC,
    rest: isNetworkConfig ? cfg.rest : cfg.VITE_REST,

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
