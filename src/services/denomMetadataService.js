// src/services/denomMetadataService.js

// REST 엔드포인트를 정규화해 메타데이터 조회 URL을 안정적으로 만든다.
// 끝 슬래시 유무 차이로 인한 잘못된 경로 생성을 방지한다.
function normalizeRestEndpoint(restEndpoint) {
  return String(restEndpoint || '').replace(/\/+$/, '');
}

// denom 메타데이터를 REST API에서 조회한다.
// 조회 실패 시 null을 반환해 상위 로직이 안전하게 fallback 할 수 있게 한다.
export async function fetchDenomMetadata(restEndpoint, denom) {
  const normalizedRest = normalizeRestEndpoint(restEndpoint);
  const targetDenom = String(denom || '').trim();

  if (!normalizedRest || !targetDenom) {
    return null;
  }

  const encodedDenom = encodeURIComponent(targetDenom);
  const response = await fetch(
    `${normalizedRest}/cosmos/bank/v1beta1/denoms_metadata/${encodedDenom}`
  );

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json?.metadata || null;
}

// 조회한 메타데이터를 Keplr chain info 형식 통화 객체로 변환한다.
// display/base/denom_units를 우선 사용하고 누락 값은 fallback denom으로 보정한다.
export function toCurrencyFromDenomMetadata(metadata, fallbackDenom = '') {
  const baseDenom = String(metadata?.base || fallbackDenom || '').trim();
  if (!baseDenom) {
    return null;
  }

  const denomUnits = Array.isArray(metadata?.denom_units) ? metadata.denom_units : [];
  const displayDenom = String(metadata?.display || '').trim();

  const displayUnit =
    denomUnits.find((unit) => String(unit?.denom || '').trim() === displayDenom) ||
    denomUnits.reduce((max, unit) => {
      const exponent = Number(unit?.exponent);
      const maxExponent = Number(max?.exponent);
      if (!Number.isFinite(exponent)) return max;
      if (!Number.isFinite(maxExponent) || exponent > maxExponent) return unit;
      return max;
    }, null);

  const coinDenom = String(
    displayUnit?.denom || metadata?.symbol || metadata?.name || baseDenom
  ).trim();
  const coinDecimals = Number(displayUnit?.exponent ?? 0);

  if (!coinDenom || !Number.isFinite(coinDecimals) || coinDecimals < 0) {
    return null;
  }

  return {
    coinDenom,
    coinMinimalDenom: baseDenom,
    coinDecimals,
  };
}
