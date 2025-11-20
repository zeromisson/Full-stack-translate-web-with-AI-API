// migrate-db.js
// Usage: node migrate-db.js
require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');
(async () => {
  try {
    const sql = fs.readFileSync('./upgrade.sql', 'utf8');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      multipleStatements: true
    });
    console.log('Connected to MySQL, running migration...');
    // split on DELIMITER statements may break; run whole file as single query where possible
    // mysql2 supports multipleStatements=true; triggers use DELIMITER in .sql: replace DELIMITER blocks with statements
    // So we remove DELIMITER tokens for execution here and keep the CREATE TRIGGER bodies.
    const cleaned = sql.replace(/DELIMITER\s+\$\$/g, '').replace(/\$\$/g, '');
    await conn.query(cleaned);
    console.log('Migration finished.');
    await conn.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();