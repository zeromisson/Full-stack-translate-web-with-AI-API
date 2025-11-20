// setup-database.js
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
    const dbName = process.env.DB_NAME || 'english_learning_app';

    const conn = await mysql.createConnection({ host, user, password, port });
    console.log('Connected to MySQL server');

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ensured.`);

    // Use the database
    await conn.query(`USE \`${dbName}\``);

    // Create chats table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chats (
        session_id VARCHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) DEFAULT 'Conversation',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_count INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table chats ensured.');

    // Create messages table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(36),
        role VARCHAR(20),
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chats(session_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table messages ensured.');

    await conn.end();
    console.log('Setup complete. You can now run the server.');
  } catch (err) {
    console.error('Setup DB error:', err);
    process.exit(1);
  }
})();
