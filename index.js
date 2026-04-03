const { WebSocket } = require("ws");
const { ethers } = require("ethers");
const config = require("./config.json");
require("dotenv").config();

// ============================================
// CONFIGURATION LOADER
// ============================================

const loadConfig = () => {
  return {
    // Trading settings (read from .env with config.json fallback)
    trading: {
      minProfitThreshold: parseInt(process.env.MIN_PROFIT_THRESHOLD) || config.trading.minProfitThreshold,
      gasMultiplier: parseFloat(process.env.GAS_MULTIPLIER) || config.trading.gasMultiplier,
      maxSlippage: parseFloat(process.env.MAX_SLIPPAGE) || config.trading.maxSlippage,
      bufferSize: parseInt(process.env.BUFFER_SIZE) || config.trading.bufferSize,
    },
    
    // Network settings
    tradingNetwork: process.env.TRADING_NETWORK || "ethereum",
    networks: config.networks,
    networkNameMap: config.networkNameMap,
    
    // Map network name from API to our internal name
    getNetworkKey: (apiNetworkName) => {
      const normalized = (apiNetworkName || "").toLowerCase();
      return config.networkNameMap[normalized] || normalized;
    },
    
    // Override RPC endpoints from .env if provided
    getRpcEndpoint: (network) => {
      const envKey = `${network.toUpperCase()}_RPC`;
      if (process.env[envKey]) return process.env[envKey];
      return config.networks[network]?.rpcEndpoint;
    },
    
    // Token settings
    targetToken: process.env.TOKEN_ADDRESS || "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    baseCurrency: process.env.BASE_CURRENCY || "usdt",
    tokens: config.tokens,
    
    // Swap settings
    swap: {
      feeTier: parseInt(process.env.FEE_TIER) || config.swap.feePercentage * 10000,
      gasLimit: process.env.GAS_LIMIT || config.swap.gasLimit,
      deadlineMinutes: parseInt(process.env.SWAP_DEADLINE_MINUTES) || config.swap.deadlineMinutes,
      amountDecimals: parseInt(process.env.SWAP_AMOUNT) || config.swap.amountToBuyDecimals,
    },
    
    // Monitoring settings
    monitoring: {
      connectionTimeout: (process.env.CONNECTION_TIMEOUT_SECONDS ? parseInt(process.env.CONNECTION_TIMEOUT_SECONDS) * 1000 : null) || config.monitoring.connectionTimeoutSeconds * 1000,
      logKeepAlive: process.env.LOG_KEEP_ALIVE === "true" || false,
      debugMode: process.env.DEBUG_MODE === "true" || false,
    },
    
    // Bitquery settings
    bitquery: {
      oauthToken: process.env.BITQUERY_OAUTH_TOKEN,
      endpoint: config.bitquery.endpoint,
      eapEndpoint: config.bitquery.eapEndpoint,
    }
  };
};

const CONFIG = loadConfig();

// Validation
if (!CONFIG.bitquery.oauthToken) {
  console.error("❌ ERROR: BITQUERY_OAUTH_TOKEN is not set in .env file");
  process.exit(1);
}

if (!process.env.PRIVATE_KEY) {
  console.error("❌ ERROR: PRIVATE_KEY is not set in .env file");
  process.exit(1);
}

// ============================================
// WALLET MANAGEMENT
// ============================================

const getWallet = (network) => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const rpc = CONFIG.getRpcEndpoint(network);
    
    if (!rpc) {
      throw new Error(`No RPC endpoint configured for ${network}`);
    }
    
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    if (CONFIG.monitoring.debugMode) {
      console.log(`🔐 Wallet initialized for ${network}: ${wallet.address}`);
    }
    
    return { wallet, provider };
  } catch (error) {
    console.error(`Error getting wallet for ${network}:`, error.message);
    return null;
  }
};

// ============================================
// UNISWAP V3 SWAP EXECUTION
// ============================================

const UNISWAP_V3_ABI = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) returns (uint256)",
  "function exactOutputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) returns (uint256)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
];

