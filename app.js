require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { startWebSocketData } = require('./webSockets/startSocket');
const { createAccessTokenTable } = require('./dbQueries/CreateTable');
const { getAllInstrumentsData } = require('./dbQueries/fetchRecord');
const app = express();
const port = process.env.APP_PORT || 3000;
const base_uri = process.env.APP_BASE_URI;
const app_name = process.env.APP_NAME;

app.use(bodyParser.json());
app.use(cors());
// Start the WebSocket connection

// createStockListTable();
app.get('/', (req, res) => {
    res.send(`Welcome to ${app_name}.`);
});

app.post('/api/store-access-token', async (req, res) => {
    try {
        const { access_token } = req.body;
        if (!access_token) {
            return res.status(400).json({ error: 'Access token is required' });
        }
        const currentDate = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata', 
        }).split(',')[0].split('/').reverse().join('-');

        await createAccessTokenTable(access_token, currentDate);
        startWebSocketData();
        res.status(200).json({ message: 'Access token stored successfully' });
    } catch (error) {
        console.error('Error storing access token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// startWebSocketData();

app.get('/api/get-stock-list', async (req, res) => {
    try {
        const stockList = await getAllInstrumentsData();
        res.status(200).json(stockList);
    } catch (error) {
        console.error('Error fetching stock list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${base_uri}:${port},`);
});
