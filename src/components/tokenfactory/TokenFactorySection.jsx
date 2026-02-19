// src/components/tokenfactory/TokenFactorySection.jsx

import { CHAIN_CONFIG } from '../../config/constants';
import { shortenAddress } from '../../utils/formatters';

export function TokenFactorySection({
  address,
  busy,
  subdenom,
  setSubdenom,
  createMemo,
  setCreateMemo,
  createdDenom,
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
  onCreateDenom,
  onMint,
  onSetMetadata,
  onRefreshBalances,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>Token Factory</h3>
          <div className="kchip">Creator: {shortenAddress(address)}</div>
        </div>

        <div className="khelp">
          1) Create denom 2) Mint supply 3) Set denom metadata for wallet display (symbol/decimals)
        </div>

        <div className="kform">
          <div className="klabel">1) Create Denom</div>

          <div className="krow2">
            <div>
              <div className="klabel">Subdenom</div>
              <input
                className="kinput"
                value={subdenom}
                onChange={(e) => setSubdenom(e.target.value)}
                placeholder="e.g. mycoin"
              />
            </div>
            <div>
              <div className="klabel">Memo (optional)</div>
              <input
                className="kinput"
                value={createMemo}
                onChange={(e) => setCreateMemo(e.target.value)}
                placeholder="e.g. create denom"
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="kbtn primary" onClick={onCreateDenom} disabled={!address || busy}>
              Create Denom
            </button>
            <button className="kbtn" onClick={onRefreshBalances} disabled={!address || busy}>
              Refresh Balances
            </button>
            <div className="kchip">
              Latest denom: <span className="kmono">{createdDenom || '-'}</span>
            </div>
          </div>

          {createResult && <div className="klog">{createResult}</div>}

          <div style={{ marginTop: 16 }}>
            <div className="klabel">2) Mint Supply</div>

            <div className="krow2">
              <div>
                <div className="klabel">Denom</div>
                <input
                  className="kinput"
                  value={mintDenom}
                  onChange={(e) => setMintDenom(e.target.value)}
                  placeholder="factory/lumi1.../mycoin"
                />
              </div>
              <div>
                <div className="klabel">Recipient</div>
                <input
                  className="kinput"
                  value={mintToAddress}
                  onChange={(e) => setMintToAddress(e.target.value)}
                  placeholder="lumi..."
                />
              </div>
            </div>

            <div className="krow2" style={{ marginTop: 10 }}>
              <div>
                <div className="klabel">Amount ({CHAIN_CONFIG.displayDenom})</div>
                <input
                  className="kinput"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                />
              </div>
              <div>
                <div className="klabel">Memo (optional)</div>
                <input
                  className="kinput"
                  value={mintMemo}
                  onChange={(e) => setMintMemo(e.target.value)}
                  placeholder="e.g. initial supply"
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="kbtn primary" onClick={onMint} disabled={!address || busy}>
                Mint
              </button>
            </div>
          </div>

          {mintResult && <div className="klog">{mintResult}</div>}

          <div style={{ marginTop: 16 }}>
            <div className="klabel">3) Set Denom Metadata (Keplr Display)</div>

            <div className="krow2">
              <div>
                <div className="klabel">Base Denom</div>
                <input
                  className="kinput"
                  value={metadataDenom}
                  onChange={(e) => setMetadataDenom(e.target.value)}
                  placeholder="factory/lumi1.../mycoin"
                />
              </div>
              <div>
                <div className="klabel">Display Denom</div>
                <input
                  className="kinput"
                  value={metadataDisplayDenom}
                  onChange={(e) => setMetadataDisplayDenom(e.target.value)}
                  placeholder="UBTP1"
                />
              </div>
            </div>

            <div className="krow2" style={{ marginTop: 10 }}>
              <div>
                <div className="klabel">Symbol</div>
                <input
                  className="kinput"
                  value={metadataSymbol}
                  onChange={(e) => setMetadataSymbol(e.target.value)}
                  placeholder="UBTP1"
                />
              </div>
              <div>
                <div className="klabel">Name</div>
                <input
                  className="kinput"
                  value={metadataName}
                  onChange={(e) => setMetadataName(e.target.value)}
                  placeholder="Lumi Ubtp1"
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="klabel">Description</div>
              <input
                className="kinput"
                value={metadataDescription}
                onChange={(e) => setMetadataDescription(e.target.value)}
                placeholder="Tokenfactory token for LumiWave testnet"
              />
            </div>

            <div className="krow2" style={{ marginTop: 10 }}>
              <div>
                <div className="klabel">Decimals</div>
                <input
                  className="kinput"
                  value={metadataDecimals}
                  onChange={(e) => setMetadataDecimals(e.target.value)}
                  placeholder="6"
                />
              </div>
              <div>
                <div className="klabel">URI (optional)</div>
                <input
                  className="kinput"
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="klabel">Memo (optional)</div>
              <input
                className="kinput"
                value={metadataMemo}
                onChange={(e) => setMetadataMemo(e.target.value)}
                placeholder="e.g. set denom metadata"
              />
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="kbtn primary" onClick={onSetMetadata} disabled={!address || busy}>
                Set Metadata
              </button>
            </div>
          </div>

          {metadataResult && <div className="klog">{metadataResult}</div>}
        </div>
      </section>
    </div>
  );
}