const swapTokens = async (walletData, params) => {
  try {
    const { wallet, provider } = walletData;
    const { tokenIn, tokenOut, amountIn, network } = params;
    
    if (!wallet || !provider) {
      throw new Error("Wallet initialization failed");
    }
    
    const routerAddress = CONFIG.networks[network]?.uniswapV3Router;
    if (!routerAddress) {
      throw new Error(`No Uniswap V3 router configured for ${network}`);
    }
    
    // Create token contracts
    const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, wallet);
    
    // Check balance
    const balance = await tokenInContract.balanceOf(wallet.address);
    console.log(`Wallet balance: ${ethers.formatUnits(balance, 18)} tokens`);
    
    if (balance < amountIn) {
      throw new Error(`Insufficient balance. Have: ${balance}, Need: ${amountIn}`);
    }
    
    // Approve router to spend tokens
    console.log("Approving router...");
    const approveTx = await tokenInContract.approve(routerAddress, amountIn);
    await approveTx.wait();
    console.log("Approval confirmed");
    
    // Create router contract
    const router = new ethers.Contract(routerAddress, UNISWAP_V3_ABI, wallet);
    
    // Build swap parameters
    const deadline = Math.floor(Date.now() / 1000) + 60 * CONFIG.swap.deadlineMinutes;
    const amountOutMinimum = ethers.parseUnits("0", 18);
    const sqrtPriceLimitX96 = 0;
    
    const swapParams = {
      tokenIn,
      tokenOut,
      fee: CONFIG.swap.feeTier,
      recipient: wallet.address,
      deadline,
      amountIn,
      amountOutMinimum,
      sqrtPriceLimitX96,
    };
    
    console.log("Executing swap...");
    const swapTx = await router.exactInputSingle(
      [
        swapParams.tokenIn,
        swapParams.tokenOut,
        swapParams.fee,
        swapParams.recipient,
        swapParams.deadline,
        swapParams.amountIn,
        swapParams.amountOutMinimum,
        swapParams.sqrtPriceLimitX96,
      ],
      { gasLimit: ethers.toBeHex(CONFIG.swap.gasLimit) }
    );
    
    const receipt = await swapTx.wait();
    console.log(`Swap executed! Tx Hash: ${receipt.transactionHash}`);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Swap execution error:", error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// ARBITRAGE EXECUTION LOGIC
// ============================================

const executeArbitrage = async (opportunityData) => {
  try {
    console.log("\n🚀 EXECUTING ARBITRAGE TRADE...");
    console.log("========================================");
    
    const {
      currencyId,
      buyPrice,
      sellPrice,
      buyNetwork,
      sellNetwork,
      buyMarket,
      sellMarket,
      spread,
      tokenAddress,
    } = opportunityData;
    
    // Calculate profit potential
    const estimatedProfit = spread * 0.95; // Account for 5% costs
    
    if (estimatedProfit < CONFIG.trading.minProfitThreshold) {
      console.log(`⚠️  Profit too low ($${estimatedProfit.toFixed(2)}). Skipping trade.`);
      return false;
    }
    
    console.log(`💰 Potential Profit: $${estimatedProfit.toFixed(2)}`);
    console.log(`   Buy:  $${buyPrice} on ${buyNetwork}/${buyMarket}`);
    console.log(`   Sell: $${sellPrice} on ${sellNetwork}/${sellMarket}`);
    
    // Get wallets for both networks
    const buyWallet = getWallet(buyNetwork);
    const sellWallet = getWallet(sellNetwork);
    
    if (!buyWallet || !sellWallet) {
      throw new Error("Failed to initialize wallets");
    }
    
    // Get base currency token address
    const baseCurrencyToken = CONFIG.tokens[CONFIG.baseCurrency]?.[buyNetwork];
    if (!baseCurrencyToken) {
      throw new Error(`No ${CONFIG.baseCurrency.toUpperCase()} token address for ${buyNetwork}`);
    }
    
    // Step 1: Buy tokens on the cheaper network
    console.log(`\n📍 STEP 1: Buying on ${buyNetwork}...`);
    const amountToBuy = ethers.parseUnits("1", CONFIG.swap.amountDecimals);
    
    const buyResult = await swapTokens(buyWallet, {
      tokenIn: baseCurrencyToken,
      tokenOut: tokenAddress,
      amountIn: amountToBuy,
      network: buyNetwork,
    });
    
    if (!buyResult.success) {
      throw new Error(`Buy order failed: ${buyResult.error}`);
    }
    
    console.log(`✅ Buy order completed: ${buyResult.transactionHash}`);
    
    // Step 2: Bridge tokens to sell network (simulated)
    console.log(`\n🌉 STEP 2: Bridging tokens from ${buyNetwork} to ${sellNetwork}...`);
    console.log("   (Note: Bridge integration requires cross-chain bridge API)");
    
    // Step 3: Sell tokens on the expensive network
    console.log(`\n📍 STEP 3: Selling on ${sellNetwork}...`);
    
    const sellBaseCurrencyToken = CONFIG.tokens[CONFIG.baseCurrency]?.[sellNetwork];
    if (!sellBaseCurrencyToken) {
      throw new Error(`No ${CONFIG.baseCurrency.toUpperCase()} token address for ${sellNetwork}`);
    }
    
    const sellResult = await swapTokens(sellWallet, {
      tokenIn: tokenAddress,
      tokenOut: sellBaseCurrencyToken,
      amountIn: amountToBuy,
      network: sellNetwork,
    });
    
    if (!sellResult.success) {
      throw new Error(`Sell order failed: ${sellResult.error}`);
    }
    
    console.log(`✅ Sell order completed: ${sellResult.transactionHash}`);
    console.log("\n✨ ARBITRAGE TRADE EXECUTED SUCCESSFULLY!");
    console.log("========================================\n");
    
    return true;
  } catch (error) {
    console.error("❌ Arbitrage execution failed:", error.message);
    return false;
  }
};

const detectArbitrage = (quotes, tokenAddress, currencyId) => {
  if (!Array.isArray(quotes) || quotes.length === 0) return null;

  // Map to simplified rows: price + network/market
  const rows = quotes.map(q => ({
    price: q?.Price?.Average?.Estimate ?? 0,
    network: q?.Market?.Network,
    market: q?.Market?.Address,
    fullData: q
  }));

  // Find min and max
  let minRow = rows[0];
  let maxRow = rows[0];

  for (const r of rows) {
    if (r.price < minRow.price) minRow = r;
    if (r.price > maxRow.price) maxRow = r;
  }

  if (minRow.network !== maxRow.network || minRow.market !== maxRow.market) {
    const spread = parseFloat(maxRow.price) - parseFloat(minRow.price);
    
    console.log(
      `\n🎯 Arbitrage Opportunity Detected!\n` +
      `Buy  @ $${minRow.price} on ${minRow.network}/${minRow.market}\n` +
      `Sell @ $${maxRow.price} on ${maxRow.network}/${maxRow.market}\n` +
      `Spread: $${spread.toFixed(2)} USD`
    );
    
    return {
      currencyId,
      buyPrice: parseFloat(minRow.price),
      sellPrice: parseFloat(maxRow.price),
      buyNetwork: CONFIG.getNetworkKey(minRow.network),
      sellNetwork: CONFIG.getNetworkKey(maxRow.network),
      buyMarket: minRow.market,
      sellMarket: maxRow.market,
      spread,
      tokenAddress,
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

const getCurrencyId = async (address) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${CONFIG.bitquery.oauthToken}`);

  const raw = JSON.stringify({
    "query": `query MyQuery {\n  Trading {\n    Tokens(\n      where: {Token: {Address: {is: \"${address}\"}}}\n      limit: {count: 1}\n    ) {\n      Currency {\n        Id\n      }\n    }\n  }\n}\n`,
    "variables": "{}"
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(CONFIG.bitquery.eapEndpoint, requestOptions);
  const responseText = await response.text();
  
  // Check if response is valid JSON
  if (!responseText.trim().startsWith('{')) {
    if (responseText.includes('Points limit exceeded')) {
      throw new Error(`❌ Bitquery API Error: Points limit exceeded. Your free tier quota is maxed out.\n\nSolutions:\n1. Wait 24 hours for quota reset\n2. Upgrade plan: https://account.bitquery.io/billing\n3. Use a different API key if you have one`);
    }
    throw new Error(`❌ Bitquery API Error: Received non-JSON response: ${responseText.substring(0, 200)}`);
  }
  
  const result = JSON.parse(responseText);
  
  // Check for API errors
  if (result.errors) {
    throw new Error(`❌ Bitquery API Error: ${result.errors[0]?.message || 'Unknown error'}`);
  }
  
  // Error handling for token not found
  if (!result.data?.Trading?.Tokens || result.data.Trading.Tokens.length === 0) {
    throw new Error(`Token ${address} not found in Bitquery database. Try a different token or use mainnet.`);
  }
  
  if (!result.data.Trading.Tokens[0]?.Currency?.Id) {
    throw new Error(`Unable to retrieve currency ID for token ${address}`);
  }
  
  const currencyId = result.data.Trading.Tokens[0].Currency.Id;
  return currencyId;
}

const run = async (address) => {
    const currencyId = await getCurrencyId(address);
    console.log("Currency Received:", currencyId);
    
    const bitqueryConnection = new WebSocket(
      CONFIG.bitquery.endpoint + "?token=" + CONFIG.bitquery.oauthToken,
      ["graphql-ws"]
    );
    
    let buffer = [];
    
    bitqueryConnection.on("open", () => {
      console.log("Connected to Bitquery.");
    
      // Send initialization message (connection_init)
      const initMessage = JSON.stringify({ type: "connection_init" });
      bitqueryConnection.send(initMessage);
    }); 

    bitqueryConnection.on("message", (data) => {
      const response = JSON.parse(data);
    
      switch (response.type) {
        case "connection_ack":
          console.log("Connection acknowledged by server.");
    
          // Send subscription message
          const subscriptionMessage = JSON.stringify({
            type: "start",
            id: "1",
            payload: {
              query: `
                subscription {
                    Trading {
                        Pairs(
                        where: {
                            Price: { IsQuotedInUsd: true }
                            Currency: { Id: { is: "${currencyId}" } }
                            QuoteCurrency: { Id: { is: "usdt" } }
                        }
                        ) {
                        Currency {
                            Id
                            Name
                            Symbol
                        }
                        QuoteCurrency {
                            Id
                            Name
                            Symbol
                        }
                        Market {
                            Name
                            NetworkBid
                            Network
                            Address
                        }
                        Price {
                            IsQuotedInUsd
                            Average {
                            Mean
                            Estimate
                            SimpleMoving
                            ExponentialMoving
                            WeightedSimpleMoving
                            }
                        }
                        QuoteToken {
                            Symbol
                            Name
                            Id
                            NetworkBid
                            Network
                            Did
                            Address
                        }
                        Token {
                            Symbol
                            Name
                            Id
                            NetworkBid
                            Network
                            Did
                            Address
                        }
                        }
                    }
                }
              `,
            },
          });
    
          bitqueryConnection.send(subscriptionMessage);
          console.log("Subscription message sent");
    
          // Automatically close the connection after configured timeout
          setTimeout(() => {
            console.log(`Closing WebSocket connection after ${CONFIG.monitoring.connectionTimeout / 1000} seconds.`);
            bitqueryConnection.close();
          }, CONFIG.monitoring.connectionTimeout);
          break;
    
        case "data":
          let data = response.payload.data.Trading.Pairs[0];
          buffer.push(data);
          if (buffer.length >= CONFIG.trading.bufferSize) {
            const opportunity = detectArbitrage(buffer, address, currencyId);
            if (opportunity) {
              console.log("\n⏳ Checking profitability...");
              executeArbitrage(opportunity).catch(err => console.error("Trade execution error:", err));
            } else {
              console.log("ℹ️  No arbitrage opportunity detected");
            }
            buffer = []; // reset buffer after check
          }
          break;
    
        case "ka":
          if (CONFIG.monitoring.logKeepAlive) {
            console.log("Keep-alive message received.");
          }
          break;
    
        case "error":
          console.error("Error message received:", response.payload.errors);
          break;
    
        default:
          if (CONFIG.monitoring.debugMode) {
            console.warn("Unhandled message type:", response.type);
          }
      }
    });
    
    bitqueryConnection.on("close", () => {
      console.log("Disconnected from Bitquery.");
    });
    
    bitqueryConnection.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
}

// Print configuration on startup
console.log("📋 Bot Configuration Loaded:");
console.log(`   Network: ${CONFIG.tradingNetwork}`);
console.log(`   Min Profit Threshold: $${CONFIG.trading.minProfitThreshold}`);
console.log(`   Gas Multiplier: ${CONFIG.trading.gasMultiplier}x`);
console.log(`   Buffer Size: ${CONFIG.trading.bufferSize} quotes`);
console.log(`   Debug Mode: ${CONFIG.monitoring.debugMode ? "ON" : "OFF"}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

run(CONFIG.targetToken);
