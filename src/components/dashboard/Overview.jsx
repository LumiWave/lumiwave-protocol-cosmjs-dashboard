// src/components/dashboard/Overview.jsx

import { CHAIN_CONFIG } from '../../config/constants';
import { formatAmount } from '../../utils/formatters';

export function Overview({ walletType, address, height, nativeBalances = [], balancesText }) {
  const { chainId, displayDenom, denom, decimals, gasPrice } = CHAIN_CONFIG;
  const hasNativeBalances = nativeBalances.length > 0;

  return (
    <section className="kcard">
      <div className="kcardHead">
        <h3>Overview</h3>
        <div className="kchip">{chainId}</div>
      </div>

      <div className="kkv">
        <div className="kk">Wallet</div>
        <div className="kvv kmono">{walletType || '-'}</div>

        <div className="kk">Address</div>
        <div className="kvv kmono">{address || '-'}</div>

        <div className="kk">Height</div>
        <div className="kvv kmono">{height ?? '-'}</div>

        <div className="kk">Denom</div>
        <div className="kvv kmono">
          {displayDenom} ({denom}, decimals={decimals})
        </div>

        <div className="kk">Balances</div>
        <div className="kvv">
          {hasNativeBalances ? (
            <ul className="kbalanceList">
              {nativeBalances.map((balance) => (
                <li key={balance.denom} className="kbalanceItem kmono">
                  {formatAmount(balance.amount, balance.denom, denom, displayDenom, decimals)}
                </li>
              ))}
            </ul>
          ) : (
            <span className="kmono">{balancesText || '-'}</span>
          )}
        </div>

        <div className="kk">Gas Price</div>
        <div className="kvv kmono">{gasPrice}</div>
      </div>
    </section>
  );
}
