// src/components/dashboard/QuickActions.jsx

import { TABS } from '../../config/constants';

export function QuickActions({
  address,
  busy,
  canWasm,
  onRequestFaucet,
  onRefreshBalances,
  setActive,
  faucetResult,
  sendResult,
  uploadResult,
  instantiateResult,
}) {
  return (
    <section className="kcard">
      <div className="kcardHead">
        <h3>Quick Actions</h3>
      </div>

      <div className="krow2">
        <button className="kbtn primary" onClick={onRequestFaucet} disabled={!address || busy}>
          Request Faucet
        </button>
        <button className="kbtn" onClick={() => setActive(TABS.SEND)} disabled={!address}>
          Bank Send
        </button>
      </div>

      <div className="krow2" style={{ marginTop: 10 }}>
        <button className="kbtn" onClick={() => setActive(TABS.TOKEN_FACTORY)} disabled={!address}>
          Create Native Coin
        </button>
        <button className="kbtn" onClick={onRefreshBalances} disabled={!address || busy}>
          Refresh Balances
        </button>
      </div>

      <div className="krow2" style={{ marginTop: 10 }}>
        <button
          className="kbtn"
          onClick={() => setActive(TABS.WASM)}
          disabled={!address || !canWasm}
        >
          CosmWasm Deploy
        </button>
        <div />
      </div>

      {faucetResult && <div className="klog">{faucetResult}</div>}
      {sendResult && <div className="klog">{sendResult}</div>}
      {uploadResult && <div className="klog">{uploadResult}</div>}
      {instantiateResult && <div className="klog">{instantiateResult}</div>}
    </section>
  );
}
