// src/components/bank/BankSendSection.jsx

import { shortenAddress } from '../../utils/formatters';

export function BankSendSection({
  address,
  busy,
  nativeBalances = [],
  toAddress,
  setToAddress,
  amount,
  setAmount,
  selectedDenom = '',
  setSelectedDenom,
  selectedCoin = { displayDenom: '-', decimals: 0 },
  coinOptions = [],
  memo,
  setMemo,
  sendResult,
  onSend,
  onRefreshBalances,
}) {
  const selectedBalance = nativeBalances.find((balance) => balance.denom === selectedDenom);

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

          <div style={{ marginTop: 10 }}>
            <div className="klabel">Token</div>
            <select
              className="kinput"
              value={selectedDenom}
              onChange={(e) => setSelectedDenom(e.target.value)}
              disabled={busy}
            >
              {coinOptions.map((option) => (
                <option key={option.denom} value={option.denom}>
                  {option.displayDenom} ({option.denom})
                </option>
              ))}
            </select>
          </div>

          <div className="krow2" style={{ marginTop: 10 }}>
            <div>
              <div className="klabel">Amount ({selectedCoin.displayDenom})</div>
              <input
                className="kinput"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`e.g. 1 (${selectedCoin.decimals} decimals)`}
              />
              <div className="khelp" style={{ marginTop: 6, marginBottom: 0 }}>
                Available: {selectedBalance?.amount || '0'} {selectedDenom}
              </div>
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
