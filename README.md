# LumiWave Protocol Testnet Dashboard

Web dashboard for LumiWave testnet operations, built with React + Vite and CosmJS.

It provides one UI for wallet connection, faucet requests, native transfers, tokenfactory native coin deployment, CosmWasm deployment, and CW721 NFT mint flow.

![LumiWave Testnet Dashboard](images/dashboard.png)

## Features

- Wallet connection
  - Keplr: full support
  - Leap: full support
  - Cosmostation: Bank Send only
- Faucet request (GraphQL endpoint, rate-limit aware)
- Bank Send (native token transfer)
- Token Factory (native coin deployment)
  - Create denom (`MsgCreateDenom`)
  - Mint supply (`MsgMint`)
  - Set metadata (`MsgSetDenomMetadata`)
- CosmWasm Deploy
  - Store Code (`.wasm` upload)
  - Instantiate contract with custom `initMsg` JSON
- NFT Deploy (CW721)
  - Store Code (`.wasm`)
  - Instantiate collection (`name`, `symbol`, `minter`, optional `admin`)
- NFT Mint (CW721 `mint` execute)
- Native balance view in base/display denom formats

## Requirements

- Node.js 18+
- npm 9+
- Browser wallet extension: Keplr or Leap recommended (Cosmostation is limited in this app)

## Installation

```bash
npm install
```

## Environment Variables

Create `.env` as baseline config, use `.env.local` for local overrides in `npm run dev`, and use `.env.production` for production build.

Priority in dev mode:
- `.env.local` (highest, local-only)
- `.env`

### Local Development (`.env`)

```env
VITE_CHAIN_ID=lumiwaveprotocol
VITE_CHAIN_NAME=LumiWave Protocol Testnet

# Endpoints
# RPC: browser-accessible CometBFT JSON-RPC
VITE_RPC=https://lwp-testnet.lumiwavelab.com/tendermint/
# REST: must include trailing slash (used for direct path concatenation)
VITE_REST=https://lwp-testnet.lumiwavelab.com/

# Address / token config
VITE_BECH32_PREFIX=lumi
VITE_DENOM=ulwp
VITE_DENOM_DISPLAY=LWP
VITE_DECIMALS=6
VITE_GAS_PRICE=0.025ulwp
VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgCreateDenom
VITE_TOKENFACTORY_MINT_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgMint
VITE_TOKENFACTORY_SET_METADATA_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata
VITE_TOKENFACTORY_SET_METADATA_GAS_MULTIPLIER=1.8

# Faucet via Vite proxy
VITE_FAUCET_API=/api/faucet
```

### Local Mainnet Override (`.env.local`, for `npm run dev`)

```env
VITE_CHAIN_ID=lumiwaveprotocol
VITE_CHAIN_NAME=LumiWave Protocol Mainnet (Local)
VITE_RPC=http://127.0.0.1:26657
VITE_REST=http://127.0.0.1:1317/
VITE_BECH32_PREFIX=lumi
VITE_DENOM=ulwp
VITE_DENOM_DISPLAY=LWP
VITE_DECIMALS=6
VITE_GAS_PRICE=0.025ulwp
VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgCreateDenom
VITE_TOKENFACTORY_MINT_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgMint
VITE_TOKENFACTORY_SET_METADATA_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata
VITE_TOKENFACTORY_SET_METADATA_GAS_MULTIPLIER=1.8
VITE_FAUCET_API=/api/faucet
VITE_FAUCET_PROXY_TARGET=http://127.0.0.1:4500
VITE_FAUCET_PROXY_REWRITE=/faucet/
```

### Production (`.env.production`) Example

```env
VITE_CHAIN_ID=lumiwaveprotocol
VITE_CHAIN_NAME=LumiWave Protocol Testnet
VITE_RPC=https://lwp-testnet.lumiwavelab.com/tendermint/
VITE_REST=https://lwp-testnet.lumiwavelab.com/
VITE_BECH32_PREFIX=lumi
VITE_DENOM=ulwp
VITE_DENOM_DISPLAY=LWP
VITE_DECIMALS=6
VITE_GAS_PRICE=0.025ulwp
VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgCreateDenom
VITE_TOKENFACTORY_MINT_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgMint
VITE_TOKENFACTORY_SET_METADATA_TYPE_URL=/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata
VITE_TOKENFACTORY_SET_METADATA_GAS_MULTIPLIER=1.8
VITE_FAUCET_API=/api/faucet/
```

Notes:
- `VITE_FAUCET_API` is the value actually used for faucet requests.
- Wallet chain suggestion uses the above chain/token fields directly, so set all of them.
- Keep trailing slash for `VITE_REST`.
- `VITE_FAUCET_API` can be absolute URL or relative path.
- `vite.config.js` proxy can be overridden by `VITE_FAUCET_PROXY_PATH`, `VITE_FAUCET_PROXY_TARGET`, `VITE_FAUCET_PROXY_REWRITE`.
- If mainnet tokenfactory protobuf package differs, override the three `VITE_TOKENFACTORY_*_TYPE_URL` values.

### Faucet Configuration Modes

- Dev mode (recommended): use `VITE_FAUCET_API=/api/faucet` and Vite proxy in `vite.config.js`.
- Prod mode:
  - Option A: serve API under same origin (`/api/faucet`) using reverse proxy.
  - Option B: set `VITE_FAUCET_API` to absolute faucet endpoint.

## Run

```bash
npm run dev
```

Local URL: `http://localhost:5173`

