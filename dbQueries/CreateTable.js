const pool = require('../config/dbConnect');
const { tableExists } = require('./checkTableExists');
const { insertAccessToken, insertStockListTable, emptyTableBeforeInsert } = require('./insertRecord');
const checkTableDataQuery = (tableName) => {
  const query = `SELECT COUNT(*) AS rowCount FROM ${tableName}`;
  return query;
}

const doesDataExist = async (tableName) => {
    const checkTableQuery = checkTableDataQuery(tableName);
    const [rows] = await pool.query(checkTableQuery);
    // Extract the row count from the result
    const rowCount = rows[0].rowCount;
    // Check if data exists based on the row count
    if (rowCount > 0) {
      console.log(`Data exists in the table ${tableName}.`);
      return true;
    } else {
      console.log(`No data exists in the table ${tableName}.`);
      return false;
    }

}

const createStockListTable = async (data) => {
  const table = 'StockList';
  const tableExist = await tableExists(table);

  if (!tableExist) {
    const createTableQuery = `
    CREATE TABLE ${table} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        instrument_token INT NOT NULL,
        exchange VARCHAR(255),
        tradingsymbol VARCHAR(255),
        name VARCHAR(255),
        last_price DECIMAL(10, 2),
        expiry VARCHAR(255),
        strike DECIMAL(10, 2),
        tick_size DECIMAL(10, 2),
        lot_size INT,
        create_date VARCHAR(20) NOT NULL,
        CONSTRAINT instrument_token_unique UNIQUE (instrument_token)
    )
`;


    try {
      await pool.query(createTableQuery);
      console.log('StockList table created');
      await insertStockListTable(data, table);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }
  else {
    const dataExists = await doesDataExist(table)
    if (dataExists == "false") {
      console.log('something went wrong')
    }else if(dataExists == false){
      await insertStockListTable(data, table);  
    } else {
      await emptyTableBeforeInsert(data, table);
    }
    // console.log('StockList table already exists');
  }
}

const createAccessTokenTable = async (access_token, currentDate) => {
  const table = 'access_tokens';
  const tableExist = await tableExists(table);
  if (!tableExist) {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            access_token VARCHAR(255) NOT NULL,
            create_date DATE NOT NULL
        )`;

    try {
      await pool.query(createTableQuery);
      await insertAccessToken(access_token, currentDate, table);
      console.log('Access token table created and data Inserted');
    } catch (error) {
      console.error('Error creating table and Data Insertion:', error);
      throw error;
    }
  } else {
    await insertAccessToken(access_token, currentDate, table);
    console.log('Access token table already exists');
  }
}

module.exports = {
  createStockListTable,
  createAccessTokenTable
}