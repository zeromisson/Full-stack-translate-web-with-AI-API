-- Tối ưu và mở rộng schema cho english_learning_app
-- 1) Thêm index để tăng tốc truy vấn
ALTER TABLE chats
  ADD INDEX idx_chats_user_id (user_id);

ALTER TABLE messages
  ADD INDEX idx_messages_session_id (session_id),
  ADD INDEX idx_messages_created_at (created_at);

-- 2) Thêm fulltext index cho search nội dung (InnoDB, MySQL 5.6+)
-- Nếu MySQL cũ không hỗ trợ fulltext trên InnoDB, bỏ phần này hoặc dùng MyISAM cho bảng tìm kiếm
ALTER TABLE messages
  ADD FULLTEXT INDEX ft_messages_content (content);

-- 3) Tạo bảng users cơ bản để sau này không dùng userId cố định
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Tạo bảng vocabulary (nếu muốn lưu từ vựng tập trung ở DB)
CREATE TABLE IF NOT EXISTS vocabulary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  word VARCHAR(255) NOT NULL,
  source_session VARCHAR(36) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_word (user_id, word),
  INDEX idx_vocab_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Trigger để duy trì message_count trong chats (đảm bảo nhất quán nếu có thao tác trực tiếp lên messages)
DROP TRIGGER IF EXISTS trg_messages_after_insert;
DELIMITER $$
CREATE TRIGGER trg_messages_after_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  UPDATE chats SET message_count = message_count + 1 WHERE session_id = NEW.session_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_messages_after_delete;
DELIMITER $$
CREATE TRIGGER trg_messages_after_delete
AFTER DELETE ON messages
FOR EACH ROW
BEGIN
  UPDATE chats SET message_count = GREATEST(0, message_count - 1) WHERE session_id = OLD.session_id;
END$$
DELIMITER ;

-- 6) (Tùy chọn) View tóm tắt chat cho user
DROP VIEW IF EXISTS view_chat_summary;
CREATE VIEW view_chat_summary AS
SELECT c.session_id, c.user_id, c.title, c.created_at, c.message_count
FROM chats c;

-- 7) An toàn: đảm bảo user_id có index (nếu chưa có)
-- (idx_chats_user_id đã thêm ở trên)

-- 8) Nếu bạn muốn reset message_count dựa trên dữ liệu thực (dùng khi số liệu không đồng bộ)
-- (chạy khi cần)
-- UPDATE chats c SET c.message_count = (SELECT COUNT(*) FROM messages m WHERE m.session_id = c.session_id);