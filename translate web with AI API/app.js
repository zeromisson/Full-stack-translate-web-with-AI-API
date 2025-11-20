// app.js - Frontend unified
// =========================

// CONFIG
const CONFIG = {
  userId: 1,
  backendUrl: (localStorage.getItem('backend_url') || 'http://localhost:3000'),
  currentSessionId: null
};

// UI references
const chatBox = () => document.getElementById('chatBox');
const chatHistoryList = () => document.getElementById('chatHistoryList');
const backendUrlInput = () => document.getElementById('backendUrl');

// Basic variables
let recognition = null;
let isRecording = false;

// IndexedDB for vocab history
const DB_NAME = 'vocabDB';
const STORE_VOCAB = 'vocabStore';
let idb = null;

// ---------- Init on load ----------
window.onload = async function() {
  document.getElementById('backendUrl').value = CONFIG.backendUrl;
  bindUI();
  await checkBackendConnection();
  await loadChatHistory();
  await createNewChat(); // auto create session
  await loadStats();
  initSpeechRecognition();
  initIDB();
};

// ---------- UI bindings ----------
function bindUI() {
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('newChatBtn').addEventListener('click', createNewChat);
  document.getElementById('lookupBtn').addEventListener('click', lookupWord);
  document.getElementById('toggleHistBtn').addEventListener('click', toggleVocabHistory);
  document.getElementById('backendUrl').addEventListener('change', function() {
    CONFIG.backendUrl = this.value;
    localStorage.setItem('backend_url', this.value);
    checkBackendConnection();
  });
  document.getElementById('voiceBtn').addEventListener('click', toggleVoiceRecognition);
}

// ---------- Backend health ----------
async function checkBackendConnection() {
  const statusBadge = document.getElementById('apiStatus');
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      statusBadge.textContent = '🟢 Backend: Connected';
      statusBadge.className = 'status-badge status-online';
    } else throw new Error('backend not ok');
  } catch (err) {
    statusBadge.textContent = '🔴 Backend: Offline';
    statusBadge.className = 'status-badge status-offline';
    console.warn('Backend offline', err);
  }
}

// ---------- Chat history (backend) ----------
async function loadChatHistory() {
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/chats/${CONFIG.userId}`);
    const result = await res.json();
    if (result.success) {
      chatHistoryList().innerHTML = '';
      result.data.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const created = new Date(session.created_at);
        const dateStr = `${created.getDate()}/${created.getMonth()+1} ${created.getHours()}:${String(created.getMinutes()).padStart(2,'0')}`;
        item.innerHTML = `
          <div class="history-title">${session.title || 'Conversation'}</div>
          <div class="history-date">${dateStr} • ${session.message_count} tin nhắn</div>
          <button class="history-delete" onclick="deleteChat('${session.session_id}', event)">×</button>
        `;
        item.addEventListener('click', () => loadChat(session.session_id, item));
        chatHistoryList().appendChild(item);
      });
    }
  } catch (err) {
    console.error('loadChatHistory error', err);
  }
}

async function createNewChat() {
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: CONFIG.userId, title: 'Conversation' })
    });
    const result = await res.json();
    if (result.success) {
      CONFIG.currentSessionId = result.data.session_id;
      document.getElementById('chatBox').innerHTML = `<div class="message ai-message">👋 Hello! I'm your AI English tutor. Let's practice English together!</div>`;
      await loadChatHistory();
    }
  } catch (err) {
    console.error('createNewChat error', err);
  }
}

async function loadChat(sessionId, historyItemEl) {
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/chats/session/${sessionId}`);
    const result = await res.json();
    if (result.success) {
      CONFIG.currentSessionId = sessionId;
      const chatBoxEl = document.getElementById('chatBox');
      chatBoxEl.innerHTML = '';
      result.data.messages.forEach(m => addMessageToUI(m.content, m.role));
      // mark active
      document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
      historyItemEl && historyItemEl.classList.add('active');
      chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
    }
  } catch (err) {
    console.error('loadChat error', err);
  }
}

async function deleteChat(sessionId, event) {
  event.stopPropagation();
  if (!confirm('Xóa cuộc trò chuyện này?')) return;
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/chats/${sessionId}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      if (CONFIG.currentSessionId === sessionId) await createNewChat();
      await loadChatHistory();
    }
  } catch (err) {
    console.error('deleteChat error', err);
  }
}

// ---------- Messages ----------
function addMessageToUI(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
  messageDiv.textContent = text;
  chatBox().appendChild(messageDiv);
  chatBox().scrollTop = chatBox().scrollHeight;
}

