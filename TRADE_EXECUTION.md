# Trade Execution Implementation Guide

## 🎯 Overview

The bot now includes **complete trade execution logic** that automatically:
1. Detects arbitrage opportunities
2. Calculates profit/loss
3. Executes buy orders on cheaper DEX
4. Bridges tokens across chains (placeholder)
5. Executes sell orders on expensive DEX

---

## ⚙️ Trade Execution Flow

```
┌─────────────────────────────────┐
│  Monitor Price Streams          │
│  (Bitquery WebSocket)           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Buffer 10 Price Quotes         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Detect Arbitrage Opportunity   │
│  (Min/Max Price Comparison)     │
└────────────┬────────────────────┘
             │
             ▼
         ┌───┴────┐
         │ Found? │
         └───┬────┘
          YES│ NO
             │  └──→ Reset Buffer & Continue
             │
             ▼
┌─────────────────────────────────┐
│  Calculate Expected Profit      │
│  (Spread - Estimated Costs)     │
└────────────┬────────────────────┘
             │
             ▼
         ┌───┴──────────┐
         │ Profitable?  │
         └───┬──────────┘
          YES│ NO
             │  └──→ Skip Trade
             │
             ▼
┌─────────────────────────────────┐
│  Step 1: BUY on Cheaper Network │
│  (Swap USDT → Token)            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Step 2: BRIDGE Tokens          │
│  (Cross-Chain Transfer)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Step 3: SELL on Expensive Net. │
│  (Swap Token → USDT)            │
└────────────┬────────────────────┘
             │
             ▼
        ✅ PROFIT
```

---

## 🔧 Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Bitquery API
BITQUERY_OAUTH_TOKEN=your_token_here

# Wallet Private Key (WITHOUT 0x prefix)
PRIVATE_KEY=your_64_character_hex_key

# Trading Parameters
MIN_PROFIT_THRESHOLD=50          # Minimum profit in USD
MAX_SLIPPAGE=0.5                 # Maximum slippage %
GAS_MULTIPLIER=1.2               # Gas buffer multiplier
```

### How to Get Your Private Key

**⚠️ Security Warning**: Never share your private key!

1. In MetaMask:
   - Click account → Settings → Security & Privacy
   - Export Private Key → Copy (save securely)

2. In other wallets:
   - Check wallet settings for "Export Private Key"

3. Store safely:
   - In `.env` file (already in `.gitignore`)
   - NOT in code, git, or URLs

---

## 💰 Trade Execution Functions

### 1. **getWallet(network)**
Initialize wallet for trading on specific network.

```javascript
const walletData = getWallet("ethereum");
// Returns: { wallet, provider }
```

**Supported Networks:**
- `ethereum` - Ethereum Mainnet
- `polygon` - Polygon (Matic)
- `arbitrum` - Arbitrum One

---

### 2. **swapTokens(walletData, params)**
Execute token swap on Uniswap V3.

```javascript
const result = await swapTokens(walletData, {
  tokenIn: "0xdAC17F958D2ee523a2206206994597C13D831ec7",    // USDT
  tokenOut: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",   // WBTC
  amountIn: ethers.parseUnits("1000", 6),                    // 1000 USDT
  network: "ethereum"
});

// Returns: { success: true, transactionHash, gasUsed } or { success: false, error }
```

**Process:**
1. ✅ Check wallet balance
2. ✅ Approve router to spend tokens
3. ✅ Execute swap on Uniswap V3
4. ✅ Wait for confirmation
5. ✅ Return transaction hash

---

### 3. **executeArbitrage(opportunityData)**
Main trade execution logic.

```javascript
const opportunity = {
  currencyId: "ethereum-0x234...",
  buyPrice: 45000,
  sellPrice: 45500,
  buyNetwork: "ethereum",
  sellNetwork: "polygon",
  buyMarket: "0xabc...",
  sellMarket: "0xdef...",
  spread: 500,
  tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  timestamp: "2024-03-15T10:30:00Z"
};

await executeArbitrage(opportunity);
```

**Steps:**
1. Calculate net profit (spread - costs)
2. Check if profit exceeds minimum threshold
3. Buy tokens on cheaper network
4. Bridge tokens (placeholder)
5. Sell tokens on expensive network
6. Log results

---

### 4. **detectArbitrage(quotes, tokenAddress, currencyId)**
Enhanced detection with full opportunity data.

```javascript
const opportunity = detectArbitrage(buffer, address, currencyId);
// Returns: opportunityData object or null
```

**Features:**
- Returns detailed opportunity information
- Calculates spread
- Identifies buy/sell venues
- Returns null if no opportunity

---

## 📊 Profit Calculation

```
Gross Spread = Sell Price - Buy Price
               (from different DEXs/networks)

