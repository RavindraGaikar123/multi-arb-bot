# Configuration Reference Guide

## 📋 Configuration Files Overview

The bot reads configuration from multiple sources in this priority order:

1. **`.env` file** (highest priority) - Environment-specific overrides
2. **`config.json`** (default fallback) - Global configuration
3. **Code defaults** (lowest priority) - Hardcoded fallbacks

---

## 🔧 Configuration Files

### `config.json` - Global Configuration

Contains default values for all settings. Do not modify for local testing; use `.env` instead.

**Structure:**
```json
{
  "trading": { ... },
  "networks": { ... },
  "tokens": { ... },
  "swap": { ... },
  "monitoring": { ... },
  "bitquery": { ... }
}
```

### `.env` - Local Environment Overrides

**This is where you configure for your local machine.** Each `TRADING_*` or `ETHEREUM_RPC` variable overrides the corresponding value in `config.json`.

---

## 🎯 Trading Configuration

### File Location
- Defaults: `config.json` → `trading`
- Override: `.env` → `MIN_PROFIT_THRESHOLD`, `GAS_MULTIPLIER`, `MAX_SLIPPAGE`, `BUFFER_SIZE`

### Settings

#### `MIN_PROFIT_THRESHOLD` (Default: 50)
- **Type**: Integer (USD)
- **Description**: Minimum profit required to execute a trade
- **Example**: `50` means bot ignores spreads under $50
- **Usage**: Set lower for testnet ($1-5), higher for mainnet ($50+)
- **Override**: `.env` → `MIN_PROFIT_THRESHOLD=100`

#### `GAS_MULTIPLIER` (Default: 1.2)
- **Type**: Float
- **Description**: Safety multiplier for gas estimation
- **Example**: `1.2` = 20% buffer above estimated gas
- **Values**: 1.0-2.0 (higher = safer but costlier)
- **Override**: `.env` → `GAS_MULTIPLIER=1.5`

#### `MAX_SLIPPAGE` (Default: 0.5)
- **Type**: Float (percentage)
- **Description**: Maximum price slippage tolerance on swaps
- **Example**: `0.5` = 0.5% max slippage
- **Values**: 0.1-5.0
- **Override**: `.env` → `MAX_SLIPPAGE=1.0`

#### `BUFFER_SIZE` (Default: 10)
- **Type**: Integer
- **Description**: Number of price quotes to collect before analyzing
- **Example**: `10` means check for opportunities every 10 quotes
- **Values**: 5-50
- **Override**: `.env` → `BUFFER_SIZE=20`

---

## 🌐 Network Configuration

### File Location
- Defaults: `config.json` → `networks`
- Override: `.env` → `TRADING_NETWORK`, `ETHEREUM_RPC`, `POLYGON_RPC`, etc.

### Settings

#### `TRADING_NETWORK` (Default: "ethereum")
- **Type**: String
- **Options**: `ethereum` | `polygon` | `arbitrum` | `sepolia`
- **Description**: Primary network to trade on
- **Override**: `.env` → `TRADING_NETWORK=polygon`

#### Network-Specific RPC Overrides
- **ETHEREUM_RPC**: Override Ethereum RPC endpoint
- **POLYGON_RPC**: Override Polygon RPC endpoint
- **ARBITRUM_RPC**: Override Arbitrum RPC endpoint
- **SEPOLIA_RPC**: Override Sepolia testnet RPC endpoint

**Example (.env):**
```env
ETHEREUM_RPC=https://eth-mainnet.alchemy.com/v2/YOUR_KEY
POLYGON_RPC=https://polygon-rpc.com
```

### Available Networks

| Network | Chain ID | Default RPC | Use Case |
|---------|----------|-------------|----------|
| ethereum | 1 | Alchemy demo | Production |
| polygon | 137 | Alchemy demo | Low gas |
| arbitrum | 42161 | Alchemy demo | Fast/cheap |
| sepolia | 11155111 | rpc.sepolia.org | Testing |

---

## 💰 Token Configuration

### File Location
- Defaults: `config.json` → `tokens`
- Override: `.env` → `TOKEN_ADDRESS`, `BASE_CURRENCY`

### Settings

#### `TOKEN_ADDRESS` (Default: WBTC on Ethereum)
- **Type**: Hex string (contract address)
- **Format**: `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`
- **Description**: Target token to monitor for arbitrage
- **Override**: `.env` → `TOKEN_ADDRESS=0x6b175474e89094c44da98b954eedeac495271d0f`

