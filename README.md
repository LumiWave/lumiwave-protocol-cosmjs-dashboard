# LumiWave Protocol Testnet Dashboard

A web-based dashboard for **LumiWave Protocol Testnet**, built with **CosmJS** and **CosmWasm**.

This project provides a unified testnet tool for wallet connection, faucet usage, native token transfers, and CosmWasm smart contract deployment (including CW20 tokens).  
It is intended for **testnet operators, smart contract developers, and dApp builders**.

---

![LumiWave Testnet Dashboard](images/dashboard.png)

## Features

- Wallet connection
  - Keplr (full support)
  - Leap (full support)
  - Cosmostation (Bank Send only)
- Faucet request with server-side rate limiting
- Bank Send (native token transfer)
- CosmWasm contract deployment
  - Store Code (upload `.wasm`)
  - Instantiate contract
- CW20 token deployment with initial minting
- Balance display
  - Base denom (`ulwp`)
  - Display denom (`LWP`) with automatic conversion

---

## Requirements

- Node.js 18 or higher (recommended)
- npm 9 or higher
- Browser wallet extension:
  - Keplr (recommended)
  - Leap
  - Cosmostation

---

## Installation

    npm install

---

## Environment Variables

Create a `.env` file in the project root.

Example `.env`:

    VITE_CHAIN_ID=lumiwaveprotocol
    VITE_CHAIN_NAME=LumiWave Protocol Testnet

    # RPC / REST endpoints
    # RPC must be a browser-accessible CometBFT JSON-RPC endpoint.
    # If your RPC redirects, keep the trailing slash.
    VITE_RPC=https://lwp-testnet.lumiwavelab.com/tendermint/
    VITE_REST=https://lwp-testnet.lumiwavelab.com/

    # Address / Token settings
    VITE_BECH32_PREFIX=lumi
    VITE_DENOM=ulwp
    VITE_DENOM_DISPLAY=LWP
    VITE_DECIMALS=6

    # Gas price
    VITE_GAS_PRICE=0.025ulwp

    # Faucet (GraphQL-based in this setup)
    VITE_FAUCET=https://lwp-testnet-faucet.lumiwavelab.com/
    VITE_FAUCET_API=/api/faucet

---

## Run Locally

Start the development server:

    npm run dev

Open in your browser:

    http://localhost:5173

---

## Build

Create a production build:

    npm run build

Preview the production build locally:

    npm run preview

---

## Usage Guide

### 1. Connect Wallet

- Click **Connect Wallet**
- Select Keplr, Leap, or Cosmostation
- After connection:
  - Address, chain height, balances, and status are displayed
  - Status changes to `Connected`

Note: Cosmostation is intentionally limited to **Bank Send only**.

---

### 2. Faucet

- Requests test tokens to the connected address
- Faucet may be rate-limited (for example: one request per IP per 24 hours)
- When rate-limited, the UI shows a friendly message instead of throwing an error

---

### 3. Bank Send

- Enter recipient address (bech32, e.g. `lumi1...`)
- Enter amount in **LWP**
- Internally converted to base denom (`ulwp`) using `VITE_DECIMALS`
- Transaction result displays:
  - txhash
  - height
  - gasUsed / gasWanted
- BigInt values from CosmJS responses are safely serialized to prevent UI crashes

---

### 4. CosmWasm Deploy

#### 4.1 Store Code

1. Select a compiled `.wasm` file (example: `cw20_base.wasm`)
2. Click **Store Code**
3. Approve the transaction in the wallet
4. A `codeId` is returned

Important notes:
- Rust source files (`.rs`) cannot be uploaded
- Only compiled WASM binaries are supported

---

#### 4.2 Instantiate

1. Enter the `codeId`
2. Enter a label (contract instance name)
3. (Optional) Admin address for future migration
4. Provide `initMsg` JSON
5. Click **Instantiate**
6. Approve the transaction
7. A `contractAddress` is created

---

## CW20 Token Deployment Example

For the standard `cw20-base` contract, an example `initMsg`:

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

Notes:
- All amounts are **base units expressed as strings**
- Including `mint` allows future minting
- Removing `mint` creates a fixed-supply token

---

## Balance Display

Balances are shown in both base and display denominations:

    13495912ulwp (13.495912 LWP)

- `ulwp` is the base denom
- `LWP` is the display denom
- Conversion uses `VITE_DECIMALS`

---

## Project Structure

    src/
      App.jsx        # Main dashboard logic (wallet, faucet, send, wasm)
      App.css        # UI styles
      keplr.js       # Chain info builder for wallet suggestion
      wallets.js     # Wallet detection and connection helpers
      main.jsx       # Vite entry point
      index.css      # Global styles

---

## Common Issues

### Faucet returns 429
- Expected behavior due to server-side rate limits
- Usually limited to one request per IP per day

### BigInt serialization error
- CosmJS responses may include BigInt
- This project uses BigInt-safe JSON stringification

### Wallet connection issues
- Ensure `VITE_RPC` is reachable from the browser
- Avoid RPC endpoints that redirect during preflight

---

## Intended Use

- Testnet operation tools
- CosmWasm contract deployment testing
- CW20 token testing
- Pre-production dApp validation

---

## License

MIT
