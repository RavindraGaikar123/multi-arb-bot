# Multi-Arbitrage Bot - Setup Guide

## ✅ Configuration Files Created

The following configuration files have been set up:

### 1. **config.json** (Primary Configuration)
- Required by `index.js` to connect to Bitquery
- **Action Required**: Replace `YOUR_BITQUERY_OAUTH_TOKEN_HERE` with your actual token

### 2. **.env** (Environment Variables)
- Alternative configuration approach supportedby dotenv
- **Action Required**: Add your actual Bitquery OAuth token and token address

### 3. **.env.example** (Reference)
- Template file showing available environment variables
- Do not modify production tokens here

---

## 🚀 Quick Start

### Prerequisites
1. **Node.js** (v14+) with npm
   - macOS: `brew install node`
   - Or download from [nodejs.org](https://nodejs.org)

2. **Bitquery OAuth Token**
   - Sign up: https://account.bitquery.io/auth/signup
   - Get token: https://account.bitquery.io/user/api_v2/access_tokens

### Step 1: Install Node.js
```bash
# Using Homebrew (macOS)
brew install node

# Verify installation
node --version
npm --version
```

### Step 2: Add Your Token
Edit `config.json` and replace the placeholder:
```json
{
  "oauthtoken": "your_actual_token_here"
}
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Target Token
Edit `index.js` at the bottom and replace with your token address (line with `run(address)`):
```javascript
// Example: BTC on Ethereum
run("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599");
```

### Step 5: Run the Bot
```bash
npm start
# or
node index.js
```

---

## 🔧 Available npm Scripts

```bash
npm start    # Run the bot
npm run dev  # Development mode
npm test     # Run tests
```

---

## 📋 Bot Features

- ✅ Real-time WebSocket connection to Bitquery
- ✅ Monitoring price quotes across multiple DEXs
- ✅ Arbitrage opportunity detection (price spreads)
- ✅ Cross-chain price comparison

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'ws'` | Run `npm install` |
| `Cannot find module 'config.json'` | Verify `config.json` exists in root directory |
| WebSocket connection fails | Check your Bitquery OAuth token |
| Empty buffer | Ensure token address exists on Bitquery |

---

## 📚 Additional Resources

- [Bitquery Streaming Docs](https://docs.bitquery.io/docs/streams/)
- [Bitquery Trading API](https://docs.bitquery.io/docs/trading/crypto-price-api/introduction/)
- [GraphQL Subscriptions](https://docs.bitquery.io/docs/subscriptions/subscription/)

