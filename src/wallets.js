// src/wallets.js
export const WALLET = {
  KEPLR: "keplr",
  LEAP: "leap",
  COSMOSTATION: "cosmostation",
};

export function getInjectedProvider(type) {
  const w = window;

  if (type === WALLET.KEPLR) {
    return w.keplr || null;
  }

  if (type === WALLET.LEAP) {
    // Leap can inject window.leap or provide Keplr-compatible APIs
    return w.leap || w.keplr || null;
  }

  if (type === WALLET.COSMOSTATION) {
    // Cosmostation extension often exposes a Keplr-compatible provider under providers.keplr
    return (
      w.cosmostation?.providers?.keplr ||
      w.cosmostation?.keplr ||
      w.cosmostation ||
      null
    );
  }

  return null;
}

export function getAvailableWallets() {
  return [
    { type: WALLET.KEPLR, name: "Keplr", available: !!getInjectedProvider(WALLET.KEPLR) },
    { type: WALLET.LEAP, name: "Leap", available: !!getInjectedProvider(WALLET.LEAP) },
    { type: WALLET.COSMOSTATION, name: "Cosmostation", available: !!getInjectedProvider(WALLET.COSMOSTATION) },
  ];
}

export function walletCapabilities(type) {
  // Policy: Cosmostation supports only Bank Send in this app
  if (type === WALLET.COSMOSTATION) {
    return {
      canWasm: false,
      canBankSend: true,
      label: "Bank Send only",
    };
  }
  return {
    canWasm: true,
    canBankSend: true,
    label: "Full features",
  };
}

export async function connectWallet(type, chainInfo) {
  const provider = getInjectedProvider(type);
  if (!provider) throw new Error(`${type} wallet not found`);

  // Suggest chain (if supported)
  if (provider.experimentalSuggestChain) {
    await provider.experimentalSuggestChain(chainInfo);
  }

  // Enable chain
  if (provider.enable) {
    await provider.enable(chainInfo.chainId);
  } else {
    // Some providers expose enable via nested api
    throw new Error(`${type} does not support enable()`);
  }

  // Get signer
  // Prefer provider.getOfflineSignerAuto; fallback to getOfflineSigner; last resort window.getOfflineSigner
  let signer = null;

  if (provider.getOfflineSignerAuto) {
    signer = await provider.getOfflineSignerAuto(chainInfo.chainId);
  } else if (provider.getOfflineSigner) {
    signer = provider.getOfflineSigner(chainInfo.chainId);
  } else if (window.getOfflineSigner) {
    signer = window.getOfflineSigner(chainInfo.chainId);
  }

  if (!signer) throw new Error(`${type} signer not available`);

  // Get accounts
  const accounts = await signer.getAccounts();
  const address = accounts?.[0]?.address;
  if (!address) throw new Error(`${type} returned no accounts`);

  return { provider, signer, address };
}
