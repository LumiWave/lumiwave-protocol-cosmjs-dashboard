// src/hooks/useBankSend.js

import { useState, useCallback, useEffect } from 'react';
import { sendTokens } from '../services/bankService';
import { displayToBaseAmount, safeStringify } from '../utils/formatters';
import { buildCurrencyIndex } from '../utils/currencies';

export function useBankSend(nativeBalances = [], extraCurrencies = [], chainConfig) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('1');
  const [selectedDenom, setSelectedDenom] = useState(chainConfig.denom);
  const [memo, setMemo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const currencyIndex = buildCurrencyIndex(extraCurrencies, chainConfig);

  const denomSet = new Set();
  const coinOptions = [];
  for (const balance of nativeBalances) {
    const denom = String(balance?.denom || '').trim();
    if (!denom || denomSet.has(denom)) continue;

    denomSet.add(denom);
    const currency = currencyIndex[denom];
    coinOptions.push({
      denom,
      displayDenom: currency?.coinDenom || denom,
      decimals: Number(currency?.coinDecimals ?? chainConfig.decimals),
    });
  }

  if (!denomSet.has(chainConfig.denom)) {
    coinOptions.unshift({
      denom: chainConfig.denom,
      displayDenom: chainConfig.displayDenom,
      decimals: chainConfig.decimals,
    });
  }

  const selectedCoin =
    coinOptions.find((option) => option.denom === selectedDenom) || {
      denom: chainConfig.denom,
      displayDenom: chainConfig.displayDenom,
      decimals: chainConfig.decimals,
    };

  useEffect(() => {
    const hasSelectedBalance = nativeBalances.some(
      (balance) => String(balance?.denom || '').trim() === selectedDenom
    );
    if (hasSelectedBalance || selectedDenom === chainConfig.denom) {
      return;
    }

    const firstBalanceDenom = String(nativeBalances[0]?.denom || '').trim();
    setSelectedDenom(firstBalanceDenom || chainConfig.denom);
  }, [nativeBalances, selectedDenom]);

  const send = useCallback(async (client, fromAddress, onSuccess) => {
    try {
      setLoading(true);
      setResult('');

      const baseAmount = displayToBaseAmount(amount, selectedCoin.decimals);
      
      const txResult = await sendTokens(
        client,
        fromAddress,
        toAddress,
        baseAmount,
        selectedCoin.denom,
        memo
      );

      setResult(
        safeStringify({
          ...txResult,
          sendDenom: selectedCoin.denom,
          displayDenom: selectedCoin.displayDenom,
          displayAmount: amount,
        })
      );

      if (onSuccess) {
        setTimeout(() => onSuccess(), 900);
      }
    } catch (error) {
      console.error('Send error:', error);
      setResult(error?.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  }, [
    toAddress,
    amount,
    selectedCoin.denom,
    selectedCoin.displayDenom,
    selectedCoin.decimals,
    memo,
  ]);

  const clearResult = useCallback(() => {
    setResult('');
  }, []);

  return {
    toAddress,
    setToAddress,
    amount,
    setAmount,
    selectedDenom,
    setSelectedDenom,
    selectedCoin,
    coinOptions,
    memo,
    setMemo,
    result,
    loading,
    send,
    clearResult,
  };
}
