// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let pool;
(async function initDbPool() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'english_learning_app',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
    console.log('MySQL pool created');
  } catch (err) {
    console.error('DB pool init error', err);
    process.exit(1);
  }
})();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get chats for a user
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const [rows] = await pool.query(
      'SELECT session_id, user_id, title, created_at, message_count FROM chats WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /api/chats error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new chat session
app.post('/api/chats', async (req, res) => {
  try {
    const { userId = 1, title = 'New Conversation' } = req.body;
    const session_id = uuidv4();
    const [result] = await pool.query(
      'INSERT INTO chats (session_id, user_id, title) VALUES (?, ?, ?)',
      [session_id, userId, title]
    );
    res.json({ success: true, data: { session_id, userId, title } });
  } catch (err) {
    console.error('POST /api/chats error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load session messages
app.get('/api/chats/session/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const [messages] = await pool.query(
      'SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
    res.json({ success: true, data: { messages } });
  } catch (err) {
    console.error('GET /api/chats/session error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete chat session (and cascade delete messages)
app.delete('/api/chats/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    await pool.query('DELETE FROM chats WHERE session_id = ?', [sessionId]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/chats error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save a message to a session
app.post('/api/messages', async (req, res) => {
  try {
    const { sessionId, role, content } = req.body;
    if (!sessionId || !content) return res.status(400).json({ success: false, error: 'Missing fields' });

    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, role, content]
    );
    // increment message_count
    await pool.query('UPDATE chats SET message_count = message_count + 1 WHERE session_id = ?', [sessionId]);
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/messages error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats endpoint
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const [[{ total_chats }]] = await pool.query(
      'SELECT COUNT(*) AS total_chats FROM chats WHERE user_id = ?',
      [userId]
    );
    const [[{ total_messages }]] = await pool.query(
      `SELECT COUNT(m.id) AS total_messages
       FROM messages m
       JOIN chats c ON m.session_id = c.session_id
       WHERE c.user_id = ?`,
      [userId]
    );
    // For total_vocabulary, fetch messages and compute unique words simple way:
    const [rows] = await pool.query(
      `SELECT m.content FROM messages m
       JOIN chats c ON m.session_id = c.session_id
       WHERE c.user_id = ?`,
      [userId]
    );

    const wordSet = new Set();
    rows.forEach(r => {
      if (!r.content) return;
      // simple split, remove punctuation
      const words = r.content.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').split(/\s+/).filter(Boolean);
      words.forEach(w => wordSet.add(w));
    });

    res.json({
      success: true,
      data: {
        total_chats: total_chats || 0,
        total_messages: total_messages || 0,
        total_vocabulary: wordSet.size
      }
    });
  } catch (err) {
    console.error('GET /api/stats error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