Estimated Costs = 
  + Gas fees (buy network) ≈ $10-50
  + Gas fees (sell network) ≈ $10-50
  + Bridge fees ≈ $5-25
  + Slippage (0.5%) ≈ 0.5% of trade
  + Liquidity buffer ≈ 1%
  ─────────────────────────────────
  Total ≈ 5-10% of spread

Net Profit = Gross Spread - Estimated Costs

Decision:
  If Net Profit > MIN_PROFIT_THRESHOLD ($50)
    → Execute Trade ✅
  Else
    → Skip Trade ⏭️
```

---

## ⚡ Advanced Customization

### Adjust Profit Threshold

Edit `index.js`:
```javascript
TRADE_CONFIG = {
  MIN_PROFIT_THRESHOLD: 100,  // Changed from 50 to 100 USD
  // ... rest of config
}
```

### Add Different DEX

Example: Add SushiSwap router:

```javascript
ROUTERS: {
  ethereum: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Uniswap V3
  ethereum_sushi: "0xd9e1cE17f2641f24aE55B11Ba364393A3712841A", // SushiSwap
  // ...
}
```

### Support New Blockchain

```javascript
RPC_ENDPOINTS: {
  ethereum: "https://...",
  bsc: "https://bsc-dataseed.binance.org",  // Add BSC
  // ...
}
```

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `PRIVATE_KEY not set` | Missing env var | Add `PRIVATE_KEY` to `.env` |
| `Insufficient balance` | Wallet has no funds | Fund wallet with ETH/tokens |
| `Invalid token address` | Wrong contract address | Verify address on Etherscan |
| `Slippage exceeded` | Price changed during swap | Increase `MAX_SLIPPAGE` |
| `Out of gas` | Gas price too low | Increase `GAS_MULTIPLIER` |
| `Network RPC error` | RPC endpoint down | Check RPC provider status |

---

## 🔐 Security Considerations

### ✅ Do's:
- ✅ Keep `.env` in `.gitignore`
- ✅ Use testnet first
- ✅ Start with small amounts
- ✅ Monitor trade execution
- ✅ Keep wallet secure
- ✅ Rotate keys periodically

### ❌ Don'ts:
- ❌ Commit `.env` to git
- ❌ Share private keys anywhere
- ❌ Use mainnet with unproven code
- ❌ Store keys in code
- ❌ Use the same key for multiple bots
- ❌ Share config files

---

## 🧪 Testing on Testnet

### 1. Switch to Testnet

```javascript
// Change RPC endpoints to testnet
RPC_ENDPOINTS: {
  ethereum: "https://sepolia.infura.io/v3/YOUR_KEY",
  polygon: "https://rpc-mumbai.maticvigil.com",
}
```

### 2. Fund Testnet Wallet

- Sepolia (Ethereum): https://sepoliafaucet.com
- Mumbai (Polygon): https://faucet.polygon.technology/

### 3. Get Testnet Tokens

- Uniswap Testnet UI: https://app.uniswap.org
- Swap ETH for test tokens

### 4. Run and Monitor

```bash
npm start  # Will execute on testnet
```

---

## 📈 Monitoring & Logging

The bot logs all trade activity:

```
Connected to Bitquery.
Connection acknowledged by server.
Subscription message sent
🎯 Arbitrage Opportunity Detected!
Buy  @ $45000 on ethereum/0xabc...
Sell @ $45500 on polygon/0xdef...
Spread: $500.00 USD

⏳ Checking profitability...
💰 Potential Profit: $465.00

📍 STEP 1: Buying on ethereum...
Wallet balance: 1000.5 tokens
Approving router...
Approval confirmed
Executing swap...
✅ Buy order completed: 0x123...

🌉 STEP 2: Bridging tokens...

📍 STEP 3: Selling on polygon...
✅ Sell order completed: 0x456...

✨ ARBITRAGE TRADE EXECUTED SUCCESSFULLY!
```

---

## 🚀 Next Steps

1. **Add Your Private Key** → Update `.env`
2. **Test on Testnet** → Verify trade execution
3. **Fund Wallet** → Add capital
4. **Run Bot** → `npm start`
5. **Monitor Trades** → Check transaction hashes
6. **Optimize** → Adjust thresholds based on results

---

## 📚 Resources

- [Ethers.js Docs](https://docs.ethers.org/)
- [Uniswap V3 Docs](https://docs.uniswap.org/contracts/v3/overview)
- [Bitquery Streaming](https://docs.bitquery.io/docs/streams/)
- [ERC-20 Token Standard](https://ethereum.org/developers/docs/standards/tokens/erc-20/)

