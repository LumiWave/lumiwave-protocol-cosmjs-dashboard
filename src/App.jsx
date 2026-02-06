import { useMemo, useRef, useState } from "react";
import "./App.css";

import { GasPrice, SigningStargateClient, coins } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { buildChainInfo } from "./keplr";
import { WALLET, getAvailableWallets, walletCapabilities, connectWallet } from "./wallets";

const env = import.meta.env;

function safeJsonParse(s) {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function shorten(addr) {
  if (!addr) return "-";
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

/**
 * Safely stringify objects that may contain BigInt (CosmJS results can include BigInt).
 */
function safeStringify(obj, space = 2) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    space
  );
}

function WalletModal({ open, onClose, onPick }) {
  if (!open) return null;

  const wallets = getAvailableWallets();

  return (
    <div className="kmodalBackdrop" onMouseDown={onClose}>
      <div className="kmodal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="kmodalHead">
          <div>
            <div className="kmodalTitle">Connect Wallet</div>
            <div className="kmodalSub">
              Select a wallet to connect. Keplr & Leap support full features (CosmWasm deploy).
              Cosmostation is limited to Bank Send.
            </div>
          </div>
          <button className="kmodalClose" onClick={onClose}>Close</button>
        </div>

        <div className="kwalletList">
          {wallets.map((w) => {
            const cap = walletCapabilities(w.type);
            return (
              <button
                key={w.type}
                className="kwalletItem"
                disabled={!w.available}
                onClick={() => onPick(w.type)}
                style={{ opacity: w.available ? 1 : 0.45 }}
              >
                <div className="kwalletLeft">
                  <div className="kwalletName">{w.name}</div>
                  <div className="kwalletMeta">{cap.label}</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`kpill ${w.available ? "ok" : "bad"}`}>
                    {w.available ? "Detected" : "Not installed"}
                  </span>
                  <span className="kpill">{w.type}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const chainInfo = useMemo(() => buildChainInfo(env), []);
  const stargateRef = useRef(null);
  const wasmRef = useRef(null);

  const [active, setActive] = useState("dashboard"); // dashboard | faucet | send | wasm
  const [status, setStatus] = useState("Disconnected");
  const [walletType, setWalletType] = useState(null); // keplr | leap | cosmostation
  const [modalOpen, setModalOpen] = useState(false);

  const [address, setAddress] = useState("");
  const [height, setHeight] = useState(null);
  const [balancesText, setBalancesText] = useState("");

  // faucet
  const faucetApiBase = (env.VITE_FAUCET_API || "").replace(/\/$/, "");
  const [faucetResult, setFaucetResult] = useState("");

  // Bank send
  const [toAddr, setToAddr] = useState("");
  const [sendAmount, setSendAmount] = useState("1");
  const [sendMemo, setSendMemo] = useState("");
  const [sendResult, setSendResult] = useState("");

  // CosmWasm upload/instantiate
  const [wasmFile, setWasmFile] = useState(null);
  const [uploadResult, setUploadResult] = useState("");
  const [codeId, setCodeId] = useState("");
  const [label, setLabel] = useState("lumiwave-contract");
  const [admin, setAdmin] = useState("");
  const [initMsg, setInitMsg] = useState('{"owner":"REPLACE_ME","count":0}');
  const [instantiateResult, setInstantiateResult] = useState("");

  const displayDenom = env.VITE_DENOM_DISPLAY || "TOKEN";
  const baseDenom = env.VITE_DENOM || "utoken";
  const decimals = Number(env.VITE_DECIMALS || "6");
  const gasPriceStr = env.VITE_GAS_PRICE || `0.025${baseDenom}`;

  const cap = walletType ? walletCapabilities(walletType) : { canWasm: false, canBankSend: false };
  const canWasm = !!cap.canWasm;

  const busy =
    status.startsWith("Suggesting") ||
    status.startsWith("Connecting") ||
    status.startsWith("Uploading") ||
    status.startsWith("Instantiating") ||
    status.startsWith("Sending") ||
    status.startsWith("Requesting");

  function displayToBaseAmount(displayAmountStr) {
    const s = (displayAmountStr || "").trim();
    if (!s) return "0";
    const [whole, fracRaw = ""] = s.split(".");
    const frac = (fracRaw + "0".repeat(decimals)).slice(0, decimals);
    const wholeClean = whole.replace(/^0+(?=\d)/, "") || "0";
    const base = `${wholeClean}${frac}`.replace(/^0+(?=\d)/, "") || "0";
    return base;
  }

  function formatAmount(amountStr, denom) {
    // only convert base denom -> display denom
    if (denom !== baseDenom) return `${amountStr}${denom}`;

    // baseDenom(ulwp) -> displayDenom(LWP) with decimals
    const raw = (amountStr || "0").trim();
    let n;
    try {
      n = BigInt(raw);
    } catch {
      return `${amountStr}${denom}`;
    }

    const d = BigInt(decimals);
    const scale = 10n ** d;

    const whole = n / scale;
    const frac = n % scale;

    // keep up to 6 fractional digits (same as decimals) but trim trailing zeros
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    const display = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();

    return `${amountStr}${denom} (${display} ${displayDenom})`;
  }

  async function fetchBalances(addr) {
    const url = `${chainInfo.rest}cosmos/bank/v1beta1/balances/${addr}`;
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(`Balance query failed: ${r.status} ${r.statusText}`);
    const j = await r.json();
    const arr = j?.balances || [];
    if (!arr.length) return "(no balances)";

    // Example output:
    // 13495912ulwp (13.495912 LWP), 1234uother
    return arr
      .map((b) => formatAmount(b.amount, b.denom))
      .join(", ");
  }

  async function connectWith(wallet) {
    try {
      setModalOpen(false);
      setStatus("Connecting...");

      const gasPrice = GasPrice.fromString(gasPriceStr);

      setStatus("Suggesting chain to wallet...");
      const { signer, address: addr } = await connectWallet(wallet, chainInfo);

      setWalletType(wallet);
      setAddress(addr);

      setStatus("Creating CosmJS clients...");

      // Stargate client always (bank send)
      const stargate = await SigningStargateClient.connectWithSigner(chainInfo.rpc, signer, { gasPrice });
      stargateRef.current = stargate;

      // WASM client only for Keplr/Leap
      if (walletCapabilities(wallet).canWasm) {
        const wasm = await SigningCosmWasmClient.connectWithSigner(chainInfo.rpc, signer, { gasPrice });
        wasmRef.current = wasm;
      } else {
        wasmRef.current = null;
      }

      const h = await stargate.getHeight();
      setHeight(h);

      const b = await fetchBalances(addr);
      setBalancesText(b);

      if (addr && initMsg.includes("REPLACE_ME")) {
        setInitMsg(initMsg.replace("REPLACE_ME", addr));
      }

      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setStatus(e?.message || "Connection failed");
    }
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setStatus("Address copied");
    setTimeout(() => setStatus("Connected"), 900);
  }

  async function requestFaucet() {
    try {
      if (!address) throw new Error("Connect wallet first");
      if (!faucetApiBase) throw new Error("VITE_FAUCET_API is not set");

      setStatus("Requesting faucet...");
      setFaucetResult("");

      const endpoint = `${faucetApiBase}/`;
      const body = {
        query: "mutation($input: SendInput!) { send(input: $input) }",
        variables: { input: { toAddress: address } },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      // ✅ friendly handling for faucet rate limit
      if (res.status === 429) {
        setFaucetResult("⏳ Faucet limited: 1 request per IP per 24h. Try again later.");
        setStatus("Connected");
        return;
      }

      if (!res.ok) throw new Error(`Faucet HTTP ${res.status}: ${text}`);

      let json;
      try { json = JSON.parse(text); } catch { throw new Error(`Unexpected faucet response: ${text}`); }

      if (!json?.data || json.data.send !== null) {
        throw new Error(`Unexpected faucet response: ${safeStringify(json)}`);
      }

      setFaucetResult("✅ Faucet request successful. Tokens are being sent.");
      await new Promise((r) => setTimeout(r, 1200));
      setBalancesText(await fetchBalances(address));
      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setFaucetResult(e?.message || "Faucet request failed");
      setStatus("Connected");
    }
  }

  async function onSend() {
    try {
      if (!stargateRef.current) throw new Error("Not connected");
      if (!toAddr) throw new Error("Recipient address is required");

      const baseAmount = displayToBaseAmount(sendAmount);
      if (BigInt(baseAmount) <= 0n) throw new Error("Amount must be greater than 0");

      setStatus("Sending tokens...");
      setSendResult("");

      const res = await stargateRef.current.sendTokens(
        address,
        toAddr.trim(),
        coins(baseAmount, baseDenom),
        "auto",
        sendMemo || undefined
      );

      // ✅ Avoid BigInt JSON stringify crash (some fields may be BigInt)
      setSendResult(
        safeStringify({
          txhash: res.transactionHash,
          height: res.height,
          gasUsed: res.gasUsed,
          gasWanted: res.gasWanted,
        })
      );

      await new Promise((r) => setTimeout(r, 900));
      setBalancesText(await fetchBalances(address));

      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setSendResult(e?.message || "Send failed");
      setStatus("Connected");
    }
  }

  async function onUploadWasm() {
    try {
      if (!canWasm) throw new Error("Cosmostation does not support CosmWasm deploy in this tool.");
      if (!wasmRef.current) throw new Error("Not connected");
      if (!wasmFile) throw new Error("Select a .wasm file first");

      setStatus("Uploading WASM (Store Code)...");
      setUploadResult("");
      setInstantiateResult("");

      const buf = new Uint8Array(await wasmFile.arrayBuffer());
      const res = await wasmRef.current.upload(address, buf, "auto");

      setCodeId(String(res.codeId));
      setUploadResult(
        safeStringify({ codeId: res.codeId, txhash: res.transactionHash, height: res.height })
      );

      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setUploadResult(e?.message || "Upload failed");
      setStatus("Connected");
    }
  }

  async function onInstantiate() {
    try {
      if (!canWasm) throw new Error("Cosmostation does not support CosmWasm deploy in this tool.");
      if (!wasmRef.current) throw new Error("Not connected");

      const cid = Number(codeId);
      if (!cid || cid <= 0) throw new Error("Valid codeId is required");
      if (!label.trim()) throw new Error("Label is required");

      const parsed = safeJsonParse(initMsg);
      if (!parsed.ok) throw new Error(`initMsg JSON error: ${parsed.error}`);

      setStatus("Instantiating contract...");
      setInstantiateResult("");

      const opts = admin.trim() ? { admin: admin.trim() } : undefined;
      const res = await wasmRef.current.instantiate(address, cid, parsed.value, label.trim(), "auto", opts);

      setInstantiateResult(
        safeStringify({ contractAddress: res.contractAddress, txhash: res.transactionHash, height: res.height })
      );
      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setInstantiateResult(e?.message || "Instantiate failed");
      setStatus("Connected");
    }
  }

  const connected = status === "Connected" || status === "Address copied";

  return (
    <div className="kapp">
      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPick={(type) => connectWith(type)}
      />

      {/* Sidebar */}
      <aside className="kside">
        <div className="kbrand">
          <div className="kbrandTitle">LumiWave Protocol</div>
          <div className="kbrandSub">Testnet Tools</div>
        </div>

        <div className="kprofile">
          <div className="kavatar" />
          <div className="kprofileText">
            <div className="kprofileName">{connected ? "Connected" : "Disconnected"}</div>
            <div className="kprofileAddr">{shorten(address)}</div>
          </div>
        </div>

        <nav className="knav">
          <button className={`knavItem ${active === "dashboard" ? "active" : ""}`} onClick={() => setActive("dashboard")}>
            Dashboard
          </button>
          <button className={`knavItem ${active === "faucet" ? "active" : ""}`} onClick={() => setActive("faucet")}>
            Faucet
          </button>
          <button className={`knavItem ${active === "send" ? "active" : ""}`} onClick={() => setActive("send")}>
            Bank Send
          </button>
          <button
            className={`knavItem ${active === "wasm" ? "active" : ""}`}
            onClick={() => setActive("wasm")}
            disabled={!canWasm}
            title={!canWasm ? "Cosmostation is limited to Bank Send in this tool." : ""}
          >
            CosmWasm Deploy
          </button>
        </nav>

        <div className="ksideFooter">
          <div className="kmetaRow">
            <span>Wallet</span>
            <span className="kmono">{walletType || "-"}</span>
          </div>
          <div className="kmetaRow">
            <span>RPC</span>
            <span className="kmono">{chainInfo.rpc}</span>
          </div>
          <div className="kmetaRow">
            <span>REST</span>
            <span className="kmono">{chainInfo.rest}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="kmain">
        {/* Top bar */}
        <div className="ktop">
          <div className="ktopLeft">
            <div className="ktopTitle">{env.VITE_CHAIN_NAME || "LumiWave Protocol Testnet"} Dashboard</div>
            <div className="ktopSub">Wallet connection, faucet, transfers, and CosmWasm deployment.</div>
          </div>

          <div className="ktopRight">
            <div className="kbadge">
              <span>Status</span>
              <b>{status}</b>
            </div>
            <button className="kbtn primary" onClick={() => setModalOpen(true)} disabled={busy}>
              Connect Wallet
            </button>
            <button className="kbtn" onClick={copyAddress} disabled={!address || busy}>
              Copy Address
            </button>
          </div>
        </div>

        {/* Content */}
        {active === "dashboard" && (
          <div className="kgrid">
            <section className="kcard">
              <div className="kcardHead">
                <h3>Overview</h3>
                <div className="kchip">{env.VITE_CHAIN_ID}</div>
              </div>

              <div className="kkv">
                <div className="kk">Wallet</div>
                <div className="kvv kmono">{walletType || "-"}</div>

                <div className="kk">Address</div>
                <div className="kvv kmono">{address || "-"}</div>

                <div className="kk">Height</div>
                <div className="kvv kmono">{height ?? "-"}</div>

                <div className="kk">Denom</div>
                <div className="kvv kmono">{displayDenom} ({baseDenom}, decimals={decimals})</div>

                <div className="kk">Balances</div>
                <div className="kvv kmono">{balancesText || "-"}</div>

                <div className="kk">Gas Price</div>
                <div className="kvv kmono">{gasPriceStr}</div>
              </div>
            </section>

            <section className="kcard">
              <div className="kcardHead">
                <h3>Quick Actions</h3>
              </div>

              <div className="krow2">
                <button className="kbtn primary" onClick={requestFaucet} disabled={!address || busy}>
                  Request Faucet
                </button>
                <button className="kbtn" onClick={() => setActive("send")} disabled={!address}>
                  Bank Send
                </button>
              </div>

              <div className="krow2" style={{ marginTop: 10 }}>
                <button className="kbtn" onClick={() => setActive("wasm")} disabled={!address || !canWasm}>
                  CosmWasm Deploy
                </button>
                <button
                  className="kbtn"
                  onClick={async () => address && setBalancesText(await fetchBalances(address))}
                  disabled={!address || busy}
                >
                  Refresh Balances
                </button>
              </div>

              {faucetResult ? <div className="klog">{faucetResult}</div> : null}
              {sendResult ? <div className="klog">{sendResult}</div> : null}
              {uploadResult ? <div className="klog">{uploadResult}</div> : null}
              {instantiateResult ? <div className="klog">{instantiateResult}</div> : null}
            </section>
          </div>
        )}

        {active === "faucet" && (
          <div className="kgridSingle">
            <section className="kcard">
              <div className="kcardHead">
                <h3>Faucet</h3>
                <div className="kchip">{shorten(address)}</div>
              </div>

              <div className="khelp">
                Faucet sends test tokens to your connected wallet. This action may be rate-limited.
              </div>

              <div className="krow2">
                <button className="kbtn primary" onClick={requestFaucet} disabled={!address || busy}>
                  Request Faucet
                </button>
                <button className="kbtn" onClick={async () => address && setBalancesText(await fetchBalances(address))} disabled={!address || busy}>
                  Refresh Balances
                </button>
              </div>

              <div className="kkv" style={{ marginTop: 12 }}>
                <div className="kk">Balances</div>
                <div className="kvv kmono">{balancesText || "-"}</div>
              </div>

              {faucetResult ? <div className="klog">{faucetResult}</div> : null}
            </section>
          </div>
        )}

        {active === "send" && (
          <div className="kgridSingle">
            <section className="kcard">
              <div className="kcardHead">
                <h3>Bank Send</h3>
                <div className="kchip">From: {shorten(address)}</div>
              </div>

              <div className="kform">
                <div>
                  <div className="klabel">Recipient (bech32)</div>
                  <input className="kinput" value={toAddr} onChange={(e) => setToAddr(e.target.value)} placeholder="lumi1..." />
                </div>

                <div className="krow2" style={{ marginTop: 10 }}>
                  <div>
                    <div className="klabel">Amount ({displayDenom})</div>
                    <input className="kinput" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                  </div>
                  <div>
                    <div className="klabel">Memo (optional)</div>
                    <input className="kinput" value={sendMemo} onChange={(e) => setSendMemo(e.target.value)} placeholder="e.g. test transfer" />
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="kbtn primary" onClick={onSend} disabled={!address || busy}>
                    Send
                  </button>
                  <button className="kbtn" onClick={async () => address && setBalancesText(await fetchBalances(address))} disabled={!address || busy}>
                    Refresh Balances
                  </button>
                </div>

                {sendResult ? <div className="klog">{sendResult}</div> : null}
              </div>
            </section>
          </div>
        )}

        {active === "wasm" && (
          <div className="kgridSingle">
            <section className="kcard">
              <div className="kcardHead">
                <h3>CosmWasm Deploy</h3>
                <div className="kchip">Deployer: {shorten(address)}</div>
              </div>

              {!canWasm && (
                <div className="klog">
                  CosmWasm deploy is disabled for Cosmostation in this tool. Please connect with Keplr or Leap.
                </div>
              )}

              <div className="khelp">
                1) Store Code uploads a WASM artifact (creates codeId). 2) Instantiate creates a contract address.
              </div>

              <div className="kform">
                <div>
                  <div className="klabel">1) Store Code (Upload .wasm)</div>
                  <input className="kinput" type="file" accept=".wasm" onChange={(e) => setWasmFile(e.target.files?.[0] ?? null)} />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button className="kbtn primary" onClick={onUploadWasm} disabled={!address || busy || !canWasm}>
                      Store Code
                    </button>
                    <div className="kchip">Selected: {wasmFile ? wasmFile.name : "none"}</div>
                  </div>
                  {uploadResult ? <div className="klog">{uploadResult}</div> : null}
                </div>

                <div className="krow2" style={{ marginTop: 14 }}>
                  <div>
                    <div className="klabel">2) codeId</div>
                    <input className="kinput" value={codeId} onChange={(e) => setCodeId(e.target.value)} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <div className="klabel">Label</div>
                    <input className="kinput" value={label} onChange={(e) => setLabel(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="klabel">Admin (optional, for migrate)</div>
                  <input className="kinput" value={admin} onChange={(e) => setAdmin(e.target.value)} placeholder="lumi1..." />
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="klabel">initMsg (JSON)</div>
                  <textarea className="ktextarea" value={initMsg} onChange={(e) => setInitMsg(e.target.value)} />
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="kbtn primary" onClick={onInstantiate} disabled={!address || busy || !canWasm}>
                    Instantiate
                  </button>
                </div>

                {instantiateResult ? <div className="klog">{instantiateResult}</div> : null}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
