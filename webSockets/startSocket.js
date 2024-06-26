require('dotenv').config();
const KiteConnect = require("kiteconnect").KiteConnect;
const KiteTicker = require("kiteconnect").KiteTicker;
const { getToken, getTradesData } = require("../dbQueries/fetchRecord");
const { createStockListTable } = require('../dbQueries/CreateTable');
const { updateTrades } = require('../dbQueries/updateRecord');
const apiKey = "pftgv0hek092gn0d";
let accessToken;
let ticker;

const kite = new KiteConnect({
    api_key: apiKey,
});

// Function to initialize KiteTicker
const initializeTicker = async () => {
    try {
        accessToken = await getToken();
        kite.setAccessToken(accessToken);

        ticker = new KiteTicker({
            api_key: apiKey,
            access_token: accessToken,
        });

        ticker.autoReconnect(true, -1, 5);
    } catch (error) {
        console.error("Error initializing ticker:", error);
        throw error; // Propagate the error
    }
};

// Function to start WebSocket connection and subscribe to events
const startWebSocket = () => {
    if (!ticker) {
        console.error("Ticker is not initialized");
        return;
    }
    
    ticker.connect();
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);
    ticker.on("noreconnect", () => console.log("noreconnect"));
    ticker.on("reconnecting", (reconnect_interval, reconnections) => {
        startWebSocketData();
        console.log(
            "Reconnecting: attempt - ",
            reconnections,
            " innterval - ",
            reconnect_interval
        );
    });
    ticker.on("error", (error) => console.error("WebSocket error:", error));
    ticker.on("disconnect", (event) => {
        startWebSocketData();
        console.log("WebSocket disconnected:", event)
    });
};

const onTicks = (ticks) => {
    updateTrades(ticks)
    console.log("Ticks ", ticks);
};

const subscribe = async () => {
    try {
        const instruments = await kite.getInstruments();
        const nameArray = [
            "GOLD",
            "GOLDM",
            "SILVER",
            "SILVERM",
            "COPPER",
            "ALUMINIUM",
            "CRUDEOIL",
            "LEAD",
            "ZINC",
            "NICKEL",
            "MENTHAOIL",
            "NATURALGAS",
        ];
        const mcxInstruments = instruments.filter(
            (instrument) =>
                instrument.exchange === "MCX" &&
                instrument.instrument_type === "FUT" &&
                nameArray.includes(instrument.name)
        );

        await createStockListTable(mcxInstruments);

        const tokens = await getTradesData();

        if (tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                // console.log("ttttt", tokens[i].token)
                let element = Number(tokens[i].token);
                ticker.subscribe([element]);
                ticker.setMode(ticker.modeFull, element);
            }
        } else {
            console.log("No instruments to subscribe.");
        }
    } catch (error) {
        console.error("Error fetching instruments:", error);
    }
};

// Initialize ticker and start WebSocket
function startWebSocketData() { initializeTicker().then(startWebSocket).catch((error) => {
    console.error("Error initializing WebSocket:", error);
})};

module.exports = {
    startWebSocket,
    startWebSocketData
};
