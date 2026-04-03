# Ethereum Testnet (Sepolia) Configuration Guide

## 🧪 What is Sepolia Testnet?

Sepolia is Ethereum's official testnet using **real testnet ETH** (worthless, but realistic):
- No real money risk ✅
- Identical to mainnet ✅
- Test all features before production ✅
- Free testnet tokens ✅

---

## 🚀 Step 1: Get Testnet ETH

### Option A: Faucets (Free)

1. **Alchemy Faucet** (Recommended)
   - URL: https://sepoliafaucet.com
   - Requirements: None
   - Gives: 0.5 Sepolia ETH instantly

2. **QuickNode Faucet**
   - URL: https://faucet.quicknode.com/ethereum/sepolia
   - Requirements: GitHub account
   - Gives: 0.5 Sepolia ETH daily

3. **Infura Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requirements: Infura account
   - Gives: 0.5 Sepolia ETH

### Steps:
1. Copy your wallet address (from MetaMask)
2. Paste into faucet website
3. Click "Send Testnet ETH"
4. Wait 1-2 minutes
5. Verify in MetaMask

---

## 🔧 Step 2: Configure RPC Endpoint

**Option A: Using Free Public RPC (Quick)**

Edit `index.js` and modify `TRADE_CONFIG`:

```javascript
const TRADE_CONFIG = {
  MIN_PROFIT_THRESHOLD: 50,
  GAS_MULTIPLIER: 1.2,
  MAX_SLIPPAGE: 0.5,
  
  ROUTERS: {
    ethereum: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    polygon: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    arbitrum: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  },
  
  RPC_ENDPOINTS: {
    // CHANGE TO SEPOLIA TESTNET
    ethereum: "https://rpc.sepolia.org",
    polygon: "https://polygon-mainnet.g.alchemy.com/v2/demo",
    arbitrum: "https://arb-mainnet.g.alchemy.com/v2/demo",
  }
};
```

**Public RPC Endpoints Available:**
- `https://rpc.sepolia.org` - Official
- `https://sepolia.infura.io/v3/YOUR_KEY`
- `https://sepolia.drpc.org`

**Option B: Using Alchemy (Recommended for Reliability)**

1. Create free account: https://www.alchemy.com/
2. Create app → Select "Ethereum" → Select "Sepolia"
3. Copy API key
4. Update config:

```javascript
RPC_ENDPOINTS: {
  ethereum: `https://eth-sepolia.alchemy.com/v2/YOUR_API_KEY`,
}
```

---

## 💳 Step 3: Update .env File

```env
# Use your Sepolia wallet private key
PRIVATE_KEY=your_sepolia_wallet_private_key_here

# Bitquery token (still mainnet data)
BITQUERY_OAUTH_TOKEN=your_token_here

# Token address (testnet version)
TOKEN_ADDRESS=0xfad6367e97e5786bf06050947574efb30b721b56  # USDT on Sepolia

# Testnet settings
MIN_PROFIT_USD=1
SPREAD_THRESHOLD=1
```

---

## 🪙 Step 4: Get Testnet Tokens

### Get USDT on Sepolia

1. Visit: https://app.uniswap.org/
2. Connect Sepolia wallet
3. Swap Sepolia ETH → USDT
4. Confirm transaction

### Alternative: Use Token Faucets
- Some projects provide token faucets for testing
- Check Sepolia documentation

### Check Token Addresses

Popular testnet tokens:
```
USDC:  0x94a9d9ac8a22534e3fbb1a42b4ee38a4ca71feb3
USDT:  0xfad6367e97e5786bf06050947574efb30b721b56
WETH:  0xc558baf6b86a2e259f1c033198235f0c1d1b4663
DAI:   0xFF34B3d4Aee5D82176091a1369AxC5Eff3C9c0d
```

---

## 🔐 Step 5: Get Your Sepolia Private Key

### In MetaMask:

1. Create a new wallet or import one
2. Switch to Sepolia network (top right)
3. Click account → Settings → Security & Privacy → Export Private Key
4. Enter password
5. Copy the key (without 0x)
6. Add to `.env` file

### ⚠️ SECURITY WARNING:
- Never share this key
- Never commit `.env` to git
- Use separate wallet for testing
- Fund with small amounts only

---

## 🚀 Step 6: Verify Sepolia Configuration

Check your setup:

```bash
# View RPC endpoint
cat index.js | grep "ethereum:" | head -3

