# Quick Testnet Configuration Template

## 🚀 Copy-Paste Configuration Changes

### 1. Update RPC Endpoint in index.js

**Find this section:**
```javascript
RPC_ENDPOINTS: {
  ethereum: "https://eth-mainnet.g.alchemy.com/v2/demo",
  polygon: "https://polygon-mainnet.g.alchemy.com/v2/demo",
  arbitrum: "https://arb-mainnet.g.alchemy.com/v2/demo",
}
```

**Replace with:**
```javascript
RPC_ENDPOINTS: {
  ethereum: "https://rpc.sepolia.org",
  polygon: "https://polygon-mainnet.g.alchemy.com/v2/demo",  // Keep for cross-chain tests
  arbitrum: "https://arb-mainnet.g.alchemy.com/v2/demo",     // Keep for cross-chain tests
}
```

---

### 2. Lower Profit Threshold (Testnet)

**Find:**
```javascript
MIN_PROFIT_THRESHOLD: 50,
```

**Replace with:**
```javascript
MIN_PROFIT_THRESHOLD: 1,  // Lower for testnet testing
```

---

### 3. Update .env File

**Copy this template:**

```env
# === SEPOLIA TESTNET CONFIGURATION ===

# Your Sepolia wallet private key (get from MetaMask)
PRIVATE_KEY=your_sepolia_private_key_here

# Bitquery OAuth token (mainnet data still works)
BITQUERY_OAUTH_TOKEN=your_bitquery_token_here

# Testnet token address (USDT on Sepolia)
TOKEN_ADDRESS=0xfad6367e97e5786bf06050947574efb30b721b56

# Testnet settings
MIN_PROFIT_USD=1
SPREAD_THRESHOLD=1
BUFFER_SIZE=10
```

---

### 4. Update Token Address to Sepolia Version

**Option 1: USDT on Sepolia**
```javascript
// In executeArbitrage function, change:
tokenIn: "0xdAC17F958D2ee523a2206206994597C13D831ec7",  // Mainnet USDT

// To:
tokenIn: "0xfad6367e97e5786bf06050947574efb30b721b56",  // Sepolia USDT
```

**Option 2: USDC on Sepolia**
```javascript
tokenIn: "0x94a9d9ac8a22534e3fbb1a42b4ee38a4ca71feb3"   // Sepolia USDC
```

---

## ✅ Verification Checklist

Run these commands to verify:

```bash
# 1. Check RPC endpoint is Sepolia
grep "https://rpc.sepolia.org" index.js
# Expected: 1 match

# 2. Check MIN_PROFIT threshold is low
grep "MIN_PROFIT_THRESHOLD: 1" index.js
# Expected: 1 match

# 3. Check .env has private key
grep "PRIVATE_KEY=" .env
# Expected: PRIVATE_KEY=0x...

# 4. Verify no syntax errors
node -c index.js
# Expected: (no output = success)
```

---

## 🧪 Test Execution

Once configured:

```bash
# 1. Install dependencies
npm install

# 2. Start bot
npm start

# Expected output:
# Connected to Bitquery.
# Connection acknowledged by server.
# (monitoring prices...)
```

---

## 📝 Testnet Token Contract Addresses

Use these for testing:

```javascript
// Sepolia Testnet Tokens
const SEPOLIA_TOKENS = {
  USDT: "0xfad6367e97e5786bf06050947574efb30b721b56",
  USDC: "0x94a9d9ac8a22534e3fbb1a42b4ee38a4ca71feb3",
  DAI:  "0xFF34B3d4Aee5D82176091a1369AxC5Eff3C9c0d",
  WETH: "0xc558baf6b86a2e259f1c033198235f0c1d1b4663",
};
```

---

## 🔄 Switch Back to Mainnet

When ready for production:

1. **Update RPC:**
   ```javascript
   ethereum: "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
   ```

2. **Increase profit threshold:**
   ```javascript
   MIN_PROFIT_THRESHOLD: 50  // Back to $50
   ```

3. **Update to mainnet token addresses:**
   ```javascript
   tokenIn: "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // Mainnet USDT
   ```

4. **Fund wallet with real ETH**

5. **Start trading!**

---

## ⚠️ Important Notes

- **Testnet ETH is worthless** - Perfect for learning
- **Same API responses** - Bitquery works identically
- **Realistic gas costs** - Test actual fees
- **Safe to experiment** - No financial loss
- **Keep wallet separate** - Use different address than mainnet

