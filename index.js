/**
 * Multi-chain arbitrage tutorial bot using Bitquery Trading Streams
 * ---------------------------------------------------------------
 * Env (.env):
 *   BITQUERY_TOKEN=ory_at_...               # Bitquery OAuth access token
 *   THRESHOLD_USD=5                         # Arbitrage threshold X in USD
 *   BASE_SYMBOL=BTC                         # base asset symbol (e.g., BTC, ETH, SOL, WBNB)
 *   QUOTE_SYMBOL=USDT                       # quote symbol (e.g., USDT, USDC, USD)
 *   CHAINS=ethereum,bsc,base,solana,tron    # comma-separated list of chains to watch
 *
 *   # EVM trading (stubs): RPCs & PK (DANGEROUS: keep secrets safe; use test wallets!)
 *   ETHEREUM_RPC=https://...
 *   BSC_RPC=https://...
 *   BASE_RPC=https://...
 *   EVM_PRIVATE_KEY=0x...
 *
 *   # Solana trading (stub):
 *   SOLANA_RPC=https://api.mainnet-beta.solana.com
 *   SOLANA_PRIVATE_KEY_BASE58=[1,2,3,...]   # JSON array of bytes or leave empty to skip
 *
 *   # Tron trading (stub):
 *   TRON_RPC=https://api.trongrid.io
 *   TRON_PRIVATE_KEY=...
 */

require("dotenv").config();

const { WebSocket } = require("ws");
const { ethers } = require("ethers");
const TronWeb = require("tronweb");
const solanaWeb3 = require("@solana/web3.js");

// --------------------------- Config ---------------------------

const BITQUERY_TOKEN = process.env.BITQUERY_TOKEN;
if (!BITQUERY_TOKEN) {
  console.error("Missing BITQUERY_TOKEN in .env");
  process.exit(1);
}

const CHAINS = (process.env.CHAINS || "ethereum,bsc,base,solana,tron")
  .split(",")
  .map((s) => s.trim().toLowerCase());

const BASE_SYMBOL = process.env.BASE_SYMBOL || "BTC";
const QUOTE_SYMBOL = process.env.QUOTE_SYMBOL || "USDT";

// arbitrage threshold in USD
const THRESHOLD_USD = Number(process.env.THRESHOLD_USD || "5");

// WS endpoint (use /eap if required by your account/products)
const BITQUERY_WS_URL =
  "wss://streaming.bitquery.io/graphql?token=" + encodeURIComponent(BITQUERY_TOKEN);

// --------------------------- Trade SDK Stubs ---------------------------

// EVM providers per chain
const EVM_CONFIG = {
  ethereum: process.env.ETHEREUM_RPC,
  bsc: process.env.BSC_RPC,
  base: process.env.BASE_RPC,
};

const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || null;
const evmProviders = {};
const evmWallets = {};
for (const [chain, rpc] of Object.entries(EVM_CONFIG)) {
  if (rpc) {
    evmProviders[chain] = new ethers.JsonRpcProvider(rpc);
    if (EVM_PRIVATE_KEY) {
      evmWallets[chain] = new ethers.Wallet(EVM_PRIVATE_KEY, evmProviders[chain]);
    }
  }
}

// Solana
const SOLANA_RPC = process.env.SOLANA_RPC || null;
let solConn = null;
let solKeypair = null;
if (SOLANA_RPC) {
  solConn = new solanaWeb3.Connection(SOLANA_RPC, "confirmed");
  try {
    if (process.env.SOLANA_PRIVATE_KEY_BASE58) {
      const bytes = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY_BASE58));
      solKeypair = solanaWeb3.Keypair.fromSecretKey(bytes);
    }
  } catch (_) { /* ignore */ }
}

// Tron
const TRON_RPC = process.env.TRON_RPC || null;
let tron = null;
if (TRON_RPC && process.env.TRON_PRIVATE_KEY) {
  tron = new TronWeb({
    fullHost: TRON_RPC,
    privateKey: process.env.TRON_PRIVATE_KEY,
  });
}

// --------------------------- Price State ---------------------------

/**
 * Store the latest USD price per chain for BASE/QUOTE pair.
 * Example:
 * latestPrices = {
 *   ethereum: { priceUsd: 65000.12, ts: 1690000000 },
 *   bsc:      { priceUsd: 64994.88, ts: 1690000001 },
 *   ...
 * }
 */
