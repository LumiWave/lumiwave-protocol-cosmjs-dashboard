// src/utils/formatters.js

/**
 * 주소를 짧게 표시 (앞 10자, 뒤 6자)
 */
export function shortenAddress(addr) {
  if (!addr) return '-';
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

/**
 * BigInt를 포함한 객체를 안전하게 JSON.stringify
 */
export function safeStringify(obj, space = 2) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    space
  );
}

/**
 * JSON 파싱을 안전하게 수행
 */
export function safeJsonParse(s) {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch (e) {
    return { ok: false, error: e?.message || 'Invalid JSON' };
  }
}

/**
 * Display 금액을 Base 단위로 변환 (LWP -> ulwp)
 * @param {string} displayAmountStr - 표시 단위 금액 (예: "1.5")
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} Base 단위 금액 (예: "1500000")
 */
export function displayToBaseAmount(displayAmountStr, decimals = 6) {
  const s = (displayAmountStr || '').trim();
  if (!s) return '0';
  
  const [whole, fracRaw = ''] = s.split('.');
  const frac = (fracRaw + '0'.repeat(decimals)).slice(0, decimals);
  const wholeClean = whole.replace(/^0+(?=\d)/, '') || '0';
  const base = `${wholeClean}${frac}`.replace(/^0+(?=\d)/, '') || '0';
  
  return base;
}

/**
 * Base 금액을 Display 단위로 포맷 (ulwp -> LWP)
 * @param {string} amountStr - Base 단위 금액
 * @param {string} denom - 현재 denomination
 * @param {string} baseDenom - Base denomination
 * @param {string} displayDenom - Display denomination
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷된 문자열
 */
export function formatAmount(amountStr, denom, baseDenom, displayDenom, decimals = 6) {
  // Base denom이 아니면 그대로 반환
  if (denom !== baseDenom) {
    return `${amountStr}${denom}`;
  }

  const raw = (amountStr || '0').trim();
  let n;
  try {
    n = BigInt(raw);
  } catch {
    return `${amountStr}${denom}`;
  }

  const d = BigInt(decimals);
  const scale = 10n ** d;

  const whole = n / scale;
  const frac = n % scale;

  // 소수점 이하 trailing zeros 제거
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  const display = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();

  return `${amountStr}${denom} (${display} ${displayDenom})`;
}

/**
 * 여러 잔액을 포맷팅
 */
export function formatBalances(balances, baseDenom, displayDenom, decimals) {
  if (!balances || !balances.length) {
    return '(no balances)';
  }

  return balances
    .map((b) => formatAmount(b.amount, b.denom, baseDenom, displayDenom, decimals))
    .join(', ');
}