async function saveMessageToBackend(sessionId, role, content) {
  try {
    await fetch(`${CONFIG.backendUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, role, content })
    });
  } catch (err) {
    console.error('saveMessageToBackend error', err);
  }
}

// ---------- Send message (UI) ----------
async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message || !CONFIG.currentSessionId) return;
  // add to UI & save to backend
  addMessageToUI(message, 'user');
  await saveMessageToBackend(CONFIG.currentSessionId, 'user', message);
  input.value = '';
  // loading
  document.getElementById('loading').classList.add('active');
  // Call AI (either OpenAI API or demo)
  const aiReply = await getAIResponse(message);
  document.getElementById('loading').classList.remove('active');
  addMessageToUI(aiReply, 'assistant');
  await saveMessageToBackend(CONFIG.currentSessionId, 'assistant', aiReply);
  // refresh history (update counts)
  await loadChatHistory();
  // update stats
  await loadStats();
}

// ---------- AI / OpenAI call ----------
async function getAIResponse(userMessage) {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: 'You are a friendly English tutor.' }, { role: 'user', content: userMessage }],
          temperature: 0.7, max_tokens: 200
        })
      });
      const data = await response.json();
      return data.choices && data.choices[0] ? data.choices[0].message.content : "Sorry, no response";
    } catch (err) {
      console.error('OpenAI API error', err);
      return "❌ Lỗi khi gọi OpenAI";
    }
  } else {
    // Demo responses
    return getDemoResponse(userMessage);
  }
}

function getDemoResponse(msg) {
  const l = msg.toLowerCase();
  if (l.includes('hello') || l.includes('hi')) return "Hello! How are you today?";
  if (l.includes('help')) return "I can help you practice English. Tell me about your day.";
  return "That's interesting! Can you tell me more?";
}

// ---------- Stats ----------
async function loadStats() {
  try {
    const res = await fetch(`${CONFIG.backendUrl}/api/stats/${CONFIG.userId}`);
    const result = await res.json();
    if (result.success) {
      document.getElementById('totalChats').textContent = result.data.total_chats || 0;
      document.getElementById('totalMessages').textContent = result.data.total_messages || 0;
      document.getElementById('totalVocab').textContent = result.data.total_vocabulary || 0;
    }
  } catch (err) {
    console.error('loadStats error', err);
  }
}

// ---------- Speech recognition ----------
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    document.getElementById('userInput').value = text;
  };

  recognition.onend = () => {
    isRecording = false;
    document.getElementById('voiceBtn').classList.remove('recording');
  };
}

function toggleVoiceRecognition() {
  if (!recognition) { alert('Trình duyệt không hỗ trợ nhận dạng giọng nói'); return; }
  if (isRecording) { recognition.stop(); } else { recognition.start(); isRecording = true; document.getElementById('voiceBtn').classList.add('recording'); }
}

// ---------- DICTIONARY (IndexedDB + lookups) ----------
function initIDB() {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = function(e) {
    idb = e.target.result;
    if (!idb.objectStoreNames.contains(STORE_VOCAB)) {
      idb.createObjectStore(STORE_VOCAB, { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = function(e) { idb = e.target.result; loadVocabStats(); };
  req.onerror = function(e) { console.error('IDB error', e); };
}

function saveVocab(word) {
  if (!idb || !word) return;
  const tx = idb.transaction(STORE_VOCAB, 'readwrite');
  const store = tx.objectStore(STORE_VOCAB);
  store.add({ word, timestamp: Date.now() });
  tx.oncomplete = () => { renderVocabHistory(); loadVocabStats(); };
}

function getAllVocab(callback) {
  if (!idb) { callback([]); return; }
  const tx = idb.transaction(STORE_VOCAB, 'readonly');
  const store = tx.objectStore(STORE_VOCAB);
  const req = store.getAll();
  req.onsuccess = () => callback(req.result || []);
  req.onerror = () => callback([]);
}

function renderVocabHistory() {
  getAllVocab(list => {
    const box = document.getElementById('historyBox');
    if (!list || list.length === 0) { box.innerHTML = '<div style="color:#777">Chưa có lịch sử.</div>'; return; }
    box.innerHTML = '';
    // newest first
    list.reverse().forEach(it => {
      const d = new Date(it.timestamp);
      const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<div><b>🔤 ${it.word}</b></div><div style="font-size:12px;color:#555">⏱️ ${time}</div>`;
      div.addEventListener('click', () => {
        document.getElementById('dictInput').value = it.word;
        lookupWord();
      });
      box.appendChild(div);
    });
  });
}

function toggleVocabHistory() {
  const box = document.getElementById('historyBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  if (box.style.display === 'block') renderVocabHistory();
}

function loadVocabStats() {
  getAllVocab(list => { document.getElementById('totalVocab').textContent = (new Set((list||[]).map(i => i.word))).size; });
}

// Dictionary lookup (English -> Vietnamese + definition)
async function lookupWord() {
  const word = document.getElementById('dictInput').value.trim();
  if (!word) return;
  saveVocab(word);
  const resultDiv = document.getElementById('dictResult');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '🔍 Đang tra từ...';
  try {
    // dictionaryapi.dev
    let meaning = 'Không tìm thấy nghĩa.';
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const d = await r.json();
      if (Array.isArray(d) && d[0].meanings && d[0].meanings[0] && d[0].meanings[0].definitions[0]) {
        meaning = d[0].meanings[0].definitions[0].definition;
      }
    } catch (e) { console.warn('dictapi error', e); }

    // translation fallback
    let vn = '';
    try {
      const t = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
      const tj = await t.json();
      vn = tj.responseData ? tj.responseData.translatedText : '';
    } catch (e) { vn = ''; }

    resultDiv.innerHTML = `
      <div style="border-bottom:2px solid #667eea;padding-bottom:8px;margin-bottom:8px;"><strong>📖 ${word}</strong></div>
      <div style="margin-bottom:6px;"><strong>🇬🇧 English:</strong> ${meaning}</div>
      <div style="margin-bottom:6px;"><strong>🇻🇳 Vietnamese:</strong> ${vn}</div>
    `;
  } catch (err) {
    resultDiv.innerHTML = '⚠️ Lỗi tra từ';
  }
}

// ---------- Helpers ----------
function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }
function handleDictKeyPress(e) { if (e.key === 'Enter') lookupWord(); }
