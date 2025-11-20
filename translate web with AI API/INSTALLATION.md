# 🚀 Hướng Dẫn Cài Đặt - English Learning App Full Stack

## 📦 Package Bao Gồm

```
english-learning-app-fullstack/
├── backend/
│   ├── server.js              # Main API server
│   ├── setup-database.js      # Database setup script
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment config template
│
├── frontend/
│   └── index.html             # Frontend app
│
└── INSTALLATION.md            # File này
```

---

## 🎯 Yêu Cầu Hệ Thống

### Phần Mềm Cần Cài:

1. **Node.js** (v16 trở lên)
   - Download: https://nodejs.org
   - Kiểm tra: `node --version`

2. **MySQL** (v5.7 trở lên hoặc v8.0)
   - Download: https://dev.mysql.com/downloads/mysql/
   - Hoặc XAMPP: https://www.apachefriends.org/
   - Kiểm tra: `mysql --version`

3. **Git** (tùy chọn)
   - Download: https://git-scm.com/

---

## ⚡ Cài Đặt Nhanh (5 Phút)

### Bước 1: Cài Đặt MySQL

#### Option A: Cài MySQL Standalone

**Windows:**
```bash
1. Download MySQL Installer từ: https://dev.mysql.com/downloads/installer/
2. Chạy installer và chọn "Developer Default"
3. Đặt root password (nhớ password này!)
4. Hoàn tất cài đặt
```

**macOS:**
```bash
# Dùng Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

#### Option B: Cài XAMPP (Dễ Hơn)

```
1. Download XAMPP từ: https://www.apachefriends.org/
2. Cài đặt XAMPP
3. Mở XAMPP Control Panel
4. Start MySQL
5. Xong!
```

### Bước 2: Kiểm Tra MySQL

```bash
# Mở MySQL command line
mysql -u root -p

# Nhập password bạn đã đặt
# Nếu thành công, bạn sẽ thấy: mysql>

# Thoát
exit
```

### Bước 3: Setup Backend

```bash
# 1. Vào folder backend
cd backend

# 2. Cài dependencies
npm install

# 3. Tạo file .env từ template
cp .env.example .env

# Windows: copy .env.example .env
```

### Bước 4: Cấu Hình .env

Mở file `.env` và điền thông tin:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=english_learning_db
DB_PORT=3306

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**⚠️ QUAN TRỌNG:** Thay `your_mysql_password_here` bằng password MySQL của bạn!

### Bước 5: Setup Database

```bash
# Chạy script tạo database và tables
npm run setup
```

Bạn sẽ thấy:
```
✅ Connected to MySQL server
✅ Database 'english_learning_db' created/verified
✅ Table "users" created/verified
✅ Table "chat_sessions" created/verified
✅ Table "chat_messages" created/verified
✅ Table "vocabulary" created/verified
✅ Guest user created/verified

🎉 Database setup completed successfully!
```

### Bước 6: Start Backend Server

```bash
npm start
```

Bạn sẽ thấy:
```
╔════════════════════════════════════════════╗
║   🚀 English Learning API Server          ║
║                                            ║
║   📡 Server running on port 3000          ║
║   🌐 http://localhost:3000                ║
║   📊 Health: http://localhost:3000/api/health
║                                            ║
║   💾 Database: MySQL                       ║
║   🔌 Status: Connected                     ║
╚════════════════════════════════════════════╝
```

### Bước 7: Start Frontend

Mở terminal mới:

```bash
# Vào folder frontend
cd frontend

# Chạy simple HTTP server
# Option 1: Python
python -m http.server 8080

# Option 2: Python 3
python3 -m http.server 8080

# Option 3: Node.js
npx http-server -p 8080

# Option 4: PHP
php -S localhost:8080
```

### Bước 8: Truy Cập App

Mở trình duyệt:
```
http://localhost:8080
```

**🎉 XONG! App đã chạy!**

---

## 🔧 Troubleshooting

### Lỗi 1: "Cannot connect to MySQL server"

**Nguyên nhân:** MySQL chưa chạy

**Giải pháp:**
```bash
# Windows (XAMPP)
- Mở XAMPP Control Panel
- Click "Start" ở MySQL

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Lỗi 2: "Access denied for user 'root'"

**Nguyên nhân:** Password MySQL sai

**Giải pháp:**
1. Kiểm tra lại password trong file `.env`
2. Hoặc reset MySQL password:

```bash
# Stop MySQL
# Chạy MySQL safe mode
mysqld_safe --skip-grant-tables &

# Kết nối MySQL
mysql -u root

# Đổi password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
exit;

# Restart MySQL bình thường
```

### Lỗi 3: "Port 3000 already in use"

**Giải pháp:**
```bash
# Đổi port trong .env
PORT=3001

# Hoặc kill process đang dùng port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Lỗi 4: "CORS error" trên frontend

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trong `.env` backend
2. Đảm bảo backend đang chạy
3. Reload browser với Ctrl+Shift+R

### Lỗi 5: Backend không kết nối được database

**Giải pháp:**
```bash
# Test connection
mysql -u root -p -h localhost

