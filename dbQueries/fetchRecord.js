const pool = require('../config/dbConnect');

const getToken = async () => {
    const currentDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata', 
    }).split(',')[0].split('/').reverse().join('-');

    try {
        const query = `SELECT access_token FROM access_tokens WHERE DATE(create_date) = ? ORDER BY id DESC LIMIT 1`;
        const [rows, fields] = await pool.query(query, [currentDate]);
        if (rows.length > 0) {
            return rows[0].access_token;
        } else {
            throw new Error('No token found for the current date');
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}


const getAllInstrumentsData = async () => {
    try {
        const query = `SELECT * FROM stocklist`;
        const result = await pool.query(query);
        return result[0];
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}


const getTradesData = async () => {
    try {
        const query = `SELECT token FROM trades`;
        const result = await pool.query(query);
        return result[0];
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}

module.exports = {
    getToken,
    getAllInstrumentsData,
    getTradesData
}
