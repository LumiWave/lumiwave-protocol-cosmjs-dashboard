// src/utils/currencies.js

import { CHAIN_CONFIG } from '../config/constants';

// 로컬 스토리지에 저장된 추가 통화 목록을 안전하게 조회한다.
// 파싱 실패 시 빈 배열을 반환해 UI 오류를 방지한다.
export function readExtraCurrenciesFromStorage(storageKey = 'lumiwave.extraCurrencies') {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 기본 통화와 추가 통화를 denom 기준으로 병합한 인덱스를 생성한다.
// 송금/표시 기능에서 동일한 통화 메타데이터를 재사용할 수 있게 한다.
export function buildCurrencyIndex(extraCurrencies = []) {
  const currencyIndex = {
    [CHAIN_CONFIG.denom]: {
      coinDenom: CHAIN_CONFIG.displayDenom,
      coinMinimalDenom: CHAIN_CONFIG.denom,
      coinDecimals: CHAIN_CONFIG.decimals,
    },
  };

  for (const currency of extraCurrencies) {
    const minimalDenom = String(currency?.coinMinimalDenom || '').trim();
    const coinDenom = String(currency?.coinDenom || '').trim();
    const coinDecimals = Number(currency?.coinDecimals);

    if (!minimalDenom || !coinDenom || !Number.isFinite(coinDecimals) || coinDecimals < 0) {
      continue;
    }

    currencyIndex[minimalDenom] = {
      coinDenom,
      coinMinimalDenom: minimalDenom,
      coinDecimals,
    };
  }

  return currencyIndex;
}

// 통화 배열 두 개를 최소 denom 기준으로 병합한다.
// 뒤에서 들어온 통화가 같은 denom을 덮어쓰도록 정규화한다.
export function mergeCurrenciesByDenom(baseCurrencies = [], appendCurrencies = []) {
  const mergedMap = new Map();
  const mergedList = [...baseCurrencies, ...appendCurrencies];

  for (const currency of mergedList) {
    const minimalDenom = String(currency?.coinMinimalDenom || '').trim();
    const coinDenom = String(currency?.coinDenom || '').trim();
    const coinDecimals = Number(currency?.coinDecimals);

    if (!minimalDenom || !coinDenom || !Number.isFinite(coinDecimals) || coinDecimals < 0) {
      continue;
    }

    mergedMap.set(minimalDenom, {
      coinDenom,
      coinMinimalDenom: minimalDenom,
      coinDecimals,
    });
  }

  return Array.from(mergedMap.values());
}
