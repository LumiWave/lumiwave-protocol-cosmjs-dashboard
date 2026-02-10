// src/components/layout/TopBar.jsx

import { CHAIN_CONFIG } from '../../config/constants';

export function TopBar({ status, onConnectWallet, onCopyAddress, address, busy }) {
  return (
    <div className="ktop">
      <div className="ktopLeft">
        <div className="ktopTitle">{CHAIN_CONFIG.chainName} Dashboard</div>
        <div className="ktopSub">
          Wallet connection, faucet, transfers, and CosmWasm deployment.
        </div>
      </div>

      <div className="ktopRight">
        <div className="kbadge">
          <span>Status</span>
          <b>{status}</b>
        </div>
        <button className="kbtn primary" onClick={onConnectWallet} disabled={busy}>
          Connect Wallet
        </button>
        <button className="kbtn" onClick={onCopyAddress} disabled={!address || busy}>
          Copy Address
        </button>
      </div>
    </div>
  );
}
