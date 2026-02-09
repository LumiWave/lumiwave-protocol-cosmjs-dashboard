// src/hooks/useCW721Deploy.js

import { useState, useCallback } from 'react';
import { uploadWasm } from '../services/wasmService';
import { instantiateCW721 } from '../services/cw721Service';
import { safeStringify } from '../utils/formatters';

export function useCW721Deploy(address) {
  const [wasmFile, setWasmFile] = useState(null);
  const [codeId, setCodeId] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [minter, setMinter] = useState('');
  const [admin, setAdmin] = useState('');

  const [uploadResult, setUploadResult] = useState('');
  const [instantiateResult, setInstantiateResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default minter to the connected address
  useState(() => {
    if (address && !minter) {
      setMinter(address);
    }
  }, [address]);

  const upload = useCallback(async (client, senderAddress) => {
    try {
      setLoading(true);
      setUploadResult('');
      setInstantiateResult('');

      const result = await uploadWasm(client, senderAddress, wasmFile);

      setCodeId(String(result.codeId));
      setUploadResult(safeStringify(result));
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(
        safeStringify({
          success: false,
          error: error?.message || 'Upload failed',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [wasmFile]);

  const instantiate = useCallback(
    async (client, senderAddress) => {
      try {
        setLoading(true);
        setInstantiateResult('');

        const result = await instantiateCW721(
          client,
          senderAddress,
          Number(codeId),
          collectionName,
          symbol,
          minter || senderAddress,
          admin
        );

        setInstantiateResult(
          safeStringify({
            success: true,
            collectionName,
            symbol,
            ...result,
          })
        );
      } catch (error) {
        console.error('Instantiate error:', error);
        setInstantiateResult(
          safeStringify({
            success: false,
            error: error?.message || 'Instantiate failed',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [codeId, collectionName, symbol, minter, admin]
  );

  const clearResults = useCallback(() => {
    setUploadResult('');
    setInstantiateResult('');
  }, []);

  return {
    wasmFile,
    setWasmFile,
    codeId,
    setCodeId,
    collectionName,
    setCollectionName,
    symbol,
    setSymbol,
    minter,
    setMinter,
    admin,
    setAdmin,
    uploadResult,
    instantiateResult,
    loading,
    upload,
    instantiate,
    clearResults,
  };
}
