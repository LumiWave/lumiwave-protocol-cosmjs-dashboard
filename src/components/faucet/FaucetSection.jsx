// src/components/faucet/FaucetSection.jsx

import { shortenAddress } from '../../utils/formatters';

export function FaucetSection({
  address,
  busy,
  balancesText,
  faucetResult,
  onRequestFaucet,
  onRefreshBalances,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>Faucet</h3>
          <div className="kchip">{shortenAddress(address)}</div>
        </div>

        <div className="khelp">
          Faucet sends test tokens to your connected wallet. This action may be rate-limited.
        </div>

        <div className="krow2">
          <button className="kbtn primary" onClick={onRequestFaucet} disabled={!address || busy}>
            Request Faucet
          </button>
          <button className="kbtn" onClick={onRefreshBalances} disabled={!address || busy}>
            Refresh Balances
          </button>
        </div>

        <div className="kkv" style={{ marginTop: 12 }}>
          <div className="kk">Balances</div>
          <div className="kvv kmono">{balancesText || '-'}</div>
        </div>

        {faucetResult && <div className="klog">{faucetResult}</div>}
      </section>
    </div>
  );
}