# Nếu không connect được:
# 1. Kiểm tra MySQL có chạy không
# 2. Kiểm tra .env config
# 3. Chạy lại setup: npm run setup
```

---

## 📊 Database Schema

### Table: users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: chat_sessions
```sql
CREATE TABLE chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    user_id INT,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Table: chat_messages
```sql
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
```

### Table: vocabulary
```sql
CREATE TABLE vocabulary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    word VARCHAR(100) NOT NULL,
    translation TEXT,
    definition TEXT,
    examples TEXT,
    times_looked_up INT DEFAULT 1,
    first_looked_up TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_looked_up TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### Chat Sessions
```
GET    /api/chats/:userId              # Lấy danh sách chat
POST   /api/chats                      # Tạo chat mới
GET    /api/chats/session/:sessionId   # Lấy chi tiết chat
PUT    /api/chats/:sessionId           # Cập nhật title
DELETE /api/chats/:sessionId           # Xóa chat
```

### Messages
```
POST   /api/messages                   # Thêm tin nhắn
```

### Vocabulary
```
GET    /api/vocabulary/:userId         # Lấy từ vựng
POST   /api/vocabulary                 # Thêm/cập nhật từ
PUT    /api/vocabulary/:id/favorite    # Toggle favorite
DELETE /api/vocabulary/:id             # Xóa từ
```

### Statistics
```
GET    /api/stats/:userId              # Lấy thống kê
```

---

## 🧪 Test API

### Test với curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Tạo chat mới
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "title": "Test Chat"}'

# Lấy danh sách chat
curl http://localhost:3000/api/chats/1

# Thêm tin nhắn
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "role": "user",
    "content": "Hello!"
  }'
```

### Test với Postman:

1. Import collection
2. Set base URL: `http://localhost:3000`
3. Test từng endpoint

---

## 💻 Development Mode

Để phát triển với auto-reload:

```bash
# Backend (install nodemon nếu chưa có)
npm install -g nodemon

# Chạy với nodemon
npm run dev

# Frontend - dùng live-server
npm install -g live-server
cd frontend
live-server
```

---

## 🚀 Deployment

### Deploy Backend:

**Option 1: Heroku**
```bash
# Cài Heroku CLI
heroku login
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
```

**Option 2: DigitalOcean**
1. Tạo Droplet
2. Cài Node.js + MySQL
3. Clone code
4. Setup như local
5. Use PM2: `pm2 start server.js`

**Option 3: Railway**
1. Connect GitHub repo
2. Add MySQL plugin
3. Deploy tự động

### Deploy Frontend:

**Option 1: GitHub Pages**
```bash
# Push frontend folder
git add frontend
git commit -m "Deploy frontend"
git push origin main
# Enable GitHub Pages in repo settings
```

**Option 2: Netlify**
1. Kéo thả folder frontend
2. Deploy tự động

**Option 3: Vercel**
```bash
npm install -g vercel
cd frontend
vercel
```

---

## 📝 Environment Variables

### Development (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=english_learning_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Production (.env)
```env
DB_HOST=your-db-host.com
DB_USER=prod_user
DB_PASSWORD=strong_password
DB_NAME=english_learning_db_prod
DB_PORT=3306
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## 🔐 Security

### Best Practices:

1. **Không commit .env vào Git**
```bash
# Thêm vào .gitignore
.env
node_modules/
```

2. **Sử dụng strong passwords**
3. **Enable HTTPS trong production**
4. **Sanitize user input**
5. **Rate limiting API**
6. **Use JWT for authentication** (nếu thêm tính năng login)

---

## 📱 Mobile App (Optional)

Để build mobile app từ codebase này:

### React Native:
```bash
# Create new RN project
npx react-native init EnglishLearningApp

# Copy logic từ frontend
# Add API calls
# Build for iOS/Android
```

### Flutter:
```bash
# Create new Flutter project
flutter create english_learning_app

# Implement UI
# Add http package
# Connect to API
```

---

## 🎓 Next Steps

Sau khi setup xong, bạn có thể:

1. **Customize UI:** Đổi màu sắc, font chữ
2. **Add Features:**
   - User authentication
   - Multiple languages
   - AI pronunciation scoring
   - Flashcard system
3. **Optimize:**
   - Add caching
   - Compress images
   - Minify code

---

## 💡 Tips

1. **Backup database thường xuyên:**
```bash
mysqldump -u root -p english_learning_db > backup.sql
```

2. **Monitor logs:**
```bash
# Backend logs
tail -f server.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

3. **Performance tuning:**
```sql
-- Add indexes
CREATE INDEX idx_user_session ON chat_sessions(user_id);
CREATE INDEX idx_session_messages ON chat_messages(session_id);
```

---

## 🆘 Cần Giúp Đỡ?

- 📧 Email: support@example.com
- 💬 Discord: discord.gg/example
- 📝 GitHub Issues: github.com/yourrepo/issues
- 📚 Documentation: docs.yoursite.com

---

## 📜 License

MIT License - Free to use and modify

---

**Happy Coding! 🚀**

Made with ❤️ by English Learners Community
