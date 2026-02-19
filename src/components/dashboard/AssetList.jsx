// src/components/dashboard/AssetList.jsx

// base 단위 금액을 decimals 기준 사람이 읽기 쉬운 단위로 변환한다.
// 소수점 뒤 불필요한 0은 제거해 대시보드 가독성을 높인다.
function formatDisplayAmount(baseAmount, decimals) {
  const normalizedAmount = String(baseAmount || '0').trim();
  const normalizedDecimals = Number(decimals);

  if (!Number.isFinite(normalizedDecimals) || normalizedDecimals <= 0) {
    return normalizedAmount;
  }

  try {
    const value = BigInt(normalizedAmount);
    const scale = 10n ** BigInt(normalizedDecimals);
    const whole = value / scale;
    const fraction = value % scale;
    const fractionText = fraction
      .toString()
      .padStart(normalizedDecimals, '0')
      .replace(/0+$/, '');
    return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
  } catch {
    return normalizedAmount;
  }
}

// denom 패턴을 기준으로 자산 유형을 분류한다.
// 대시보드에서 코인/토큰 성격을 빠르게 구분할 수 있게 한다.
function resolveAssetType(denom) {
  if (String(denom).startsWith('factory/')) {
    return 'Token Factory';
  }
  if (String(denom).startsWith('ibc/')) {
    return 'IBC';
  }
  return 'Native';
}

// 연결 지갑의 전체 자산 목록을 코인/토큰 단위로 표시한다.
// 메타데이터 동기화 버튼을 함께 제공해 지갑 표시 누락을 보정한다.
export function AssetList({ address, assets = [], syncing, onSync, syncResult }) {
  return (
    <section className="kcard" style={{ marginTop: 14 }}>
      <div className="kcardHead">
        <h3>Wallet Assets</h3>
        <button className="kbtn" onClick={onSync} disabled={!address || syncing}>
          {syncing ? 'Syncing...' : 'Sync Tokens To Wallet'}
        </button>
      </div>

      {!assets.length ? (
        <div className="khelp" style={{ marginBottom: 0 }}>
          지갑에 표시할 자산이 없습니다. 먼저 지갑 연결 후 잔고를 새로고침하세요.
        </div>
      ) : (
        <div className="kassetList">
          {assets.map((asset) => (
            <div key={asset.denom} className="kassetRow">
              <div className="kassetMain">
                <div className="kassetSymbol">{asset.displayDenom}</div>
                <div className="kassetType">{resolveAssetType(asset.denom)}</div>
              </div>
              <div className="kassetAmounts">
                <div className="kassetDisplay">
                  {formatDisplayAmount(asset.amount, asset.decimals)} {asset.displayDenom}
                </div>
                <div className="kassetBase kmono">
                  {asset.amount} {asset.denom}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {syncResult && <div className="klog">{syncResult}</div>}
    </section>
  );
}
