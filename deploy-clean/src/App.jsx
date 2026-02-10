// src/App.jsx

import { useEffect, useState } from 'react';
import './App.css';

import { walletCapabilities } from './wallets';
import { TABS, WALLET_STATUS } from './config/constants';

import { useWallet } from './hooks/useWallet';
import { useAllBalances } from './hooks/useAllBalances';
import { useFaucet } from './hooks/useFaucet';
import { useBankSend } from './hooks/useBankSend';
import { useWasmDeploy } from './hooks/useWasmDeploy';
import { useCW721Deploy } from './hooks/useCW721Deploy';
import { useNFTMint } from './hooks/useNFTMint';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { WalletModal } from './components/wallet/WalletModal';
import { Overview } from './components/dashboard/Overview';
import { QuickActions } from './components/dashboard/QuickActions';
import { FaucetSection } from './components/faucet/FaucetSection';
import { BankSendSection } from './components/bank/BankSendSection';
import { WasmDeploySection } from './components/wasm/WasmDeploySection';
import { NFTDeploySection } from './components/nft/NFTDeploySection';
import { NFTMintSection } from './components/nft/NFTMintSection';

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [modalOpen, setModalOpen] = useState(false);

  // Wallet
  const wallet = useWallet();
  const { status, walletType, address, height, stargateClient, wasmClient } = wallet;

  // All Balances (Native + CW20 + NFT)
  const balances = useAllBalances();
  const { refreshAllBalances } = balances;

  // Faucet
  const faucet = useFaucet();

  // Bank Send
  const bankSend = useBankSend();

  // WASM Deploy (including CW20)
  const wasmDeploy = useWasmDeploy(address);

  // CW721 Deploy
  const cw721Deploy = useCW721Deploy(address);

  // NFT Mint
  const nftMint = useNFTMint();

  // Derived states
  const connected = status === WALLET_STATUS.CONNECTED || status === WALLET_STATUS.ADDRESS_COPIED;
  const canWasm = walletType ? walletCapabilities(walletType).canWasm : false;
  const busy =
    status.startsWith('Suggesting') ||
    status.startsWith('Connecting') ||
    status.startsWith('Uploading') ||
    status.startsWith('Instantiating') ||
    status.startsWith('Sending') ||
    status.startsWith('Requesting') ||
    faucet.loading ||
    bankSend.loading ||
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
    refreshAllBalances(address);
  }, [connected, address, refreshAllBalances]);

  const handleRequestFaucet = async () => {
    wallet.setStatus('Requesting faucet...');
    await faucet.request(address, () => balances.refreshAllBalances(address, wasmClient));
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleSend = async () => {
    wallet.setStatus('Sending tokens...');
    await bankSend.send(stargateClient, address, () =>
      balances.refreshAllBalances(address, wasmClient)
    );
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleUploadWasm = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support CosmWasm deploy in this tool.');
    }
    wallet.setStatus('Uploading WASM (Store Code)...');
    await wasmDeploy.upload(wasmClient, address);
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleInstantiate = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support CosmWasm deploy in this tool.');
    }
    wallet.setStatus('Instantiating contract...');
    await wasmDeploy.instantiate(wasmClient, address);
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleUploadCW721 = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    wallet.setStatus('Uploading CW721 WASM...');
    await cw721Deploy.upload(wasmClient, address);
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleInstantiateCW721 = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    wallet.setStatus('Deploying NFT collection...');
    await cw721Deploy.instantiate(wasmClient, address);
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleMintNFT = async () => {
    if (!canWasm) {
      throw new Error('Cosmostation does not support NFT operations.');
    }
    wallet.setStatus('Minting NFT...');
    await nftMint.mint(wasmClient, address);
    wallet.setStatus(WALLET_STATUS.CONNECTED);
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
          <div className="kgrid">
            <Overview
              walletType={walletType}
              address={address}
              height={height}
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
            toAddress={bankSend.toAddress}
            setToAddress={bankSend.setToAddress}
            amount={bankSend.amount}
            setAmount={bankSend.setAmount}
            memo={bankSend.memo}
            setMemo={bankSend.setMemo}
            sendResult={bankSend.result}
            onSend={handleSend}
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
