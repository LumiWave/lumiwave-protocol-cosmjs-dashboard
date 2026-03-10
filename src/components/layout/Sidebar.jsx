// src/components/layout/Sidebar.jsx

import { shortenAddress } from '../../utils/formatters';
import { TABS } from '../../config/constants';
import { NETWORK_TYPE } from '../../config/networks';

export function Sidebar({
  active,
  setActive,
  walletType,
  address,
  connected,
  canWasm,
  networkType,
  onSwitchNetwork,
  chainConfig,
  isTestnet,
}) {
  return (
    <aside className="kside">
      <div className="kbrand">
        <div className="kbrandTitle">LumiWave Protocol</div>
        <div className="kbrandSub">{chainConfig.chainName}</div>
      </div>

      <div className="knetworkSwitch">
        <select
          className="knetworkSelect"
          value={networkType}
          onChange={(e) => onSwitchNetwork(e.target.value)}
        >
          <option value={NETWORK_TYPE.TESTNET}>Testnet</option>
          <option value={NETWORK_TYPE.MAINNET}>Mainnet</option>
        </select>
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
        {isTestnet && (
          <button
            className={`knavItem ${active === TABS.FAUCET ? 'active' : ''}`}
            onClick={() => setActive(TABS.FAUCET)}
          >
            Faucet
          </button>
        )}
        <button
          className={`knavItem ${active === TABS.SEND ? 'active' : ''}`}
          onClick={() => setActive(TABS.SEND)}
        >
          Bank Send
        </button>
        <button
          className={`knavItem ${active === TABS.TOKEN_FACTORY ? 'active' : ''}`}
          onClick={() => setActive(TABS.TOKEN_FACTORY)}
        >
          Token Factory
        </button>
        <button
          className={`knavItem ${active === TABS.WASM ? 'active' : ''}`}
          onClick={() => setActive(TABS.WASM)}
          disabled={!canWasm}
          title={!canWasm ? 'Cosmostation is limited to Bank Send in this tool.' : ''}
        >
          CosmWasm Deploy
        </button>
        <button
          className={`knavItem ${active === TABS.NFT_DEPLOY ? 'active' : ''}`}
          onClick={() => setActive(TABS.NFT_DEPLOY)}
          disabled={!canWasm}
          title={!canWasm ? 'Cosmostation does not support NFT operations.' : ''}
        >
          NFT Deploy
        </button>
        <button
          className={`knavItem ${active === TABS.NFT_MINT ? 'active' : ''}`}
          onClick={() => setActive(TABS.NFT_MINT)}
          disabled={!canWasm}
          title={!canWasm ? 'Cosmostation does not support NFT operations.' : ''}
        >
          NFT Mint
        </button>
      </nav>

      <div className="ksideFooter">
        <div className="kmetaRow">
          <span>Wallet</span>
          <span className="kmono">{walletType || '-'}</span>
        </div>
        <div className="kmetaRow">
          <span>RPC</span>
          <span className="kmono">{chainConfig.rpc}</span>
        </div>
        <div className="kmetaRow">
          <span>REST</span>
          <span className="kmono">{chainConfig.rest}</span>
        </div>
      </div>
    </aside>
  );
}
