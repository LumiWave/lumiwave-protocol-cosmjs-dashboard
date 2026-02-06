// src/components/layout/Sidebar.jsx

import { shortenAddress } from '../../utils/formatters';
import { CHAIN_CONFIG, TABS } from '../../config/constants';

export function Sidebar({ active, setActive, walletType, address, connected, canWasm }) {
  return (
    <aside className="kside">
      <div className="kbrand">
        <div className="kbrandTitle">LumiWave Protocol</div>
        <div className="kbrandSub">Testnet Tools</div>
      </div>

      <div className="kprofile">
        <div className="kavatar" />
        <div className="kprofileText">
          <div className="kprofileName">{connected ? 'Connected' : 'Disconnected'}</div>
          <div className="kprofileAddr">{shortenAddress(address)}</div>
        </div>
      </div>

      <nav className="knav">
        <button
          className={`knavItem ${active === TABS.DASHBOARD ? 'active' : ''}`}
          onClick={() => setActive(TABS.DASHBOARD)}
        >
          Dashboard
        </button>
        <button
          className={`knavItem ${active === TABS.FAUCET ? 'active' : ''}`}
          onClick={() => setActive(TABS.FAUCET)}
        >
          Faucet
        </button>
        <button
          className={`knavItem ${active === TABS.SEND ? 'active' : ''}`}
          onClick={() => setActive(TABS.SEND)}
        >
          Bank Send
        </button>
        <button
          className={`knavItem ${active === TABS.WASM ? 'active' : ''}`}
          onClick={() => setActive(TABS.WASM)}
          disabled={!canWasm}
          title={!canWasm ? 'Cosmostation is limited to Bank Send in this tool.' : ''}
        >
          CosmWasm Deploy
        </button>
      </nav>

      <div className="ksideFooter">
        <div className="kmetaRow">
          <span>Wallet</span>
          <span className="kmono">{walletType || '-'}</span>
        </div>
        <div className="kmetaRow">
          <span>RPC</span>
          <span className="kmono">{CHAIN_CONFIG.rpc}</span>
        </div>
        <div className="kmetaRow">
          <span>REST</span>
          <span className="kmono">{CHAIN_CONFIG.rest}</span>
        </div>
      </div>
    </aside>
  );
}
