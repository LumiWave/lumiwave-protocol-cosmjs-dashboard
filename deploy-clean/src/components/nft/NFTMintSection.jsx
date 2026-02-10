// src/components/nft/NFTMintSection.jsx

import { shortenAddress } from '../../utils/formatters';

export function NFTMintSection({
  address,
  busy,
  canWasm,
  contractAddress,
  setContractAddress,
  tokenId,
  setTokenId,
  recipient,
  setRecipient,
  tokenUri,
  setTokenUri,
  result,
  onMint,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>🎨 Mint NFT</h3>
          <div className="kchip">Minter: {shortenAddress(address)}</div>
        </div>

        {!canWasm && (
          <div className="klog">
            NFT minting is disabled for Cosmostation in this tool. Please connect with Keplr or
            Leap.
          </div>
        )}

        <div className="khelp">
          Mint NFTs to your deployed CW721 collection. You must be the minter of the collection.
        </div>

        <div className="kform">
          <div>
            <div className="klabel">Collection Contract Address</div>
            <input
              className="kinput"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="lumi1..."
            />
          </div>

          <div className="krow2" style={{ marginTop: 10 }}>
            <div>
              <div className="klabel">Token ID</div>
              <input
                className="kinput"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="e.g. 1, token-001, etc."
              />
            </div>
            <div>
              <div className="klabel">Recipient (optional)</div>
              <input
                className="kinput"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="lumi1... (defaults to you)"
              />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="klabel">Token URI (optional)</div>
            <input
              className="kinput"
              value={tokenUri}
              onChange={(e) => setTokenUri(e.target.value)}
              placeholder="https://... or ipfs://..."
            />
            <div className="khelp" style={{ marginTop: 4, fontSize: '12px' }}>
              Metadata URI (IPFS, HTTP, etc.). Can be empty.
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              className="kbtn primary"
              onClick={onMint}
              disabled={!address || busy || !canWasm || !contractAddress || !tokenId}
            >
              Mint NFT
            </button>
          </div>

          {result && <div className="klog">{result}</div>}
        </div>
      </section>
    </div>
  );
}
