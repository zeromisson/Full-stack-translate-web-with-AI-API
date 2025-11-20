# 📝 Command Cheat Sheet - English Learning App

## 🚀 Setup Commands

### Initial Setup
```bash
# Clone project
git clone <repository-url>
cd english-learning-app-fullstack

# Install MySQL
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# macOS: brew install mysql
# Linux: sudo apt install mysql-server

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL password
npm run setup
npm start

# Setup Frontend (new terminal)
cd frontend
python -m http.server 8080
# OR: npx http-server -p 8080
```

---

## 🗄️ MySQL Commands

### Start/Stop MySQL

**macOS (Homebrew):**
```bash
brew services start mysql
brew services stop mysql
brew services restart mysql
```

**Linux:**
```bash
sudo systemctl start mysql
sudo systemctl stop mysql
sudo systemctl restart mysql
sudo systemctl status mysql
```

**Windows (XAMPP):**
```
Open XAMPP Control Panel → Start MySQL
```

### Connect to MySQL
```bash
mysql -u root -p
# Enter password when prompted
```

### Common MySQL Commands
```sql
-- Show databases
SHOW DATABASES;

-- Use database
USE english_learning_db;

-- Show tables
SHOW TABLES;

-- Describe table structure
DESCRIBE chat_sessions;

-- View data
SELECT * FROM chat_sessions;
SELECT * FROM chat_messages LIMIT 10;
SELECT * FROM users;

-- Count records
SELECT COUNT(*) FROM chat_messages;

-- Delete all data (careful!)
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_sessions;

-- Drop database (very careful!)
DROP DATABASE english_learning_db;

-- Exit MySQL
exit;
```

### Backup & Restore
```bash
# Backup
mysqldump -u root -p english_learning_db > backup.sql

# Restore
mysql -u root -p english_learning_db < backup.sql
```

---

## 🔧 Backend Commands

### Development
```bash
cd backend

# Start server
npm start

# Start with auto-reload (nodemon)
npm run dev

# Setup/Reset database
npm run setup

# Install new package
npm install package-name

# Update packages
npm update
```

### Testing API
```bash
# Health check
curl http://localhost:3000/api/health

# Get chats
curl http://localhost:3000/api/chats/1

# Create new chat
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "title": "Test Chat"}'

# Get stats
curl http://localhost:3000/api/stats/1
```

### Process Management
```bash
# Check if running on port 3000
lsof -i :3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🌐 Frontend Commands

### Development Server

**Python:**
```bash
cd frontend

# Python 3
python -m http.server 8080
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Node.js:**
```bash
# Install http-server globally
npm install -g http-server

# Run server
cd frontend
http-server -p 8080

# Or use npx (no install)
npx http-server -p 8080
```

**PHP:**
```bash
cd frontend
php -S localhost:8080
```

**Live Server (VS Code):**
```
1. Install "Live Server" extension
2. Right-click index.html
3. Select "Open with Live Server"
```

---

## 🐛 Debugging Commands

### Check Logs

**Backend logs:**
```bash
# Real-time logs
tail -f server.log

# View last 100 lines
tail -n 100 server.log

# Search for errors
grep "error" server.log
```

**MySQL logs:**
```bash
# Error log location
tail -f /var/log/mysql/error.log

# Query log (if enabled)
tail -f /var/log/mysql/query.log
```

### Debug Node.js
```bash
# Enable debug mode
DEBUG=* npm start

# Or use Node inspector
node --inspect server.js
# Then open chrome://inspect
```

### Check Process Status
```bash
# List Node processes
ps aux | grep node

# Check MySQL process
ps aux | grep mysql

# Check port usage
netstat -tuln | grep 3000
netstat -tuln | grep 3306
```

---

## 📦 NPM Commands

### Package Management
```bash
# Install all dependencies
npm install

# Install specific package
npm install express
npm install mysql2

# Install dev dependency
npm install --save-dev nodemon

# Uninstall package
npm uninstall package-name

# Update package
npm update package-name

# Check outdated packages
npm outdated

# Clean cache
npm cache clean --force
```

---

## 🔐 Git Commands

### Basic Git
```bash
# Initialize repo
git init

# Add files
git add .
git add backend/server.js

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull
git pull origin main

# Status
git status

# View history
git log --oneline
```

### Branches
```bash
# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## 🚀 Deployment Commands

### PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js --name english-api

# List processes
pm2 list

# Monitor
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart english-api

# Stop
pm2 stop english-api

# Delete
pm2 delete english-api

# Startup on boot
pm2 startup
pm2 save
```

### Docker Commands
```bash
# Build image
docker build -t english-learning-app .

# Run container
docker run -p 3000:3000 english-learning-app

# Stop container
docker stop <container-id>

# View containers
docker ps

# View logs
docker logs <container-id>

# Remove container
docker rm <container-id>
```

