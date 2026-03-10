// src/components/layout/TopBar.jsx

import { Button } from '../ui/Button';

export function TopBar({ status, onConnectWallet, onCopyAddress, address, busy, chainConfig, isMainnet }) {
  return (
    <div className="ktop">
      <div className="ktopLeft">
        <div className="ktopTitle">
          {chainConfig.chainName} Dashboard
          {isMainnet && <span className="knetBadge mainnet">MAINNET</span>}
          {!isMainnet && <span className="knetBadge testnet">TESTNET</span>}
        </div>
        <div className="ktopSub">
          Wallet connection, faucet, transfers, and CosmWasm deployment.
        </div>
      </div>

      <div className="ktopRight">
        <div className="kbadge">
          <span>Status</span>
          <b>{status}</b>
        </div>
        <Button variant="primary" onClick={onConnectWallet} disabled={busy}>
          Connect Wallet
        </Button>
        <Button onClick={onCopyAddress} disabled={!address || busy}>
          Copy Address
        </Button>
      </div>
    </div>
  );
}
