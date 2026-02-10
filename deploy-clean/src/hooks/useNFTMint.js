// src/hooks/useNFTMint.js

import { useState, useCallback } from 'react';
import { mintNFT } from '../services/cw721Service';
import { safeStringify } from '../utils/formatters';

export function useNFTMint() {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const mint = useCallback(
    async (client, senderAddress) => {
      try {
        setLoading(true);
        setResult('');

        const mintResult = await mintNFT(
          client,
          senderAddress,
          contractAddress,
          tokenId,
          recipient || senderAddress,
          tokenUri
        );

        setResult(
          safeStringify({
            success: true,
            tokenId,
            recipient: recipient || senderAddress,
            ...mintResult,
          })
        );

        // Clear selected inputs
        setTokenId('');
        setTokenUri('');
      } catch (error) {
        console.error('NFT mint error:', error);
        setResult(
          safeStringify({
            success: false,
            error: error?.message || 'Mint failed',
          })
        );
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, tokenId, recipient, tokenUri]
  );

  const clearResult = useCallback(() => {
    setResult('');
  }, []);

  return {
    contractAddress,
    setContractAddress,
    tokenId,
    setTokenId,
    recipient,
    setRecipient,
    tokenUri,
    setTokenUri,
    result,
    loading,
    mint,
    clearResult,
  };
}
