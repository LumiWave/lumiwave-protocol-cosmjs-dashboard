// src/components/wasm/WasmDeploySection.jsx

import { shortenAddress } from '../../utils/formatters';

export function WasmDeploySection({
  address,
  busy,
  canWasm,
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
  onUpload,
  onInstantiate,
}) {
  return (
    <div className="kgridSingle">
      <section className="kcard">
        <div className="kcardHead">
          <h3>CosmWasm Deploy</h3>
          <div className="kchip">Deployer: {shortenAddress(address)}</div>
        </div>

        {!canWasm && (
          <div className="klog">
            CosmWasm deploy is disabled for Cosmostation in this tool. Please connect with Keplr
            or Leap.
          </div>
        )}

        <div className="khelp">
          1) Store Code uploads a WASM artifact (creates codeId). 2) Instantiate creates a contract
          address.
        </div>

        <div className="kform">
          {/* Store Code */}
          <div>
            <div className="klabel">1) Store Code (Upload .wasm)</div>
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
          <div className="krow2" style={{ marginTop: 14 }}>
            <div>
              <div className="klabel">2) codeId</div>
              <input
                className="kinput"
                value={codeId}
                onChange={(e) => setCodeId(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <div>
              <div className="klabel">Label</div>
              <input
                className="kinput"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="klabel">Admin (optional, for migrate)</div>
            <input
              className="kinput"
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              placeholder="lumi..."
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="klabel">initMsg (JSON)</div>
            <textarea
              className="ktextarea"
              value={initMsg}
              onChange={(e) => setInitMsg(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="kbtn primary"
              onClick={onInstantiate}
              disabled={!address || busy || !canWasm}
            >
              Instantiate
            </button>
          </div>

          {instantiateResult && <div className="klog">{instantiateResult}</div>}
        </div>
      </section>
    </div>
  );
}
