// src/components/nft/NFTDeploySection.jsx

import { shortenAddress } from '../../utils/formatters';

export function NFTDeploySection({
  address,
  busy,
  canWasm,
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
  onUpload,
  onInstantiate,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>🖼️ NFT Collection Deploy (CW721)</h3>
          <div className="kchip">Deployer: {shortenAddress(address)}</div>
        </div>

        {!canWasm && (
          <div className="klog">
            NFT deploy is disabled for Cosmostation in this tool. Please connect with Keplr or
            Leap.
          </div>
        )}

        <div className="khelp">
          Deploy CW721 NFT collection contract. After deployment, you can mint NFTs in the NFT Mint
          tab.
        </div>

        <div className="kform">
          {/* Store Code */}
          <div>
            <div className="klabel">1) Store Code (Upload CW721 .wasm)</div>
            <input
              className="kinput"
              type="file"
              accept=".wasm"
              onChange={(e) => setWasmFile(e.target.files?.[0] ?? null)}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <button
                className="kbtn primary"
                onClick={onUpload}
                disabled={!address || busy || !canWasm}
              >
                Store Code
              </button>
              <div className="kchip">Selected: {wasmFile ? wasmFile.name : 'none'}</div>
            </div>
            {uploadResult && <div className="klog">{uploadResult}</div>}
          </div>

          {/* Instantiate */}
          <div style={{ marginTop: 20 }}>
            <div className="klabel">2) Collection Information</div>

            <div className="krow2" style={{ marginTop: 10 }}>
              <div>
                <div className="klabel">Code ID</div>
                <input
                  className="kinput"
                  value={codeId}
                  onChange={(e) => setCodeId(e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <div className="klabel">Collection Name</div>
                <input
                  className="kinput"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. My NFT Collection"
                />
              </div>
            </div>

            <div className="krow2" style={{ marginTop: 10 }}>
              <div>
                <div className="klabel">Symbol</div>
                <input
                  className="kinput"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. MNFT"
                />
              </div>
              <div>
                <div className="klabel">Minter Address</div>
                <input
                  className="kinput"
                  value={minter}
                  onChange={(e) => setMinter(e.target.value)}
                  placeholder="lumi1... (defaults to your address)"
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="klabel">Admin (optional, for migrate)</div>
              <input
                className="kinput"
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                placeholder="lumi1..."
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className="kbtn primary"
                onClick={onInstantiate}
                disabled={!address || busy || !canWasm}
              >
                Deploy Collection
              </button>
            </div>

            {instantiateResult && <div className="klog">{instantiateResult}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
