const { WebSocket } = require("ws");
const config = require("./config.json");

const detectArbitrage = (quotes) => {
  if (!Array.isArray(quotes) || quotes.length === 0) return false;

  // Map to simplified rows: price + network/market
  const rows = quotes.map(q => ({
    price: q?.Price?.Average?.Estimate ?? 0,
    network: q?.Market?.Network,
    market: q?.Market?.Address
  }));

  // Find min and max
  let minRow = rows[0];
  let maxRow = rows[0];

  for (const r of rows) {
    if (r.price < minRow.price) minRow = r;
    if (r.price > maxRow.price) maxRow = r;
  }

  if (minRow.network !== maxRow.network || minRow.market !== maxRow.market) {
    console.log(
      `Arbitrage Opportunity Detected!\n` +
      `Buy @ ${minRow.price} on ${minRow.network}/${minRow.market}\n` +
      `Sell @ ${maxRow.price} on ${maxRow.network}/${maxRow.market}\n` +
      `Spread of: ${parseFloat(maxRow.price) - parseFloat(minRow.price)} USD`
    );
    return true;
  }

  return false;
}

const getCurrencyId = async (address) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${config.oauthtoken}`);

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

  const response = await fetch("https://streaming.bitquery.io/eap", requestOptions);
  const result = JSON.parse(await response.text());
  const currencyId = result.data.Trading.Tokens[0].Currency.Id;
  return currencyId;
}

const executeArbitrage = (currencyId) => {
    console.log("Trade Executed for:", currencyId);
}

const run = async (address) => {
    const currencyId = await getCurrencyId(address);
    console.log("Currency Received:", currencyId);
    const bitqueryConnection = new WebSocket(
      "wss://streaming.bitquery.io/graphql?token=" + config.oauthtoken,
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
                        limit: { count: 10 }
                        orderBy: { descending: Block_Time }
                        limitBy: { by: Market_Address, count: 1 }
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
    
          // Automatically close the connection after 300 seconds
          setTimeout(() => {
            console.log("Closing WebSocket connection after 300 seconds.");
            bitqueryConnection.close();
          }, 300000);
          break;
    
        case "data":
          let data = response.payload.data.Trading.Pairs[0];
          buffer.push(data);
          if (buffer.length >= 10) {
            if (detectArbitrage(buffer)){
              executeArbitrage(currencyId);
            } else {
              console.log("No opportunity detected");
            }
            buffer = []; // reset buffer after check
          }
          break;
    
        case "ka":
          console.log("Keep-alive message received.");
          break;
    
        case "error":
          console.error("Error message received:", response.payload.errors);
          break;
    
        default:
          console.warn("Unhandled message type:", response.type);
      }
    });
    
    bitqueryConnection.on("close", () => {
      console.log("Disconnected from Bitquery.");
    });
    
    bitqueryConnection.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
}


run("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599");
