// src/components/layout/TopBar.jsx

import { CHAIN_CONFIG } from '../../config/constants';
import { Button } from '../ui/Button';

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
