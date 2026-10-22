require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/transcriptions', require('./routes/transcriptions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'ProcuCev Speech-to-Text API'
  });
});

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Socket.IO – Real-time Transcription Events ───────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Client sends live transcript chunk
  socket.on('transcript:chunk', (data) => {
    // Broadcast to all OTHER clients (multi-device sync)
    socket.broadcast.emit('transcript:chunk', data);
  });

  // Client sends final transcript
  socket.on('transcript:final', (data) => {
    io.emit('transcript:final', { ...data, socketId: socket.id });
    console.log(`📝 Final transcript received from ${socket.id}: "${data.text?.substring(0, 60)}..."`);
  });

  // Client starts recording session
  socket.on('session:start', (data) => {
    socket.join(`session:${socket.id}`);
    socket.broadcast.emit('session:started', { socketId: socket.id, ...data });
    console.log(`🎙️ Recording started by ${socket.id}`);
  });

  // Client stops recording
  socket.on('session:stop', (data) => {
    socket.broadcast.emit('session:stopped', { socketId: socket.id, ...data });
    console.log(`⏹️ Recording stopped by ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    socket.broadcast.emit('session:stopped', { socketId: socket.id });
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
initializeDatabase();

server.listen(PORT, () => {
  console.log(`\n🚀 ProcuCev Speech-to-Text Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   API Base:   http://localhost:${PORT}/api`);
  console.log(`   Health:     http://localhost:${PORT}/api/health\n`);
});

module.exports = { app, server, io };