#### `BASE_CURRENCY` (Default: "usdt")
- **Type**: String
- **Options**: `usdt` | `usdc` | `dai`
- **Description**: Stablecoin to use for buying/selling
- **Override**: `.env` → `BASE_CURRENCY=usdc`

### Pre-configured Tokens

Supported token addresses by network (available in `config.json`):

**USDT:**
- Ethereum: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- Polygon: `0xc2132d05d31c914a87c6611c10748aeb04b58e8f`
- Arbitrum: `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9`
- Sepolia: `0xfad6367e97e5786bf06050947574efb30b721b56`

**USDC:**
- Ethereum: `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
- Polygon: `0x2791bca1f2de4661ed88a30c99a7a9449aa84174`
- Arbitrum: `0xff970a61a04b1ca14834a43f5de4533ebddb5f8a`
- Sepolia: `0x94a9d9ac8a22534e3fbb1a42b4ee38a4ca71feb3`

---

## 🔄 Swap Configuration

### File Location
- Defaults: `config.json` → `swap`
- Override: `.env` → `FEE_TIER`, `GAS_LIMIT`, `SWAP_DEADLINE_MINUTES`, `SWAP_AMOUNT`

### Settings

#### `FEE_TIER` (Default: 3000)
- **Type**: Integer (basis points)
- **Options**: `500` (0.05%) | `3000` (0.3%) | `10000` (1%)
- **Description**: Uniswap V3 fee tier for trades
- **Usage**: Lower fee = cheaper but less liquidity
- **Override**: `.env` → `FEE_TIER=500`

#### `GAS_LIMIT` (Default: 500000)
- **Type**: Integer (gas units)
- **Description**: Maximum gas to spend on a swap
- **Values**: 300000-1000000
- **Override**: `.env` → `GAS_LIMIT=600000`

#### `SWAP_DEADLINE_MINUTES` (Default: 20)
- **Type**: Integer (minutes)
- **Description**: Time before swap expires
- **Values**: 5-60
- **Override**: `.env` → `SWAP_DEADLINE_MINUTES=30`

#### `SWAP_AMOUNT` (Default: 1)
- **Type**: Float
- **Description**: Amount of tokens to swap per trade
- **Example**: `1.5` means swap 1.5 tokens
- **Override**: `.env` → `SWAP_AMOUNT=2.5`

---

## 📊 Monitoring Configuration

### File Location
- Defaults: `config.json` → `monitoring`
- Override: `.env` → `CONNECTION_TIMEOUT_SECONDS`, `LOG_KEEP_ALIVE`, `DEBUG_MODE`

### Settings

#### `CONNECTION_TIMEOUT_SECONDS` (Default: 300)
- **Type**: Integer (seconds)
- **Description**: How long to keep WebSocket connected
- **Example**: `300` = 5 minutes
- **Override**: `.env` → `CONNECTION_TIMEOUT_SECONDS=600`

#### `LOG_KEEP_ALIVE` (Default: false)
- **Type**: Boolean (`true` or `false`)
- **Description**: Log keep-alive heartbeat messages
- **Usage**: Enable for debugging connection issues
- **Override**: `.env` → `LOG_KEEP_ALIVE=true`

#### `DEBUG_MODE` (Default: false)
- **Type**: Boolean (`true` or `false`)
- **Description**: Enable detailed logging
- **Output**: Wallet addresses, configuration, unhandled messages
- **Override**: `.env` → `DEBUG_MODE=true`

---

## 🔐 Authentication Configuration

### File Location
- Defaults: `config.json` → `bitquery`
- Override: `.env` → `BITQUERY_OAUTH_TOKEN`, `PRIVATE_KEY`

### Settings

#### `BITQUERY_OAUTH_TOKEN`
- **Type**: String (token)
- **Source**: https://account.bitquery.io/user/api_v2/access_tokens
- **Location**: `.env` (Required!)
- **Security**: ⚠️ KEEP SECRET - Never commit to git
- **Override**: Set in `.env` file

#### `PRIVATE_KEY`
- **Type**: String (hex, 64 characters)
- **Source**: MetaMask or wallet export
- **Location**: `.env` (Required!)
- **Format**: Without `0x` prefix
- **Example**: `abc123def456...` (not `0xabc123def456...`)
- **Security**: ⚠️ KEEP SECRET - Never commit to git
- **Override**: Set in `.env` file

---

## 📝 Configuration Examples

### Example 1: Ethereum Mainnet (Production)

**.env:**
```env
BITQUERY_OAUTH_TOKEN=ory_at_xxxxx...
PRIVATE_KEY=yourprivatekey...
TRADING_NETWORK=ethereum
TOKEN_ADDRESS=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
MIN_PROFIT_THRESHOLD=50
GAS_MULTIPLIER=1.2
```

### Example 2: Polygon Testnet (Low Gas)

**.env:**
```env
BITQUERY_OAUTH_TOKEN=ory_at_xxxxx...
PRIVATE_KEY=yourprivatekey...
TRADING_NETWORK=polygon
TOKEN_ADDRESS=0xc2132d05d31c914a87c6611c10748aeb04b58e8f
MIN_PROFIT_THRESHOLD=10
GAS_MULTIPLIER=1.1
SWAP_AMOUNT=5
```

### Example 3: Sepolia Testnet (Learning)

**.env:**
```env
BITQUERY_OAUTH_TOKEN=ory_at_xxxxx...
PRIVATE_KEY=your_sepolia_key...
TRADING_NETWORK=sepolia
SEPOLIA_RPC=https://rpc.sepolia.org
TOKEN_ADDRESS=0xfad6367e97e5786bf06050947574efb30b721b56
MIN_PROFIT_THRESHOLD=1
DEBUG_MODE=true
LOG_KEEP_ALIVE=true
```

### Example 4: High-Volume Trading

**.env:**
```env
TRADING_NETWORK=ethereum
TOKEN_ADDRESS=0x6b175474e89094c44da98b954eedeac495271d0f
MIN_PROFIT_THRESHOLD=100
BUFFER_SIZE=5
SWAP_AMOUNT=10
CONNECTION_TIMEOUT_SECONDS=1800
FEE_TIER=500
```

---

## 🔄 Configuration Priority & Defaults

```
Priority (Highest to Lowest):
1. Environment Variables (.env)
2. config.json defaults
3. Code fallbacks

