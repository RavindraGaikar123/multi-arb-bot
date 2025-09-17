# Multichain Crypto Arbitrage Bot using Bitquery
Catch real-time cross-chain price discrepancies across top DEXs using the Bitquery Crypto Price Stream (GraphQL/WebSocket). This repo shows how to subscribe to on-chain price data (USD-quoted), aggregate quotes from multiple networks (e.g., Ethereum, BNB Chain, Polygon, Solana) and markets (Uniswap, PancakeSwap, etc.), then flag spreads—so you can act fast.

## Why Bitquery for arbitrage?
Unified multichain data: One GraphQL schema for many chains and DEXs—perfect for cross-chain comparisons.
Low-latency streams: WebSocket subscriptions deliver fresh OHLC and moving averages for instant signals.
USD-normalized quotes: Compare apples-to-apples across venues without extra FX plumbing.
Flexible filters: Target specific tokens/pairs/markets; throttle or widen scope anytime.
Production-ready: Clean, reliable infra built for bots, dashboards, and quant research.

## What you’ll build
A lightweight Node.js arbitrage bot that:
- Subscribes to Trading.Pairs via GraphQL WebSocket (Bitquery).
- Buffers per-message price quotes (one venue per message).
- Finds min and max prices across chains/markets.
- Prints “Arbitrage Opportunity Detected” with buy/sell venues and prices.

# Who is this for?
- Developers, traders, and researchers who want a practical, real-time starting point for multichain arbitrage, MEV exploration, and cross-DEX pricing using Bitquery’s on-chain data.

---
✔️ Use this as a template: swap in your target tokens, adjust spread thresholds, and extend the action handlers to place trades or send alerts—all powered by Bitquery.
---

## Setup

1. Create your [Bitquery account](https://account.bitquery.io/auth/signup?redirect_to=https://ide.bitquery.io/) and get your `Access Token` to run the bot [here](https://account.bitquery.io/user/api_v2/access_tokens).

2. Clone the reository.
```sh
git clone https://github.com/Kshitij0O7/multi-arb-bot.git
cd multi-arb-bot
```

3. Install the dependencies.
```sh
npm install
```

## Run the Bot
After setup, you can run the bot using the following command:
```sh
node index.js
```

## Output
![img](./image.png)