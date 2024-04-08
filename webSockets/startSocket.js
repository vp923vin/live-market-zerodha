require('dotenv').config();
const KiteConnect = require("kiteconnect").KiteConnect;
const KiteTicker = require("kiteconnect").KiteTicker;
const { getToken } = require("../dbQueries/fetchRecord");
const { createStockListTable } = require('../dbQueries/CreateTable');
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
        console.log(
            "Reconnecting: attempt - ",
            reconnections,
            " innterval - ",
            reconnect_interval
        );
    });
    ticker.on("error", (error) => console.error("WebSocket error:", error));
    ticker.on("disconnect", (event) =>
        console.log("WebSocket disconnected:", event)
    );
};

const onTicks = (ticks) => {
    console.log("Ticks", ticks);
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

        // console.log(mcxInstruments);
        const mcxInstrumentTokens = mcxInstruments.map(
            (instrument) => instrument.instrument_token
        );
        await createStockListTable(mcxInstruments);
        // console.log("instruements tokens", mcxInstrumentTokens);
        if (mcxInstrumentTokens.length > 0) {
            for (let i = 0; i < mcxInstrumentTokens.length; i++) {
                let element = Number(mcxInstrumentTokens[i]);
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
const startWebSocketData = () => { initializeTicker().then(startWebSocket).catch((error) => {
    console.error("Error initializing WebSocket:", error);
})};

module.exports = {
    startWebSocket,
    startWebSocketData
};
