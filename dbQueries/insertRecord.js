const pool = require('../config/dbConnect');

const insertAccessToken = async (access_token, currentDate, table) => {
    const insertQuery = `
    INSERT INTO ${table} (access_token, create_date) 
    VALUES (?, ?)`;

    try {
        await pool.query(insertQuery, [access_token, currentDate]);
        console.log('Access token stored successfully');
    } catch (error) {
        console.error('Error storing access token:', error);
        throw error;
    }
}

const insertStockListTable = async (data, table) => {
    try {
        const currentDate = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata', 
        }).split(',')[0].split('/').reverse().join('-');

        for (const item of data) {
            const { instrument_token, exchange, tradingsymbol, name, last_price, expiry, strike, tick_size, lot_size } = item;

            // Prepare the insert query with placeholders for values
            const insertQuery = `INSERT INTO ${table} (instrument_token, exchange, tradingsymbol, name, last_price, expiry, strike, tick_size, lot_size, create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            // Execute the insert query with the object's values
            await pool.query(insertQuery, [instrument_token, exchange, tradingsymbol, name, last_price, expiry, strike, tick_size, lot_size, currentDate]);
            console.log('Inserting data into StockList table...');
        }

    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}


const emptyTableBeforeInsert = async (data, table) => {
    try {
        const currentDate = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata', 
        }).split(',')[0].split('/').reverse().join('-');
        
        const query = `SELECT create_date FROM ${table} order by id desc limit 1`
        const result = await pool.query(query);

        const createDates = result[0].map(row => row.create_date);
        
        if (createDates[0] == currentDate) {
            console.log('Table is already up to date.');
        } else {
            const deleteQuery = `DELETE FROM ${table}`;
            await pool.query(deleteQuery);
            console.log('Table emptied successfully.');
            await insertStockListTable(data, table);
        }
        
    } catch (error) {
        console.error('Error emptying table:', error);
        throw error;
    }
}

module.exports = {
    insertAccessToken,
    insertStockListTable,
    emptyTableBeforeInsert
}