const latestPrices = Object.create(null);

// --------------------------- Arbitrage Logic ---------------------------

function checkArbAndMaybeTrade() {
  // Build an array of [chain, priceUsd]
  const entries = Object.entries(latestPrices)
    .filter(([chain, v]) => v && typeof v.priceUsd === "number");

  if (entries.length < 2) return;

  // Find min & max
  let min = entries[0], max = entries[0];
  for (const e of entries) {
    if (e[1].priceUsd < min[1].priceUsd) min = e;
    if (e[1].priceUsd > max[1].priceUsd) max = e;
  }

  const spreadUsd = max[1].priceUsd - min[1].priceUsd;
  if (spreadUsd >= THRESHOLD_USD) {
    const opportunity = {
      buyChain: min[0],
      sellChain: max[0],
      buyPrice: min[1].priceUsd,
      sellPrice: max[1].priceUsd,
      spreadUsd,
      base: BASE_SYMBOL,
      quote: QUOTE_SYMBOL,
      timestamp: Date.now(),
    };

    console.log(
      `\n[ARB] ${BASE_SYMBOL}/${QUOTE_SYMBOL} | ` +
      `${opportunity.buyChain} -> ${opportunity.sellChain} | ` +
      `Buy $${opportunity.buyPrice.toFixed(4)} Sell $${opportunity.sellPrice.toFixed(4)} | ` +
      `Δ = $${spreadUsd.toFixed(2)} >= $${THRESHOLD_USD}`
    );

    executeTrade(opportunity).catch((err) => {
      console.error("executeTrade failed:", err.message);
    });
  }
}

// --------------------------- Execution Stub ---------------------------

/**
 * For a *real* system you must:
 * - Choose a DEX/Router per chain (e.g., UniswapV2/V3, Pancake, Aerodrome, Raydium, SunSwap)
 * - Approve tokens, compute routes/quotes, set slippage, gas, deadlines
 * - Handle cross-chain settlement/bridging OR source liquidity on each chain
 * - Add MEV protection, nonce mgmt, retries, health checks, and logging
 *
 * This stub logs what it *would* do and returns early.
 */
async function executeTrade(op) {
  console.log("[EXECUTE] (dry-run) Planning cross-chain trade:", op);

  // Example decision: use per-chain swap on local liquidity (no bridging),
  // then handle inventory manually out-of-band. For tutorial we just log.

  // EVM example scaffold
  if (evmWallets[op.buyChain]) {
    console.log(`[EVM:${op.buyChain}] Would swap QUOTE->BASE at ~$${op.buyPrice.toFixed(4)} via chosen DEX Router (stub)`);
    // TODO: use ethers & router ABI to perform swapExactTokensForTokens
  } else if (op.buyChain === "solana" && solConn && solKeypair) {
    console.log(`[SOLANA] Would swap QUOTE->BASE on Raydium/Jupiter at ~$${op.buyPrice.toFixed(4)} (stub)`);
    // TODO: integrate Jupiter Aggregator SDK or direct Raydium program
  } else if (op.buyChain === "tron" && tron) {
    console.log(`[TRON] Would swap QUOTE->BASE on SunSwap at ~$${op.buyPrice.toFixed(4)} (stub)`);
    // TODO: call SunSwap router with TronWeb
  } else {
    console.log(`[${op.buyChain}] No wallet configured; skipping buy leg.`);
  }

  if (evmWallets[op.sellChain]) {
    console.log(`[EVM:${op.sellChain}] Would swap BASE->QUOTE at ~$${op.sellPrice.toFixed(4)} via chosen DEX Router (stub)`);
  } else if (op.sellChain === "solana" && solConn && solKeypair) {
    console.log(`[SOLANA] Would swap BASE->QUOTE at ~$${op.sellPrice.toFixed(4)} (stub)`);
  } else if (op.sellChain === "tron" && tron) {
    console.log(`[TRON] Would swap BASE->QUOTE at ~$${op.sellPrice.toFixed(4)} (stub)`);
  } else {
    console.log(`[${op.sellChain}] No wallet configured; skipping sell leg.`);
  }

  // Return a fake tx summary
  return {
    ok: true,
    simulated: true,
    note: "dry-run only; wire real DEX calls to execute",
  };
}

// --------------------------- Bitquery Subscription ---------------------------

