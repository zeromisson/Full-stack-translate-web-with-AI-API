# 🔌 API Documentation - English Learning App

## Base URL

```
http://localhost:3000
```

For production, replace with your domain:
```
https://your-domain.com
```

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Chat Sessions](#chat-sessions)
3. [Messages](#messages)
4. [Vocabulary](#vocabulary)
5. [Statistics](#statistics)
6. [Error Handling](#error-handling)

---

## 🏥 Health Check

### GET /api/health

Check if server is running.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-11-17T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

## 💬 Chat Sessions

### 1. Get All Chats

Get all chat sessions for a user.

**Endpoint:** `GET /api/chats/:userId`

**Request:**
```bash
curl http://localhost:3000/api/chats/1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Hello how are you...",
      "created_at": "2024-11-17T10:00:00.000Z",
      "updated_at": "2024-11-17T10:30:00.000Z",
      "message_count": 12,
      "first_message": "Hello how are you?"
    },
    {
      "id": 2,
      "session_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Practice grammar",
      "created_at": "2024-11-16T15:00:00.000Z",
      "updated_at": "2024-11-16T16:00:00.000Z",
      "message_count": 8,
      "first_message": "Let's practice grammar"
    }
  ]
}
```

**Parameters:**
- `userId` (path) - User ID

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Create New Chat

Create a new chat session.

**Endpoint:** `POST /api/chats`

**Request:**
```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "New Conversation"
  }'
```

**Request Body:**
```json
{
  "userId": 1,
  "title": "New Conversation"  // Optional, defaults to "New Conversation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "session_id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "New Conversation"
  }
}
```

**Status Codes:**
- `200 OK` - Chat created
- `500 Internal Server Error` - Server error

---

### 3. Get Chat Session Details

Get a specific chat session with all messages.

**Endpoint:** `GET /api/chats/session/:sessionId`

**Request:**
```bash
curl http://localhost:3000/api/chats/session/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 1,
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": 1,
      "title": "Hello how are you...",
      "created_at": "2024-11-17T10:00:00.000Z",
      "updated_at": "2024-11-17T10:30:00.000Z",
      "is_deleted": false
    },
    "messages": [
      {
        "id": 1,
        "role": "user",
        "content": "Hello how are you?",
        "created_at": "2024-11-17T10:00:00.000Z",
        "metadata": {}
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "I'm great! How about you?",
        "created_at": "2024-11-17T10:00:15.000Z",
        "metadata": {}
      }
    ]
  }
}
```

**Parameters:**
- `sessionId` (path) - Session UUID

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Session not found
- `500 Internal Server Error` - Server error

---

### 4. Update Chat Title

Update the title of a chat session.

**Endpoint:** `PUT /api/chats/:sessionId`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/chats/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "English Practice Session 1"
  }'
```

**Request Body:**
```json
{
  "title": "English Practice Session 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat title updated"
}
```

**Status Codes:**
- `200 OK` - Title updated
- `500 Internal Server Error` - Server error

---

### 5. Delete Chat Session

Soft delete a chat session (marks as deleted, doesn't remove from DB).

**Endpoint:** `DELETE /api/chats/:sessionId`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/chats/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted"
}
```

**Status Codes:**
- `200 OK` - Chat deleted
- `500 Internal Server Error` - Server error

---

## 📨 Messages

### Add Message to Chat

Add a new message to a chat session.

**Endpoint:** `POST /api/messages`

**Request:**
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "user",
    "content": "What is the weather like today?",
    "metadata": {}
  }'
```

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "user",           // "user" or "assistant"
  "content": "What is the weather like today?",
  "metadata": {}            // Optional, can store any JSON
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "message": "Message added"
  }
}
```

**Auto Features:**
- Automatically updates session's `updated_at` timestamp
- Auto-generates title from first user message

**Status Codes:**
- `200 OK` - Message added
- `404 Not Found` - Session not found
- `500 Internal Server Error` - Server error

---

## 📖 Vocabulary

### 1. Get User Vocabulary

Get all vocabulary words for a user.

**Endpoint:** `GET /api/vocabulary/:userId`

**Request:**
```bash
# All words
curl http://localhost:3000/api/vocabulary/1

# Favorite words only
curl http://localhost:3000/api/vocabulary/1?favorite=true

# Search words
curl http://localhost:3000/api/vocabulary/1?search=hello

# Limit results
curl http://localhost:3000/api/vocabulary/1?limit=10
```

**Query Parameters:**
- `favorite` (boolean) - Filter favorite words
- `search` (string) - Search in words
- `limit` (number) - Limit results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "word": "serendipity",
      "translation": "sự tình cờ may mắn",
      "definition": "The occurrence of events by chance...",
      "examples": "Finding this app was pure serendipity!",
      "times_looked_up": 3,
      "first_looked_up": "2024-11-15T10:00:00.000Z",
      "last_looked_up": "2024-11-17T14:30:00.000Z",
      "is_favorite": true
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Add/Update Vocabulary

Add a new word or update existing word's lookup count.

**Endpoint:** `POST /api/vocabulary`

**Request:**
```bash
curl -X POST http://localhost:3000/api/vocabulary \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "word": "ephemeral",
    "translation": "phù du, tạm thời",
    "definition": "Lasting for a very short time",
    "examples": "Fame is ephemeral"
  }'
```

**Request Body:**
```json
{
  "userId": 1,
  "word": "ephemeral",
  "translation": "phù du, tạm thời",
  "definition": "Lasting for a very short time",
  "examples": "Fame is ephemeral"
}
```

**Response (New Word):**
```json
{
  "success": true,
  "message": "Vocabulary added",
  "data": {
    "id": 5
  }
}
```

**Response (Existing Word):**
```json
{
  "success": true,
  "message": "Vocabulary updated",
  "data": {
    "id": 5
  }
}
```

**Auto Features:**
- If word exists: Increments `times_looked_up`
- If new word: Creates new record

**Status Codes:**
- `200 OK` - Word added/updated
- `500 Internal Server Error` - Server error

---

### 3. Toggle Favorite

Toggle favorite status of a word.

**Endpoint:** `PUT /api/vocabulary/:id/favorite`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/vocabulary/5/favorite
```

**Response:**
```json
{
  "success": true,
  "message": "Favorite toggled"
}
```

**Status Codes:**
- `200 OK` - Favorite toggled
- `500 Internal Server Error` - Server error

---

### 4. Delete Vocabulary

Delete a vocabulary word.

**Endpoint:** `DELETE /api/vocabulary/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/vocabulary/5
```

**Response:**
```json
{
  "success": true,
  "message": "Vocabulary deleted"
}
```

**Status Codes:**
- `200 OK` - Word deleted
- `500 Internal Server Error` - Server error

---

## 📊 Statistics

### Get User Statistics

Get comprehensive statistics for a user.

**Endpoint:** `GET /api/stats/:userId`

**Request:**
```bash
curl http://localhost:3000/api/stats/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_chats": 15,
    "total_messages": 247,
    "total_vocabulary": 89,
    "top_words": [
      {
        "word": "hello",
        "times_looked_up": 12
      },
      {
        "word": "serendipity",
        "times_looked_up": 8
      },
      {
        "word": "ephemeral",
        "times_looked_up": 5
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

### Example Errors

**Session Not Found:**
```json
{
  "success": false,
  "error": "Session not found"
}
```

**Database Error:**
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## 🔐 CORS Configuration

Current CORS settings:

```javascript
cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
})
```

For production, set `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=https://yourdomain.com
```

---

## 📝 Request/Response Examples

### Complete Chat Flow

```bash
# 1. Create new chat
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Response: { "session_id": "abc-123" }

# 2. Add user message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123",
    "role": "user",
    "content": "Hello!"
  }'

# 3. Add AI response
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123",
    "role": "assistant",
    "content": "Hi there! How can I help?"
  }'

# 4. Get full chat history
curl http://localhost:3000/api/chats/session/abc-123
```

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Import → Raw Text
3. Paste this:

```json
{
  "info": {
    "name": "English Learning API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/health"
      }
    },
    {
      "name": "Get Chats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/chats/1"
      }
    },
    {
      "name": "Create Chat",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/chats",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": 1,\n  \"title\": \"Test Chat\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 🔄 Rate Limiting (Future)

Planned rate limiting:

```
- 100 requests per minute per IP
- 1000 requests per hour per user
- No limit for localhost
```

To implement:
```bash
npm install express-rate-limit
```

---

## 📚 Additional Resources

### Swagger/OpenAPI (Future)

To add Swagger documentation:

```bash
npm install swagger-ui-express swagger-jsdoc
```

Then access at: `http://localhost:3000/api-docs`

---

## 💡 Best Practices

### When Calling API:

1. **Always check `success` field:**
```javascript
if (response.success) {
  // Handle success
} else {
  // Handle error
  console.error(response.error);
}
```

2. **Handle network errors:**
```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
} catch (error) {
  console.error('Network error:', error);
}
```

3. **Use proper HTTP methods:**
- GET - Retrieve data
- POST - Create new
- PUT - Update existing
- DELETE - Remove

4. **Set headers:**
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

---

## 🔗 Quick Links

- Health: `GET /api/health`
- Docs: This file
- Source: `backend/server.js`
- Frontend: `frontend/index.html`

---

**API Version: 3.0**  
**Last Updated: November 2024**  
**Maintained by: English Learning Community**

For issues or questions:
- 📧 Email: support@example.com
- 🐛 GitHub: github.com/yourrepo/issues

---

**Happy Coding! 🚀**
