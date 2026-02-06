// src/App.jsx

import { useState } from 'react';
import './App.css';

import { walletCapabilities } from './wallets';
import { TABS, WALLET_STATUS } from './config/constants';

import { useWallet } from './hooks/useWallet';
import { useBalance } from './hooks/useBalance';
import { useFaucet } from './hooks/useFaucet';
import { useBankSend } from './hooks/useBankSend';
import { useWasmDeploy } from './hooks/useWasmDeploy';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { WalletModal } from './components/wallet/WalletModal';
import { Overview } from './components/dashboard/Overview';
import { QuickActions } from './components/dashboard/QuickActions';
import { FaucetSection } from './components/faucet/FaucetSection';
import { BankSendSection } from './components/bank/BankSendSection';
import { WasmDeploySection } from './components/wasm/WasmDeploySection';

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [modalOpen, setModalOpen] = useState(false);

  // Wallet
  const wallet = useWallet();
  const { status, walletType, address, height, stargateClient, wasmClient } = wallet;

  // Balance
  const balance = useBalance();
  const { balancesText } = balance;

  // Faucet
  const faucet = useFaucet();

  // Bank Send
  const bankSend = useBankSend();

  // WASM Deploy
  const wasmDeploy = useWasmDeploy(address);

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
    wasmDeploy.loading;

  // Handlers
  const handleConnectWallet = async (type) => {
    setModalOpen(false);
    await wallet.connect(type);
    await balance.refreshBalances(wallet.address);
  };

  const handleRequestFaucet = async () => {
    wallet.setStatus('Requesting faucet...');
    await faucet.request(address, () => balance.refreshBalances(address));
    wallet.setStatus(WALLET_STATUS.CONNECTED);
  };

  const handleSend = async () => {
    wallet.setStatus('Sending tokens...');
    await bankSend.send(stargateClient, address, () => balance.refreshBalances(address));
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
              balancesText={balancesText}
            />

            <QuickActions
              address={address}
              busy={busy}
              canWasm={canWasm}
              onRequestFaucet={handleRequestFaucet}
              onRefreshBalances={() => balance.refreshBalances(address)}
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
            balancesText={balancesText}
            faucetResult={faucet.result}
            onRequestFaucet={handleRequestFaucet}
            onRefreshBalances={() => balance.refreshBalances(address)}
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
            onRefreshBalances={() => balance.refreshBalances(address)}
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
      </main>
    </div>
  );
}
