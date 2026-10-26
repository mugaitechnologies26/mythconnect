const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('../utils/logger');

const pool = mysql.createPool(config.db);

/**
 * Execute a parameterized SQL query
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>} rows
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    logger.error('DATABASE', `Query failed: ${error.message}`, { sql, params });
    throw error;
  }
}

/**
 * Execute operations within a database transaction
 * @param {Function} callback (connection) => Promise<any>
 * @returns {Promise<any>}
 */
async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('DATABASE', `Transaction rolled back: ${error.message}`);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test database connectivity on application boot
 */
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result, DATABASE() AS current_db');
    logger.success('DATABASE', `Connected to MySQL [DB: ${rows[0].current_db}] successfully.`);
    return true;
  } catch (error) {
    logger.error('DATABASE', `Failed to connect to MySQL database: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