# Check .env is configured
cat .env | grep PRIVATE_KEY

# Verify syntax
node -c index.js
```

Expected output:
```
ethereum: "https://rpc.sepolia.org",
PRIVATE_KEY=0x1234...
# (no syntax errors)
```

---

## 🧪 Step 7: Run on Testnet

```bash
# Start the bot
npm start

# Expected output:
# Connected to Bitquery.
# Connection acknowledged by server.
# Subscription message sent
# (monitoring prices...)
```

---

## 📊 Monitor Testnet Transactions

### Sepolia Block Explorer

- **Main**: https://sepolia.etherscan.io/
- **Alternative**: https://sepolia.explorer.mode.network/

### Check Your Transactions:
1. Go to Etherscan Sepolia
2. Paste your wallet address
3. View all test transactions
4. Click transaction hash for details

---

## 🔧 Troubleshooting

### "Invalid Private Key"
```
❌ Solution: Ensure private key is WITHOUT 0x prefix
✅ Correct: 1234567890abcdef...
❌ Wrong:   0x1234567890abcdef...
```

### "No testnet ETH"
```
❌ Problem: Wallet balance is 0
✅ Solution: 
   1. Go to https://sepoliafaucet.com
   2. Paste wallet address
   3. Click "Send"
   4. Wait 1-2 minutes
```

### "Connection refused"
```
❌ Problem: RPC endpoint down
✅ Solution: Try alternative RPC:
   - https://rpc.sepolia.org
   - https://sepolia.drpc.org
```

### "Insufficient balance"
```
❌ Problem: Not enough testnet ETH for gas
✅ Solution: Get more testnet ETH from faucet
```

---

## 📋 Testnet Checklist

- [ ] Sepolia testnet added to MetaMask
- [ ] Wallet has Sepolia ETH (from faucet)
- [ ] Private key added to `.env`
- [ ] RPC endpoint updated to Sepolia
- [ ] Token address is testnet version
- [ ] Bitquery OAuth token configured
- [ ] npm install completed
- [ ] Syntax checked: `node -c index.js`

---

## 🎯 Expected Behavior on Testnet

### When You Run:
```bash
npm start
```

### You Should See:
```
✅ Connected to Bitquery
✅ Connection acknowledged by server
✅ Subscription message sent

(Waiting for price data...)

🎯 Arbitrage Opportunity Detected!
Buy  @ $XX on ethereum/0xabc...
Sell @ $XX on ethereum/0xdef...

⏳ Checking profitability...
💰 Potential Profit: $X.XX

📍 STEP 1: Buying on ethereum...
Wallet balance: X tokens
Approving router...
Approval confirmed
Executing swap...
✅ Buy order completed: 0x123...

✨ TRADE EXECUTED SUCCESSFULLY!
```

---

## ⚡ Key Differences: Testnet vs Mainnet

| Aspect | Testnet | Mainnet |
|--------|---------|---------|
| **Cost** | Free | Real money |
| **Token Value** | Worthless | Real value |
| **Risk** | None | High |
| **Gas** | Same as mainnet | Variable |
| **Data** | Same API | Same API |
| **Profits** | Imaginary | Real |

---

## 🚀 Next Steps

1. ✅ Set up Sepolia wallet
2. ✅ Get testnet ETH
3. ✅ Configure `.env` with private key
4. ✅ Update RPC to Sepolia
5. ✅ Run and test trades
6. ✅ Verify transactions on Etherscan
7. ✅ Once confident → switch to mainnet

---

## 📚 Resources

- **Sepolia Docs**: https://ethereum.org/developers/docs/networks/
- **MetaMask Setup**: https://support.metamask.io/
- **Etherscan**: https://sepolia.etherscan.io/
- **Getblock RPC**: https://getblock.io/nodes/eth-sepolia/

