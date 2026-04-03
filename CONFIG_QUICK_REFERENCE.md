# ⚡ Configuration Quick Reference

## 🎯 Essential Settings (Must Configure)

### In `.env` File:

```env
# REQUIRED - Get from https://account.bitquery.io/user/api_v2/access_tokens
BITQUERY_OAUTH_TOKEN=ory_at_xxxxx...

# REQUIRED - Your wallet private key (without 0x prefix)
PRIVATE_KEY=abc123def456...

# REQUIRED - Token contract address to monitor
TOKEN_ADDRESS=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
```

---

## 📊 Common Configuration Scenarios

### Scenario 1: Start on Ethereum Mainnet
```env
Trading_NETWORK=ethereum
BASE_CURRENCY=usdt
MIN_PROFIT_THRESHOLD=50
```

### Scenario 2: Test on Sepolia Testnet
```env
TRADING_NETWORK=sepolia
SEPOLIA_RPC=https://rpc.sepolia.org
MIN_PROFIT_THRESHOLD=1
DEBUG_MODE=true
```

### Scenario 3: Low-Cost Trading on Polygon
```env
TRADING_NETWORK=polygon
MIN_PROFIT_THRESHOLD=5
GAS_MULTIPLIER=1.1
```

### Scenario 4: Conservative High-Volume
```env
MIN_PROFIT_THRESHOLD=100
BUFFER_SIZE=5
GAS_MULTIPLIER=1.5
CONNECTION_TIMEOUT_SECONDS=3600
```

---

## 🔧 Configuration File Locations

| File | Purpose | Edit For |
|------|---------|----------|
| **config.json** | Global defaults | Project maintainer |
| **.env** | Local overrides | YOU - Your machine |
| **.env.example** | Template | Reference only |

---

## 🚀 Setup Checklist

```
□ Created .env file
□ Added BITQUERY_OAUTH_TOKEN
□ Added PRIVATE_KEY (no 0x)
□ Set TRADING_NETWORK
□ Set TOKEN_ADDRESS
□ npm install
□ npm start
```

---

## 🪙 Supported Tokens by Network

```javascript
// Available in config.json → tokens

USDT:
  ethereum: 0xdAC17F958D2ee523a2206206994597C13D831ec7
  polygon:  0xc2132d05d31c914a87c6611c10748aeb04b58e8f
  arbitrum: 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
  sepolia:  0xfad6367e97e5786bf06050947574efb30b721b56

USDC:
  ethereum: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  polygon:  0x2791bca1f2de4661ed88a30c99a7a9449aa84174
  arbitrum: 0xff970a61a04b1ca14834a43f5de4533ebddb5f8a
  sepolia:  0x94a9d9ac8a22534e3fbb1a42b4ee38a4ca71feb3

DAI:
  ethereum: 0x6b175474e89094c44da98b954eedeac495271d0f
  polygon:  0x8f3cf7ad23cd3cadbd9735aff958023d60d7eaa5
  arbitrum: 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1
  sepolia:  0xFF34B3d4Aee5D82176091a1369AxC5Eff3C9c0d
```

---

## ⚙️ Key Settings Explained

| Setting | Default | Range | Use |
|---------|---------|-------|-----|
| **MIN_PROFIT_THRESHOLD** | 50 | 1-1000 | Min $ profit to trade |
| **GAS_MULTIPLIER** | 1.2 | 1.0-2.0 | Gas estimation buffer |
| **MAX_SLIPPAGE** | 0.5 | 0.1-5.0 | Max price slippage % |
| **BUFFER_SIZE** | 10 | 5-50 | Quotes before analyze |
| **FEE_TIER** | 3000 | 500/3000/10000 | Uniswap V3 fee |
| **GAS_LIMIT** | 500000 | 300k-1M | Max gas per swap |
| **CONNECTION_TIMEOUT** | 300 | 60-3600 | WebSocket duration (sec) |

---

## 🌐 Network Quick Select

```env
# Mainnet (Real money):
TRADING_NETWORK=ethereum

# Testnet (Free, learning):
TRADING_NETWORK=sepolia

# Low gas:
TRADING_NETWORK=polygon

# Fast & cheap:
TRADING_NETWORK=arbitrum
```

---

## 💡 Pro Tips

### Tip 1: Start Small
```env
# Testnet first
MIN_PROFIT_THRESHOLD=1
SWAP_AMOUNT=1

# Then mainnet
MIN_PROFIT_THRESHOLD=50
SWAP_AMOUNT=5
```

### Tip 2: Debug Issues
```env
DEBUG_MODE=true
LOG_KEEP_ALIVE=true
```

### Tip 3: Long Sessions
```env
CONNECTION_TIMEOUT_SECONDS=3600  # 1 hour
```

### Tip 4: Custom RPC
```env
ETHEREUM_RPC=https://your-provider.com/key
```

---

## 🔐 Security Reminder

```
⚠️  NEVER:
  ❌ Commit .env to git
  ❌ Share PRIVATE_KEY
  ❌ Put secrets in config.json
  ❌ Expose BITQUERY_OAUTH_TOKEN

✅ DO:
  ✅ Keep .env in .gitignore
  ✅ Use separate testnet wallet
  ✅ Start with small amounts
  ✅ Rotate keys periodically
```

---

## 📖 Need More?

See full documentation:
- **CONFIG_REFERENCE.md** - Complete configuration guide
- **TRADE_EXECUTION.md** - Trade execution details
- **TESTNET_SETUP.md** - Testnet configuration
- **SETUP.md** - Initial setup guide

