// src/hooks/useWasmDeploy.js

import { useState, useCallback } from 'react';
import { uploadWasm, instantiateContract } from '../services/wasmService';
import { safeStringify } from '../utils/formatters';

export function useWasmDeploy(address) {
  const [wasmFile, setWasmFile] = useState(null);
  const [codeId, setCodeId] = useState('');
  const [label, setLabel] = useState('lumiwave-contract');
  const [admin, setAdmin] = useState('');
  const [initMsg, setInitMsg] = useState('{"owner":"REPLACE_ME","count":0}');
  
  const [uploadResult, setUploadResult] = useState('');
  const [instantiateResult, setInstantiateResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-replace REPLACE_ME in initMsg with the connected address
  useState(() => {
    if (address && initMsg.includes('REPLACE_ME')) {
      setInitMsg(initMsg.replace('REPLACE_ME', address));
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
      setUploadResult(error?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [wasmFile]);

  const instantiate = useCallback(async (client, senderAddress) => {
    try {
      setLoading(true);
      setInstantiateResult('');

      const result = await instantiateContract(
        client,
        senderAddress,
        Number(codeId),
        label,
        initMsg,
        admin
      );

      setInstantiateResult(safeStringify(result));
    } catch (error) {
      console.error('Instantiate error:', error);
      setInstantiateResult(error?.message || 'Instantiate failed');
    } finally {
      setLoading(false);
    }
  }, [codeId, label, initMsg, admin]);

  const clearResults = useCallback(() => {
    setUploadResult('');
    setInstantiateResult('');
  }, []);

  return {
    wasmFile,
    setWasmFile,
    codeId,
    setCodeId,
    label,
    setLabel,
    admin,
    setAdmin,
    initMsg,
    setInitMsg,
    uploadResult,
    instantiateResult,
    loading,
    upload,
    instantiate,
    clearResults,
  };
}