Example Resolution Chain:
MIN_PROFIT_THRESHOLD
├─ .env: MIN_PROFIT_THRESHOLD=75? → Use 75
└─ config.json: "minProfitThreshold": 50? → Use 50
   └─ Default: 50 (if file missing)
```

---

## ✅ Configuration Validation Checklist

Before running the bot:

- [ ] `.env` file created with `BITQUERY_OAUTH_TOKEN`
- [ ] `.env` file contains `PRIVATE_KEY` (without `0x`)
- [ ] `TOKEN_ADDRESS` set to correct contract address
- [ ] `TRADING_NETWORK` set to your target chain
- [ ] `MIN_PROFIT_THRESHOLD` matches your strategy
- [ ] RPC endpoints working (test: `curl <RPC_URL>`)
- [ ] Wallet has sufficient balance
- [ ] `.env` in `.gitignore` (checked ✅)
- [ ] No sensitive tokens in `config.json`
- [ ] `npm install` completed

---

## 🚀 Quick Config Commands

### Check current config
```bash
echo "Network: $(grep TRADING_NETWORK .env)"
echo "Token: $(grep TOKEN_ADDRESS .env)"
echo "Min Profit: $(grep MIN_PROFIT_THRESHOLD .env)"
```

### Switch to testnet
```bash
sed -i '' 's/TRADING_NETWORK=.*/TRADING_NETWORK=sepolia/' .env
sed -i '' 's/MIN_PROFIT_THRESHOLD=.*/MIN_PROFIT_THRESHOLD=1/' .env
```

### Enable debug mode
```bash
echo "DEBUG_MODE=true" >> .env
```

### Validate JSON
```bash
node -e "console.log(JSON.stringify(require('./config.json'), null, 2))"
```

---

## 📞 Troubleshooting Configs

| Issue | Cause | Fix |
|-------|-------|-----|
| "BITQUERY_OAUTH_TOKEN is not set" | Missing .env var | Add to `.env` |
| "Invalid RPC endpoint" | Wrong RPC URL | Check `ETHEREUM_RPC` |
| "PRIVATE_KEY starts with 0x" | Format error | Remove `0x` prefix |
| "No suitable token found" | Wrong address | Verify on Etherscan |
| "Insufficient gas" | Gas limit too low | Increase `GAS_LIMIT` |

