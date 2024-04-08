const pool = require('../config/dbConnect');

const tableExists = async (tableName) => {
    try {
      const [rows] = await pool.query(`SHOW TABLES LIKE '${tableName}'`);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if table exists:', error);
      throw error;
    }
}  

module.exports = {
  tableExists
}