/**
 * We’ll stream normalized prices for BASE/QUOTE across multiple chains.
 *
 * The subscription below follows Bitquery’s GraphQL-over-WebSocket protocol.
 * Token is passed in the URL query as required by Bitquery’s websocket auth.
 *
 * Docs:
 *  - WS endpoint & standards: https://docs.bitquery.io/docs/subscriptions/websockets/
 *  - WS auth style:           https://docs.bitquery.io/docs/authorisation/websocket/
 *  - JS websocket example:    https://docs.bitquery.io/docs/subscriptions/examples/
 *  - Starter “Find arbitrage across chains” query idea:
 *                              https://docs.bitquery.io/docs/start/starter-queries/
 */

// NOTE: The exact field names can evolve. This query targets the
// Crypto Price API streams that emit OHLC/Price in USD for a pair across chains.
// Adjust `where:` if you want a specific token address instead of a symbol.
const SUBSCRIPTION_QUERY = `
subscription PriceAcrossChains($base: String!, $quote: String!, $chains: [String!]) {
  Trading {
    PriceIndex(
      where: {
        Base: { Symbol: { is: $base } }
        Quote: { Symbol: { is: $quote } }
        Chain: { in: $chains }
        Interval: { Duration: { eq: 1 } }   # 1-second buckets; adjust as needed
      }
      limitBy: { by: [Chain, Market], limit: 1 } # 1 latest per market per chain
      orderBy: { descendingByField: "Time" }
    ) {
      Chain
      Market                      # e.g., "UniswapV3", "Raydium", "SunSwap"
      Base { Symbol }
      Quote { Symbol }
      PriceUSD                    # normalized price in USD if available
      Close                       # close price in quote terms (if PriceUSD missing)
      Time
    }
  }
}
`;

// Build variables
const variables = {
  base: BASE_SYMBOL,
  quote: QUOTE_SYMBOL,
  chains: CHAINS, // e.g., ["ethereum","bsc","base","solana","tron"]
};

// Open WebSocket (GraphQL WS protocol)
const ws = new WebSocket(BITQUERY_WS_URL, ["graphql-ws"], {
  headers: {
    "Sec-WebSocket-Protocol": "graphql-ws",
    "Content-Type": "application/json",
  },
});

ws.on("open", () => {
  console.log("Connected to Bitquery WS");
  // per protocol: send connection_init
  ws.send(JSON.stringify({ type: "connection_init" }));
});

ws.on("message", (raw) => {
  let msg;
  try {
    msg = JSON.parse(raw.toString());
  } catch {
    return;
  }

  switch (msg.type) {
    case "connection_ack":
      // Start subscription
      ws.send(
        JSON.stringify({
          id: "prices-1",
          type: "start",
          payload: { query: SUBSCRIPTION_QUERY, variables },
        })
      );
      console.log(
        `Subscribed for ${BASE_SYMBOL}/${QUOTE_SYMBOL} on chains: ${CHAINS.join(", ")}`
      );
      break;

    case "ka":
      // keep-alive
      break;

    case "data": {
      const payload = msg.payload?.data;
      const rows = payload?.Trading?.PriceIndex || [];
      for (const r of rows) {
        // prefer USD; fall back to Close (quoted price) if USD not present
        const priceUsd =
          typeof r.PriceUSD === "number"
            ? r.PriceUSD
            : typeof r.Close === "number"
            ? r.Close // assumes QUOTE is USD stable; if not, convert
            : null;

        if (priceUsd) {
          latestPrices[r.Chain?.toLowerCase()] = {
            priceUsd,
            market: r.Market,
            ts: Date.now(),
          };
          process.stdout.write(
            `[tick] ${r.Chain} ${r.Market} ${BASE_SYMBOL}/${QUOTE_SYMBOL} = $${priceUsd.toFixed(
              6
            )}\r`
          );
          // after each tick, see if an arb emerged
          checkArbAndMaybeTrade();
        }
      }
      break;
    }

    case "error":
      console.error("WS error:", msg.payload || msg);
      break;

    default:
      // other protocol housekeeping messages
      break;
  }
});

ws.on("close", (code, reason) => {
  console.log(`Bitquery WS closed (${code}) ${reason?.toString?.() || ""}`);
  // You may want to implement exponential backoff reconnection here
});

ws.on("error", (err) => {
  console.error("WS transport error:", err.message);
});
