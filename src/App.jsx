// src/App.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

import { getInjectedProvider, walletCapabilities } from './wallets';
import { CHAIN_CONFIG, TABS, WALLET_STATUS } from './config/constants';
import { buildChainInfo } from './keplr';

import { useWallet } from './hooks/useWallet';
import { useAllBalances } from './hooks/useAllBalances';
import { useFaucet } from './hooks/useFaucet';
import { useBankSend } from './hooks/useBankSend';
import { useWasmDeploy } from './hooks/useWasmDeploy';
import { useCW721Deploy } from './hooks/useCW721Deploy';
import { useNFTMint } from './hooks/useNFTMint';
import { useTokenFactory } from './hooks/useTokenFactory';
import { fetchDenomMetadata, toCurrencyFromDenomMetadata } from './services/denomMetadataService';
import {
  buildCurrencyIndex,
  mergeCurrenciesByDenom,
  readExtraCurrenciesFromStorage,
} from './utils/currencies';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { WalletModal } from './components/wallet/WalletModal';
import { Overview } from './components/dashboard/Overview';
import { AssetList } from './components/dashboard/AssetList';
import { QuickActions } from './components/dashboard/QuickActions';
import { FaucetSection } from './components/faucet/FaucetSection';
import { BankSendSection } from './components/bank/BankSendSection';
import { WasmDeploySection } from './components/wasm/WasmDeploySection';
import { NFTDeploySection } from './components/nft/NFTDeploySection';
import { NFTMintSection } from './components/nft/NFTMintSection';
import { TokenFactorySection } from './components/tokenfactory/TokenFactorySection';

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [modalOpen, setModalOpen] = useState(false);
  const [extraCurrencies, setExtraCurrencies] = useState(() => readExtraCurrenciesFromStorage());
  const [walletSyncResult, setWalletSyncResult] = useState('');
  const [syncingWalletAssets, setSyncingWalletAssets] = useState(false);

  // Wallet
  const wallet = useWallet();
  const { status, walletType, address, height, stargateClient, wasmClient, setStatus } = wallet;

  // All Balances (Native + CW20 + NFT)
  const balances = useAllBalances();
  const { refreshAllBalances } = balances;

  // Faucet
  const faucet = useFaucet();

  // Bank Send
  const bankSend = useBankSend(balances.nativeBalances, extraCurrencies);

  // Token Factory
  const tokenFactory = useTokenFactory(address);

  // WASM Deploy (including CW20)
  const wasmDeploy = useWasmDeploy(address);

  // CW721 Deploy
  const cw721Deploy = useCW721Deploy(address);

  // NFT Mint
  const nftMint = useNFTMint();

  // Derived states
  const connected = status === WALLET_STATUS.CONNECTED || status === WALLET_STATUS.ADDRESS_COPIED;
  const canWasm = walletType ? walletCapabilities(walletType).canWasm : false;
  const currencyIndex = useMemo(() => buildCurrencyIndex(extraCurrencies), [extraCurrencies]);
  const walletAssets = useMemo(() => {
    return balances.nativeBalances.map((balance) => {
      const denom = String(balance?.denom || '').trim();
      const currency = currencyIndex[denom];
      const fallbackDecimals = denom === CHAIN_CONFIG.denom ? CHAIN_CONFIG.decimals : 0;

      return {
        denom,
        amount: String(balance?.amount || '0'),
        displayDenom: currency?.coinDenom || denom,
        decimals: Number(currency?.coinDecimals ?? fallbackDecimals),
      };
    });
  }, [balances.nativeBalances, currencyIndex]);
  const busy =
    status.startsWith('Suggesting') ||
    status.startsWith('Connecting') ||
    status.startsWith('Uploading') ||
    status.startsWith('Instantiating') ||
    status.startsWith('Sending') ||
    status.startsWith('Requesting') ||
    faucet.loading ||
    bankSend.loading ||
    tokenFactory.loading ||
    wasmDeploy.loading ||
    cw721Deploy.loading ||
    nftMint.loading ||
    balances.loading;

  // Handlers
  const handleConnectWallet = async (type) => {
    setModalOpen(false);
    const result = await wallet.connect(type);
    await refreshAllBalances(result.address);
  };

  useEffect(() => {
    if (!connected || !address) return;
    setExtraCurrencies(readExtraCurrenciesFromStorage());
    refreshAllBalances(address);
  }, [connected, address, refreshAllBalances]);

  // 잔고에 있는 denom 메타데이터를 조회해 지갑 통화 목록을 동기화한다.
  // factory 토큰이 Keplr/Leap에 누락되는 상황을 줄이기 위해 체인 정보를 재제안한다.
  const syncWalletCurrenciesFromBalances = useCallback(async ({ force = false } = {}) => {
    if (!connected || !walletType) {
      return { ok: false, reason: 'wallet not connected' };
    }

    const provider = getInjectedProvider(walletType);
    if (!provider?.experimentalSuggestChain) {
      return { ok: false, reason: 'wallet does not support suggest chain' };
    }

    const nativeDenoms = balances.nativeBalances
      .map((balance) => String(balance?.denom || '').trim())
      .filter((denom) => denom && denom !== CHAIN_CONFIG.denom);
    const savedExtraCurrencies = readExtraCurrenciesFromStorage();
    let mergedExtraCurrencies = savedExtraCurrencies;
    let discoveredCount = 0;

    try {
      setSyncingWalletAssets(true);

      if (nativeDenoms.length) {
        const discoveredCurrencies = (
          await Promise.all(
            nativeDenoms.map(async (denom) => {
              const metadata = await fetchDenomMetadata(CHAIN_CONFIG.rest, denom);
              return toCurrencyFromDenomMetadata(metadata, denom);
            })
          )
        ).filter(Boolean);
        discoveredCount = discoveredCurrencies.length;
        mergedExtraCurrencies = mergeCurrenciesByDenom(savedExtraCurrencies, discoveredCurrencies);
      }

      const hasChanged = JSON.stringify(savedExtraCurrencies) !== JSON.stringify(mergedExtraCurrencies);

      if (hasChanged) {
        window.localStorage.setItem('lumiwave.extraCurrencies', JSON.stringify(mergedExtraCurrencies));
        setExtraCurrencies(mergedExtraCurrencies);
      }

      if (!force && !hasChanged) {
        return { ok: true, changed: false, discoveredCount, syncedCount: mergedExtraCurrencies.length };
      }

      const updatedChainInfo = buildChainInfo(import.meta.env, {
        extraCurrencies: mergedExtraCurrencies,
      });
      await provider.experimentalSuggestChain(updatedChainInfo);

      if (provider.enable) {
        await provider.enable(updatedChainInfo.chainId);
      }

      return { ok: true, changed: hasChanged, discoveredCount, syncedCount: mergedExtraCurrencies.length };
    } catch (error) {
      console.warn('Wallet currency sync warning:', error);
      return { ok: false, error: error?.message || 'wallet sync failed' };
    } finally {
      setSyncingWalletAssets(false);
    }
  }, [balances.nativeBalances, connected, walletType]);

  useEffect(() => {
    syncWalletCurrenciesFromBalances();
  }, [syncWalletCurrenciesFromBalances]);

  // 지갑에 코인/토큰 메타데이터를 강제로 재동기화한다.
  // 사용자가 버튼으로 직접 실행해 표시 누락을 즉시 보정할 수 있게 한다.
  const handleSyncWalletAssets = useCallback(async () => {
    setStatus('Syncing wallet assets...');
    const syncResult = await syncWalletCurrenciesFromBalances({ force: true });
    if (syncResult?.ok) {
      setWalletSyncResult(
        `Synced: ${syncResult.syncedCount || 0} tokens (discovered ${syncResult.discoveredCount || 0})`
      );
      setStatus(WALLET_STATUS.CONNECTED);
      return;
    }

    const errorMessage = syncResult?.error || syncResult?.reason || 'wallet sync failed';
    setWalletSyncResult(`Sync failed: ${errorMessage}`);
    setStatus(errorMessage);
  }, [syncWalletCurrenciesFromBalances, setStatus]);

  const handleRequestFaucet = async () => {
    setStatus('Requesting faucet...');
    await faucet.request(address, () => balances.refreshAllBalances(address, wasmClient));
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleSend = async () => {
    setStatus('Sending tokens...');
    await bankSend.send(stargateClient, address, () =>
      balances.refreshAllBalances(address, wasmClient)
    );
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleUploadWasm = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support CosmWasm deploy in this tool.');
    }
    setStatus('Uploading WASM (Store Code)...');
    await wasmDeploy.upload(wasmClient, address);
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleCreateTokenDenom = async () => {
    setStatus('Creating tokenfactory denom...');
    await tokenFactory.createDenom(stargateClient, address, () => balances.refreshAllBalances(address));
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleMintToken = async () => {
    setStatus('Minting tokenfactory token...');
    await tokenFactory.mint(stargateClient, address, () => balances.refreshAllBalances(address));
    setStatus(WALLET_STATUS.CONNECTED);
  };

  // 발행한 factory denom의 메타데이터를 체인에 등록한다.
  // 지갑에서 토큰 심볼과 소수점이 보이도록 설정한다.
  const handleSetTokenMetadata = async () => {
    setStatus('Setting token metadata...');
    const metadataTx = await tokenFactory.setMetadata(stargateClient, address, () =>
      balances.refreshAllBalances(address)
    );
    const createdCurrency = metadataTx
      ? {
          coinDenom: metadataTx.displayDenom || metadataTx.symbol || metadataTx.denom,
          coinMinimalDenom: metadataTx.denom,
          coinDecimals: Number(metadataTx.decimals),
        }
      : null;

    if (createdCurrency && Number.isFinite(createdCurrency.coinDecimals)) {
      const savedExtraCurrencies = readExtraCurrenciesFromStorage();
      const mergedExtraCurrencies = mergeCurrenciesByDenom(savedExtraCurrencies, [createdCurrency]);
      window.localStorage.setItem('lumiwave.extraCurrencies', JSON.stringify(mergedExtraCurrencies));
      setExtraCurrencies(mergedExtraCurrencies);

      const provider = getInjectedProvider(walletType);
      if (provider?.experimentalSuggestChain) {
        setStatus('Syncing wallet token list...');
        const updatedChainInfo = buildChainInfo(import.meta.env, {
          extraCurrencies: mergedExtraCurrencies,
        });
        await provider.experimentalSuggestChain(updatedChainInfo);
      }
    }

    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleInstantiate = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support CosmWasm deploy in this tool.');
    }
    setStatus('Instantiating contract...');
    await wasmDeploy.instantiate(wasmClient, address);
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleUploadCW721 = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    setStatus('Uploading CW721 WASM...');
    await cw721Deploy.upload(wasmClient, address);
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleInstantiateCW721 = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    setStatus('Deploying NFT collection...');
    await cw721Deploy.instantiate(wasmClient, address);
    setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleMintNFT = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    setStatus('Minting NFT...');
    await nftMint.mint(wasmClient, address);
    setStatus(WALLET_STATUS.CONNECTED);
    // Refresh NFT collections after minting
    balances.refreshNFTCollections(wasmClient, address);
  };

  return (
    <div className="kapp">
      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPick={handleConnectWallet}
      />

      <Sidebar
        active={activeTab}
        setActive={setActiveTab}
        walletType={walletType}
        address={address}
        connected={connected}
        canWasm={canWasm}
      />

      <main className="kmain">
        <TopBar
          status={status}
          onConnectWallet={() => setModalOpen(true)}
          onCopyAddress={wallet.copyAddress}
          address={address}
          busy={busy}
        />

        {activeTab === TABS.DASHBOARD && (
          <>
            <div className="kgrid">
              <Overview
                walletType={walletType}
                address={address}
                height={height}
                nativeBalances={balances.nativeBalances}
                balancesText={balances.formattedNativeBalances}
              />

              <QuickActions
                address={address}
                busy={busy}
                canWasm={canWasm}
                onRequestFaucet={handleRequestFaucet}
                onRefreshBalances={() => balances.refreshAllBalances(address, wasmClient)}
                setActive={setActiveTab}
                faucetResult={faucet.result}
                sendResult={bankSend.result}
                uploadResult={wasmDeploy.uploadResult}
                instantiateResult={wasmDeploy.instantiateResult}
              />
            </div>

            <AssetList
              address={address}
              assets={walletAssets}
              syncing={syncingWalletAssets}
              onSync={handleSyncWalletAssets}
              syncResult={walletSyncResult}
            />
          </>
        )}

        {activeTab === TABS.FAUCET && (
          <FaucetSection
            address={address}
            busy={busy}
            balancesText={balances.formattedNativeBalances}
            faucetResult={faucet.result}
            onRequestFaucet={handleRequestFaucet}
            onRefreshBalances={() => balances.refreshAllBalances(address, wasmClient)}
          />
        )}

        {activeTab === TABS.SEND && (
          <BankSendSection
            address={address}
            busy={busy}
            nativeBalances={balances.nativeBalances}
            toAddress={bankSend.toAddress}
            setToAddress={bankSend.setToAddress}
            amount={bankSend.amount}
            setAmount={bankSend.setAmount}
            selectedDenom={bankSend.selectedDenom}
            setSelectedDenom={bankSend.setSelectedDenom}
            selectedCoin={bankSend.selectedCoin}
            coinOptions={bankSend.coinOptions}
            memo={bankSend.memo}
            setMemo={bankSend.setMemo}
            sendResult={bankSend.result}
            onSend={handleSend}
            onRefreshBalances={() => balances.refreshAllBalances(address, wasmClient)}
          />
        )}

        {activeTab === TABS.TOKEN_FACTORY && (
          <TokenFactorySection
            address={address}
            busy={busy}
            subdenom={tokenFactory.subdenom}
            setSubdenom={tokenFactory.setSubdenom}
            createMemo={tokenFactory.createMemo}
            setCreateMemo={tokenFactory.setCreateMemo}
            createdDenom={tokenFactory.createdDenom}
            createResult={tokenFactory.createResult}
            mintDenom={tokenFactory.mintDenom}
            setMintDenom={tokenFactory.setMintDenom}
            mintAmount={tokenFactory.mintAmount}
            setMintAmount={tokenFactory.setMintAmount}
            mintToAddress={tokenFactory.mintToAddress}
            setMintToAddress={tokenFactory.setMintToAddress}
            mintMemo={tokenFactory.mintMemo}
            setMintMemo={tokenFactory.setMintMemo}
            mintResult={tokenFactory.mintResult}
            metadataDenom={tokenFactory.metadataDenom}
            setMetadataDenom={tokenFactory.setMetadataDenom}
            metadataDisplayDenom={tokenFactory.metadataDisplayDenom}
            setMetadataDisplayDenom={tokenFactory.setMetadataDisplayDenom}
            metadataSymbol={tokenFactory.metadataSymbol}
            setMetadataSymbol={tokenFactory.setMetadataSymbol}
            metadataName={tokenFactory.metadataName}
            setMetadataName={tokenFactory.setMetadataName}
            metadataDescription={tokenFactory.metadataDescription}
            setMetadataDescription={tokenFactory.setMetadataDescription}
            metadataDecimals={tokenFactory.metadataDecimals}
            setMetadataDecimals={tokenFactory.setMetadataDecimals}
            metadataUri={tokenFactory.metadataUri}
            setMetadataUri={tokenFactory.setMetadataUri}
            metadataMemo={tokenFactory.metadataMemo}
            setMetadataMemo={tokenFactory.setMetadataMemo}
            metadataResult={tokenFactory.metadataResult}
            onCreateDenom={handleCreateTokenDenom}
            onMint={handleMintToken}
            onSetMetadata={handleSetTokenMetadata}
            onRefreshBalances={() => balances.refreshAllBalances(address, wasmClient)}
          />
        )}

        {activeTab === TABS.WASM && (
          <WasmDeploySection
            address={address}
            busy={busy}
            canWasm={canWasm}
            wasmFile={wasmDeploy.wasmFile}
            setWasmFile={wasmDeploy.setWasmFile}
            codeId={wasmDeploy.codeId}
            setCodeId={wasmDeploy.setCodeId}
            label={wasmDeploy.label}
            setLabel={wasmDeploy.setLabel}
            admin={wasmDeploy.admin}
            setAdmin={wasmDeploy.setAdmin}
            initMsg={wasmDeploy.initMsg}
            setInitMsg={wasmDeploy.setInitMsg}
            uploadResult={wasmDeploy.uploadResult}
            instantiateResult={wasmDeploy.instantiateResult}
            onUpload={handleUploadWasm}
            onInstantiate={handleInstantiate}
          />
        )}

        {activeTab === TABS.NFT_DEPLOY && (
          <NFTDeploySection
            address={address}
            busy={busy}
            canWasm={canWasm}
            wasmFile={cw721Deploy.wasmFile}
            setWasmFile={cw721Deploy.setWasmFile}
            codeId={cw721Deploy.codeId}
            setCodeId={cw721Deploy.setCodeId}
            collectionName={cw721Deploy.collectionName}
            setCollectionName={cw721Deploy.setCollectionName}
            symbol={cw721Deploy.symbol}
            setSymbol={cw721Deploy.setSymbol}
            minter={cw721Deploy.minter}
            setMinter={cw721Deploy.setMinter}
            admin={cw721Deploy.admin}
            setAdmin={cw721Deploy.setAdmin}
            uploadResult={cw721Deploy.uploadResult}
            instantiateResult={cw721Deploy.instantiateResult}
            onUpload={handleUploadCW721}
            onInstantiate={handleInstantiateCW721}
          />
        )}

        {activeTab === TABS.NFT_MINT && (
          <NFTMintSection
            address={address}
            busy={busy}
            canWasm={canWasm}
            contractAddress={nftMint.contractAddress}
            setContractAddress={nftMint.setContractAddress}
            tokenId={nftMint.tokenId}
            setTokenId={nftMint.setTokenId}
            recipient={nftMint.recipient}
            setRecipient={nftMint.setRecipient}
            tokenUri={nftMint.tokenUri}
            setTokenUri={nftMint.setTokenUri}
            result={nftMint.result}
            onMint={handleMintNFT}
          />
        )}
      </main>
    </div>
  );
}
