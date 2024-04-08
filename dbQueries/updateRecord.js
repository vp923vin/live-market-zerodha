const pool = require('../config/dbConnect');


const updateTrades = (ticks) => {
    // console.log(ticks)
    ticks.forEach((tick) => {
        // console.log(tick)
        const { instrument_token, last_price, change, ohlc } = tick;
        // console.log("data",  instrument_token, last_price, change, ohlc);
        const { open, high, low } = ohlc;
        // console.log("ohlc", open, high, low);
        const sql = `UPDATE trades SET price = ?, chg = ?, open = ?, high = ?, low = ? WHERE token = ?`;
        const values = [last_price, change.toFixed(2), open, high, low, instrument_token];

        pool.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error updating trade:', err);
                return;
            }else{
                console.log(`Trade updated for token ${result}, ${instrument_token}`);
            }
        });
    });
}

module.exports = {
    updateTrades
}