### Nginx (Reverse Proxy)
```bash
# Test config
sudo nginx -t

# Reload
sudo nginx -s reload

# Restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## 📊 Database Queries

### Useful Queries

```sql
-- Count total chats per user
SELECT user_id, COUNT(*) as total_chats 
FROM chat_sessions 
GROUP BY user_id;

-- Get most active users
SELECT u.username, COUNT(cs.id) as chat_count
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
GROUP BY u.id
ORDER BY chat_count DESC;

-- Find chats with most messages
SELECT cs.title, COUNT(cm.id) as msg_count
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
GROUP BY cs.id
ORDER BY msg_count DESC
LIMIT 10;

-- Get recent activity
SELECT * FROM chat_sessions 
ORDER BY updated_at DESC 
LIMIT 20;

-- Search messages
SELECT * FROM chat_messages 
WHERE content LIKE '%hello%';

-- Delete old chats (soft delete)
UPDATE chat_sessions 
SET is_deleted = TRUE 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Clean up deleted chats (hard delete)
DELETE FROM chat_sessions 
WHERE is_deleted = TRUE 
AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Performance Queries

```sql
-- Check table sizes
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'english_learning_db'
ORDER BY (data_length + index_length) DESC;

-- Show indexes
SHOW INDEX FROM chat_sessions;

-- Analyze query performance
EXPLAIN SELECT * FROM chat_messages WHERE session_id = 1;
```

---

## 🧪 Testing Commands

### Test Backend
```bash
# Install testing packages
npm install --save-dev jest supertest

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Manual API Testing
```bash
# Test all endpoints
./test-api.sh

# Or manually with curl
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/chats/1
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

---

## 💾 Backup Commands

### Database Backup
```bash
# Full backup
mysqldump -u root -p english_learning_db > backup_$(date +%Y%m%d).sql

# Backup specific tables
mysqldump -u root -p english_learning_db chat_sessions chat_messages > chats_backup.sql

# Compressed backup
mysqldump -u root -p english_learning_db | gzip > backup.sql.gz
```

### Restore Backup
```bash
# Restore from backup
mysql -u root -p english_learning_db < backup_20240101.sql

# Restore from compressed
gunzip < backup.sql.gz | mysql -u root -p english_learning_db
```

---

## 🔍 Monitoring Commands

### System Monitoring
```bash
# CPU and Memory usage
top
htop

# Disk usage
df -h
du -sh *

# Network connections
netstat -an | grep :3000
netstat -an | grep :3306

# Check logs
tail -f /var/log/syslog
```

### Application Monitoring
```bash
# Node process memory
ps aux | grep node

# MySQL process
ps aux | grep mysql

# Connection count
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"

# Query statistics
mysql -u root -p -e "SHOW STATUS LIKE 'Questions';"
```

---

## 🎯 Quick Shortcuts

### Start Everything
```bash
# Terminal 1: MySQL (if not running)
brew services start mysql  # or sudo systemctl start mysql

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
cd frontend && python -m http.server 8080

# Browser
# http://localhost:8080
```

### Stop Everything
```bash
# Stop servers (Ctrl+C in each terminal)
# Or kill processes
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:8080 | xargs kill -9  # Frontend
```

### Reset Everything
```bash
# Clear database
mysql -u root -p -e "DROP DATABASE IF EXISTS english_learning_db;"

# Setup again
cd backend
npm run setup

# Start fresh
npm start
```

---

## 📚 Documentation Commands

### Generate Docs
```bash
# API documentation with JSDoc
npm install -g jsdoc
jsdoc server.js -d docs/

# Or use Swagger
npm install swagger-ui-express swagger-jsdoc
```

### View API Docs
```
http://localhost:3000/api-docs
```

---

## 🎓 Learning Resources

### Useful Links
```
Node.js Docs: https://nodejs.org/docs
Express Docs: https://expressjs.com
MySQL Docs: https://dev.mysql.com/doc
npm Docs: https://docs.npmjs.com
```

---

## 💡 Tips & Tricks

### Auto-restart on file changes
```bash
# Install nodemon globally
npm install -g nodemon

# Use it
nodemon server.js
```

### Better logs
```bash
# Install morgan for HTTP logging
npm install morgan

# Add to server.js
const morgan = require('morgan');
app.use(morgan('dev'));
```

### Environment-based config
```bash
# Different configs
cp .env .env.development
cp .env .env.production

# Use specific env
NODE_ENV=production npm start
```

---

**💡 Pro Tip:** Bookmark this page for quick reference!

**📌 Save commonly used commands in your shell aliases:**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias start-backend="cd ~/projects/english-app/backend && npm start"
alias start-frontend="cd ~/projects/english-app/frontend && python -m http.server 8080"
```

---

**Made with ❤️ for Developers**
