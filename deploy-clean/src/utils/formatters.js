// src/utils/formatters.js

/**
 * Shorten address display (first 10, last 6)
 */
export function shortenAddress(addr) {
  if (!addr) return '-';
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

/**
 * Safely JSON.stringify objects that may include BigInt
 */
export function safeStringify(obj, space = 2) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    space
  );
}

/**
 * Safely parse JSON
 */
export function safeJsonParse(s) {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch (e) {
    return { ok: false, error: e?.message || 'Invalid JSON' };
  }
}

/**
 * Convert display amount to base unit (LWP -> ulwp)
 * @param {string} displayAmountStr - Display unit amount (e.g. "1.5")
 * @param {number} decimals - Decimal places
 * @returns {string} Base unit amount (e.g. "1500000")
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
 * Format base amount to display unit (ulwp -> LWP)
 * @param {string} amountStr - Base unit amount
 * @param {string} denom - Current denomination
 * @param {string} baseDenom - Base denomination
 * @param {string} displayDenom - Display denomination
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
export function formatAmount(amountStr, denom, baseDenom, displayDenom, decimals = 6) {
  // Return as-is when denom is not baseDenom
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

  // Remove trailing zeros in fractional part
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  const display = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();

  return `${amountStr}${denom} (${display} ${displayDenom})`;
}

/**
 * Format multiple balances
 */
export function formatBalances(balances, baseDenom, displayDenom, decimals) {
  if (!balances || !balances.length) {
    return '(no balances)';
  }

  return balances
    .map((b) => formatAmount(b.amount, b.denom, baseDenom, displayDenom, decimals))
    .join(', ');
}
