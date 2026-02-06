// src/components/bank/BankSendSection.jsx

import { shortenAddress } from '../../utils/formatters';
import { CHAIN_CONFIG } from '../../config/constants';

export function BankSendSection({
  address,
  busy,
  toAddress,
  setToAddress,
  amount,
  setAmount,
  memo,
  setMemo,
  sendResult,
  onSend,
  onRefreshBalances,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>Bank Send</h3>
          <div className="kchip">From: {shortenAddress(address)}</div>
        </div>

        <div className="kform">
          <div>
            <div className="klabel">Recipient (bech32)</div>
            <input
              className="kinput"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="lumi..."
            />
          </div>

          <div className="krow2" style={{ marginTop: 10 }}>
            <div>
              <div className="klabel">Amount ({CHAIN_CONFIG.displayDenom})</div>
              <input
                className="kinput"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <div className="klabel">Memo (optional)</div>
              <input
                className="kinput"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. test transfer"
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="kbtn primary" onClick={onSend} disabled={!address || busy}>
              Send
            </button>
            <button className="kbtn" onClick={onRefreshBalances} disabled={!address || busy}>
              Refresh Balances
            </button>
          </div>

          {sendResult && <div className="klog">{sendResult}</div>}
        </div>
      </section>
    </div>
  );
}