## Scripts

```bash
npm run dev      # start dev server
npm run start    # same as dev
npm run build    # production build
npm run preview  # preview built app
npm run lint     # eslint
```

## Wallet Support Matrix

| Wallet | Connect | Faucet | Bank Send | CosmWasm Deploy | NFT Deploy/Mint |
|---|---|---|---|---|---|
| Keplr | Yes | Yes | Yes | Yes | Yes |
| Leap | Yes | Yes | Yes | Yes | Yes |
| Cosmostation | Yes | Yes | Yes | No | No |

Tokenfactory uses Stargate transaction signing and is available for all wallets in this app.

## Usage

### 1) Connect Wallet

1. Click `Connect Wallet`
2. Select Keplr / Leap / Cosmostation
3. On success, address, block height, and balances appear in Dashboard

Cosmostation policy in this app:
- `Bank Send`: supported
- `Token Factory`: supported
- `CosmWasm Deploy`, `NFT Deploy`, `NFT Mint`: disabled

### 2) Faucet

1. Open `Faucet`
2. Click `Request Faucet`
3. If rate-limited, the UI shows a friendly message (`429` handling)

### 3) Bank Send

1. Enter recipient bech32 address (e.g. `lumi1...`)
2. Enter amount in display denom (e.g. `LWP`)
3. Optional memo
4. Submit and approve in wallet

Amount is converted to base denom using `VITE_DECIMALS`.

### 4) CosmWasm Deploy

1. Upload compiled `.wasm`
2. Click `Store Code` to get `codeId`
3. Fill `codeId`, `label`, optional `admin`, `initMsg` JSON
4. Click `Instantiate`

You can deploy CW20 or any compatible CosmWasm contract by providing correct `initMsg`.

### 5) Token Factory (New Native Coin)

1. Open `Token Factory`
2. Enter `subdenom` and click `Create Denom`
3. Confirm the created denom (typically `factory/{creator}/{subdenom}`)
4. Enter amount and recipient, then click `Mint`
5. Set `Display/Symbol/Decimals` and click `Set Metadata` (for wallet display)

Amount is entered in display denom and converted to base units using `VITE_DECIMALS`.

### 6) NFT Deploy (CW721)

1. Upload CW721 `.wasm`
2. `Store Code`
3. Fill `codeId`, `collectionName`, `symbol`, optional `minter` / `admin`
4. Click `Deploy Collection`

### 7) NFT Mint

1. Enter CW721 collection contract address
2. Enter `tokenId`
3. Optional `recipient` and `tokenUri`
4. Click `Mint NFT`

## Example CW20 `initMsg`

```json
{
  "name": "LumiWave Token",
  "symbol": "LWT",
  "decimals": 6,
  "initial_balances": [
    {
      "address": "lumi1...",
      "amount": "1000000000"
    }
  ],
  "mint": {
    "minter": "lumi1...",
    "cap": "1000000000000"
  }
}
```

## Current Scope / Limitations

- Native balance refresh is implemented.
- CW20/NFT auto-discovery and aggregated balance panels are scaffolded but not fully wired yet.
- Only compiled `.wasm` binaries are accepted for Store Code.

## Deployment

1. Build:

```bash
npm run build
```

2. Deploy `dist/` to static hosting (Nginx, S3+CloudFront, Vercel, etc.).
3. If using relative faucet path (`/api/faucet`), configure reverse proxy in the hosting layer.

## Production Checklist

- `VITE_CHAIN_ID`, denom, decimals, bech32 prefix are correct for target chain.
- `VITE_TOKENFACTORY_CREATE_DENOM_TYPE_URL`, `VITE_TOKENFACTORY_MINT_TYPE_URL`, `VITE_TOKENFACTORY_SET_METADATA_TYPE_URL` match your chain protobuf package.
- `VITE_RPC` and `VITE_REST` are browser-accessible.
- `VITE_REST` includes trailing slash.
- Faucet endpoint/proxy is reachable from browser origin.
- Wallet extension flow (connect/send/store/instantiate) is validated once on target environment.

## Project Structure

```text
src/
  App.jsx
  main.jsx
  App.css
  index.css
  keplr.js
  wallets.js
  config/
    constants.js
  components/
    layout/
      Sidebar.jsx
      TopBar.jsx
    wallet/
      WalletModal.jsx
    dashboard/
      Overview.jsx
      QuickActions.jsx
    faucet/
      FaucetSection.jsx
    bank/
      BankSendSection.jsx
    tokenfactory/
      TokenFactorySection.jsx
    wasm/
      WasmDeploySection.jsx
    nft/
      NFTDeploySection.jsx
      NFTMintSection.jsx
  hooks/
    useWallet.js
    useAllBalances.js
    useFaucet.js
    useBankSend.js
    useTokenFactory.js
    useWasmDeploy.js
    useCW721Deploy.js
    useNFTMint.js
  services/
    walletService.js
    balanceService.js
    faucetService.js
    bankService.js
    tokenFactoryService.js
    tokenFactoryTypes.js
    wasmService.js
    cw20Service.js
    cw721Service.js
  utils/
    formatters.js
```

## Troubleshooting

- Faucet `429`: expected rate-limit behavior from server policy.
- Wallet connection fails:
  - verify extension is installed/unlocked
  - ensure `VITE_RPC` is reachable in browser
  - ensure chain/token env values are correctly set
- Balance fetch fails:
  - ensure `VITE_REST` includes trailing slash

## License

MIT
