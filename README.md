# ProcuCev VoiceScribe 🎙️

**Real-time multilingual Speech-to-Text transcription** web application built for the ProcuCev Tech Hiring Assignment.

---

## ✨ Features

- 🎤 **Real-time transcription** using Web Speech API (free, no keys needed)
- 🌐 **Multilingual support** — Hindi, English, Hinglish (code-switching), Tamil, Telugu, and 8 more Indian languages
- 📊 **Full CRUD dashboard** — Create, Read, Update, Delete transcriptions
- ⭐ **Favorites & tagging** — Organize your transcriptions
- 🔍 **Search & filter** — Find transcriptions instantly
- 📈 **Analytics dashboard** — Stats, word count, language distribution
- 🔴 **Live audio visualizer** — Real-time frequency bar visualizer using Web Audio API
- 🔌 **Socket.IO** — Real-time sync ready for multi-device support
- 💾 **SQLite database** — Zero-config, production-ready with WAL mode

---

## 🛠 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19 + Vite + Vanilla CSS       |
| Backend  | Node.js + Express + Socket.IO       |
| Database | SQLite (Node.js built-in `node:sqlite`) |
| STT      | Web Speech API (browser-native)     |
| Realtime | Socket.IO WebSockets                |

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend (Development)
```bash
cd frontend
npm install
npm run dev
# React app on http://localhost:3000 (proxied to backend)
```

### 3. Production (Frontend built & served by backend)
```bash
cd frontend
npm run build
cd ../backend
npm start
# Visit http://localhost:5000
```

---

## 📡 API Endpoints

| Method   | Endpoint                             | Description              |
|----------|--------------------------------------|--------------------------|
| `GET`    | `/api/transcriptions`                | List all transcriptions  |
| `GET`    | `/api/transcriptions?search=keyword` | Search transcriptions    |
| `GET`    | `/api/transcriptions/:id`            | Get one transcription    |
| `POST`   | `/api/transcriptions`                | Create transcription     |
| `PUT`    | `/api/transcriptions/:id`            | Update transcription     |
| `DELETE` | `/api/transcriptions/:id`            | Delete transcription     |
| `PATCH`  | `/api/transcriptions/:id/favorite`   | Toggle favorite          |
| `GET`    | `/api/transcriptions/stats`          | Get usage statistics     |
| `GET`    | `/api/health`                        | Health check             |

---

## 📁 Project Structure

```
procucev-voicescribe/
├── backend/
│   ├── server.js          # Express + Socket.IO server
│   ├── database.js        # SQLite schema + queries
│   ├── routes/
│   │   └── transcriptions.js  # CRUD REST routes
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css       # Design system
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── TranscribePanel.jsx
    │   │   ├── HistoryPanel.jsx
    │   │   ├── DashboardPanel.jsx
    │   │   ├── MicButton.jsx
    │   │   ├── AudioVisualizer.jsx
    │   │   ├── TranscriptBox.jsx
    │   │   ├── TranscriptionCard.jsx
    │   │   ├── EditModal.jsx
    │   │   ├── ViewModal.jsx
    │   │   └── Toast.jsx
    │   ├── hooks/
    │   │   ├── useSpeechRecognition.js
    │   │   ├── useSocket.js
    │   │   └── useTranscriptions.js
    │   ├── context/
    │   │   └── AppContext.jsx
    │   └── services/
    │       └── api.js
    ├── vite.config.js
    └── index.html
```

---

## 🗣️ Multilingual Support

The app uses the **Web Speech API** which natively supports code-switching in Indian languages. For Hindi + English (Hinglish) mixed speech, select **"🔀 Hindi + English (Bilingual)"** — the browser's speech engine handles the language mixing automatically.

---

## 📜 License

MIT — Built for ProcuCev Tech Assignment 2024.
