// src/hooks/useTokenFactory.js

import { useState, useCallback, useEffect } from 'react';
import {
  createTokenFactoryDenom,
  mintTokenFactoryDenom,
  setTokenFactoryDenomMetadata,
} from '../services/tokenFactoryService';
import { displayToBaseAmount, safeStringify } from '../utils/formatters';
import { CHAIN_CONFIG } from '../config/constants';

export function useTokenFactory(address) {
  const [subdenom, setSubdenom] = useState('');
  const [createMemo, setCreateMemo] = useState('');
  const [createdDenom, setCreatedDenom] = useState('');
  const [createResult, setCreateResult] = useState('');

  const [mintDenom, setMintDenom] = useState('');
  const [mintAmount, setMintAmount] = useState('1000');
  const [mintToAddress, setMintToAddress] = useState('');
  const [mintMemo, setMintMemo] = useState('');
  const [mintResult, setMintResult] = useState('');

  const [metadataDenom, setMetadataDenom] = useState('');
  const [metadataDisplayDenom, setMetadataDisplayDenom] = useState('');
  const [metadataSymbol, setMetadataSymbol] = useState('');
  const [metadataName, setMetadataName] = useState('');
  const [metadataDescription, setMetadataDescription] = useState('');
  const [metadataDecimals, setMetadataDecimals] = useState(String(CHAIN_CONFIG.decimals));
  const [metadataUri, setMetadataUri] = useState('');
  const [metadataMemo, setMetadataMemo] = useState('');
  const [metadataResult, setMetadataResult] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address && !mintToAddress) {
      setMintToAddress(address);
    }
  }, [address, mintToAddress]);

  const createDenom = useCallback(
    async (client, senderAddress, onSuccess) => {
      try {
        setLoading(true);
        setCreateResult('');

        const result = await createTokenFactoryDenom(client, senderAddress, subdenom, createMemo);

        setCreatedDenom(result.newDenom);
        setMintDenom(result.newDenom);
        setMetadataDenom(result.newDenom);
        if (!metadataDisplayDenom) {
          const autoSymbol = subdenom.toUpperCase();
          setMetadataDisplayDenom(autoSymbol);
          setMetadataSymbol(autoSymbol);
          setMetadataName(autoSymbol);
        }
        setCreateResult(safeStringify({ success: true, ...result }));

        if (onSuccess) {
          setTimeout(() => onSuccess(), 900);
        }
      } catch (error) {
        console.error('Tokenfactory create denom error:', error);
        setCreateResult(
          safeStringify({
            success: false,
            error: error?.message || 'Create denom failed',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [subdenom, createMemo, metadataDisplayDenom]
  );

  const mint = useCallback(
    async (client, senderAddress, onSuccess) => {
      try {
        setLoading(true);
        setMintResult('');

        const baseAmount = displayToBaseAmount(mintAmount, CHAIN_CONFIG.decimals);
        const result = await mintTokenFactoryDenom(
          client,
          senderAddress,
          mintDenom,
          baseAmount,
          mintToAddress,
          mintMemo
        );

        setMintResult(
          safeStringify({
            success: true,
            displayAmount: mintAmount,
            displayDenom: CHAIN_CONFIG.displayDenom,
            ...result,
          })
        );

        if (onSuccess) {
          setTimeout(() => onSuccess(), 900);
        }
      } catch (error) {
        console.error('Tokenfactory mint error:', error);
        setMintResult(
          safeStringify({
            success: false,
            error: error?.message || 'Mint failed',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [mintDenom, mintAmount, mintToAddress, mintMemo]
  );

  // 발행한 denom 메타데이터를 체인에 등록한다.
  // 지갑에서 심볼/소수점이 보이도록 set_denom_metadata를 실행한다.
  const setMetadata = useCallback(
    async (client, senderAddress, onSuccess) => {
      try {
        setLoading(true);
        setMetadataResult('');

        const result = await setTokenFactoryDenomMetadata(
          client,
          senderAddress,
          metadataDenom,
          {
            displayDenom: metadataDisplayDenom,
            symbol: metadataSymbol,
            name: metadataName,
            description: metadataDescription,
            decimals: Number(metadataDecimals),
            uri: metadataUri,
          },
          metadataMemo
        );

        setMetadataResult(
          safeStringify({
            success: true,
            ...result,
          })
        );

        if (onSuccess) {
          setTimeout(() => onSuccess(), 900);
        }

        return result;
      } catch (error) {
        console.error('Tokenfactory set metadata error:', error);
        setMetadataResult(
          safeStringify({
            success: false,
            error: error?.message || 'Set metadata failed',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [
      metadataDenom,
      metadataDisplayDenom,
      metadataSymbol,
      metadataName,
      metadataDescription,
      metadataDecimals,
      metadataUri,
      metadataMemo,
    ]
  );

  const clearResults = useCallback(() => {
    setCreateResult('');
    setMintResult('');
    setMetadataResult('');
  }, []);

  return {
    subdenom,
    setSubdenom,
    createMemo,
    setCreateMemo,
    createdDenom,
    setCreatedDenom,
    createResult,

    mintDenom,
    setMintDenom,
    mintAmount,
    setMintAmount,
    mintToAddress,
    setMintToAddress,
    mintMemo,
    setMintMemo,
    mintResult,

    metadataDenom,
    setMetadataDenom,
    metadataDisplayDenom,
    setMetadataDisplayDenom,
    metadataSymbol,
    setMetadataSymbol,
    metadataName,
    setMetadataName,
    metadataDescription,
    setMetadataDescription,
    metadataDecimals,
    setMetadataDecimals,
    metadataUri,
    setMetadataUri,
    metadataMemo,
    setMetadataMemo,
    metadataResult,

    loading,
    createDenom,
    mint,
    setMetadata,
    clearResults,
  };
}
