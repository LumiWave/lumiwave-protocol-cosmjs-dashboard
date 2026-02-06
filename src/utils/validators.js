// src/utils/validators.js

/**
 * Bech32 주소 형식 검증 (기본)
 */
export function isValidAddress(address, prefix = 'lumi') {
  if (!address || typeof address !== 'string') return false;
  return address.startsWith(prefix) && address.length > 10;
}

/**
 * 금액 검증
 */
export function isValidAmount(amount) {
  if (!amount || amount === '0') return false;
  
  try {
    const num = parseFloat(amount);
    return num > 0 && !isNaN(num);
  } catch {
    return false;
  }
}

/**
 * CodeId 검증
 */
export function isValidCodeId(codeId) {
  const num = Number(codeId);
  return !isNaN(num) && num > 0;
}

/**
 * JSON 문자열 검증
 */
export function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
