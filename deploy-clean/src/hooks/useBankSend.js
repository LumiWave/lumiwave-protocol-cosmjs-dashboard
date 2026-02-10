// src/hooks/useBankSend.js

import { useState, useCallback } from 'react';
import { sendTokens } from '../services/bankService';
import { displayToBaseAmount, safeStringify } from '../utils/formatters';
import { CHAIN_CONFIG } from '../config/constants';

export function useBankSend() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (client, fromAddress, onSuccess) => {
    try {
      setLoading(true);
      setResult('');

      const baseAmount = displayToBaseAmount(amount, CHAIN_CONFIG.decimals);
      
      const txResult = await sendTokens(
        client,
        fromAddress,
        toAddress,
        baseAmount,
        CHAIN_CONFIG.denom,
        memo
      );

      setResult(safeStringify(txResult));

      if (onSuccess) {
        setTimeout(() => onSuccess(), 900);
      }
    } catch (error) {
      console.error('Send error:', error);
      setResult(error?.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  }, [toAddress, amount, memo]);

  const clearResult = useCallback(() => {
    setResult('');
  }, []);

  return {
    toAddress,
    setToAddress,
    amount,
    setAmount,
    memo,
    setMemo,
    result,
    loading,
    send,
    clearResult,
  };
}
