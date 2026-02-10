// src/components/wallet/WalletModal.jsx

import { getAvailableWallets, walletCapabilities } from '../../wallets';

export function WalletModal({ open, onClose, onPick }) {
  if (!open) return null;

  const wallets = getAvailableWallets();

  return (
    <div className="kmodalBackdrop" onMouseDown={onClose}>
      <div className="kmodal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kmodalHead">
          <div>
            <div className="kmodalTitle">Connect Wallet</div>
            <div className="kmodalSub">
              Select a wallet to connect. Keplr & Leap support full features (CosmWasm deploy).
              Cosmostation is limited to Bank Send.
            </div>
          </div>
          <button className="kmodalClose" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="kwalletList">
          {wallets.map((w) => {
            const cap = walletCapabilities(w.type);
            return (
              <button
                key={w.type}
                className="kwalletItem"
                disabled={!w.available}
                onClick={() => onPick(w.type)}
                style={{ opacity: w.available ? 1 : 0.45 }}
              >
                <div className="kwalletLeft">
                  <div className="kwalletName">{w.name}</div>
                  <div className="kwalletMeta">{cap.label}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`kpill ${w.available ? 'ok' : 'bad'}`}>
                    {w.available ? 'Detected' : 'Not installed'}
                  </span>
                  <span className="kpill">{w.type}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
