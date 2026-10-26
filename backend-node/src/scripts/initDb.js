const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../utils/logger');

async function initializeDatabase() {
  const dbName = config.db.database;
  logger.info('DB-INIT', `Starting database initialization for [${dbName}] on ${config.db.host}:${config.db.port}...`);

  let rootConnection;
  try {
    // 1. Connect to MySQL server without database selected to ensure DB exists
    rootConnection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    logger.success('DB-INIT', `Database '${dbName}' created or confirmed existing.`);
    await rootConnection.end();
  } catch (err) {
    if (rootConnection) await rootConnection.end().catch(() => {});
    logger.error('DB-INIT', `Cannot connect to MySQL server to create database: ${err.message}`);
    process.exit(1);
  }

  // 2. Connect to the target database with multipleStatements enabled
  let dbConnection;
  try {
    dbConnection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: dbName,
      multipleStatements: true,
    });

    // Check if tables already exist
    const [tables] = await dbConnection.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
      [dbName]
    );

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedsPath = path.resolve(__dirname, '../../../database/seeds.sql');

    if (tables.length === 0) {
      logger.info('DB-INIT', `No tables found. Applying schema from: ${schemaPath}`);
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await dbConnection.query(schemaSql);
        logger.success('DB-INIT', 'Schema applied successfully.');
      } else {
        logger.warn('DB-INIT', `Schema file not found at ${schemaPath}`);
      }

      if (fs.existsSync(seedsPath)) {
        logger.info('DB-INIT', `Applying seed data from: ${seedsPath}`);
        const seedsSql = fs.readFileSync(seedsPath, 'utf8');
        await dbConnection.query(seedsSql);
        logger.success('DB-INIT', 'Seed data applied successfully.');
      } else {
        logger.warn('DB-INIT', `Seeds file not found at ${seedsPath}`);
      }
    } else {
      logger.info('DB-INIT', `Database already contains ${tables.length} tables. Checking if seeds needed...`);
      const [users] = await dbConnection.query('SELECT COUNT(*) as count FROM users');
      if (users[0]?.count === 0 && fs.existsSync(seedsPath)) {
        logger.info('DB-INIT', 'Users table is empty. Applying seeds...');
        const seedsSql = fs.readFileSync(seedsPath, 'utf8');
        await dbConnection.query(seedsSql);
        logger.success('DB-INIT', 'Seed data populated.');
      } else {
        logger.info('DB-INIT', 'Database is already initialized and populated.');
      }
    }

    logger.success('DB-INIT', `Database ${dbName} is completely initialized and ready!`);
    await dbConnection.end();
    process.exit(0);
  } catch (err) {
    if (dbConnection) await dbConnection.end().catch(() => {});
    logger.error('DB-INIT', `Failed during schema/seed execution: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
