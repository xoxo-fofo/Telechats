/**
 * TeleChats Full-Stack Server
 * Express Backend + Vite Middleware + MTProto Telegram Bridge + WebRTC Voice Rooms + SSE Live Events
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { telegramBridge } from './server/telegramBridge.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());

// List of connected SSE response streams for live updates
const sseClients = new Set<Response>();

function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// SSE stream for real-time updates
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Topics
app.get('/api/topics', (req: Request, res: Response) => {
  const topics = db.getTopics();
  res.json({ success: true, topics });
});

// Rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  const { topicPath, search } = req.query;
  let rooms = db.getRooms();

  if (topicPath && typeof topicPath === 'string' && topicPath !== '/') {
    rooms = rooms.filter(r => r.topicPath.startsWith(topicPath));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    rooms = rooms.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.topicPath.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      r.inviteCode.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, rooms });
});

app.get('/api/rooms/:id', (req: Request, res: Response) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  res.json({ success: true, room });
});

app.get('/api/rooms/by-invite/:code', (req: Request, res: Response) => {
  const room = db.getRoomByInvite(req.params.code);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Invalid invite code or room has expired.' });
  }
  res.json({ success: true, room });
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const { title, description, topicPath, rules, tags } = req.body;
  if (!title || !topicPath) {
    return res.status(400).json({ success: false, error: 'Room title and topic path are required.' });
  }

  const user = telegramBridge.getCurrentUser() || {
    id: 'tg-anonymous',
    name: 'TeleChats Member',
    username: 'member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  // Generate clean invite code (e.g. TECH-8823, WEB-1029)
  const segments = topicPath.split('/').filter(Boolean);
  const prefix = (segments[0] || 'ROOM').toUpperCase().slice(0, 4);
  const inviteCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const cleanRules = Array.isArray(rules) && rules.length > 0 ? rules : [
    { id: 'r1', title: 'Be Respectful & Constructive', description: 'Treat every community member with respect. Harassment will result in a kick.' },
    { id: 'r2', title: 'Stay on Topic', description: `Keep messages relevant to ${topicPath}.` }
  ];

  const newRoom = db.createRoom({
    topicPath,
    title,
    description: description || `Community hub for ${topicPath}`,
    rules: cleanRules,
    inviteCode,
    tags: Array.isArray(tags) ? tags : ['telegram', 'community'],
    creator: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar
    }
  });

  broadcastSSE('room:created', newRoom);
  res.json({ success: true, room: newRoom });
});

app.post('/api/rooms/:id/join', (req: Request, res: Response) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  room.memberCount += 1;
  res.json({ success: true, room });
});

// Contacts & Direct Chats (Connecting with official Telegram users)
app.get('/api/contacts', (req: Request, res: Response) => {
  const contacts = db.getContacts();
  res.json({ success: true, contacts });
});

app.post('/api/contacts/search', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.json({ success: true, contacts: db.getContacts() });
  }
  const q = String(query).toLowerCase().replace(/^@/, '');
  const contacts = db.getContacts().filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.username.toLowerCase().includes(q) ||
    c.phone.includes(q)
  );
  res.json({ success: true, contacts });
});

// Messages
app.get('/api/messages/:targetId', (req: Request, res: Response) => {
  const messages = db.getMessages(req.params.targetId);
  res.json({ success: true, messages });
});

app.post('/api/messages/send', (req: Request, res: Response) => {
  const { roomId, text, mediaType, codeSnippet, voiceDurationSeconds } = req.body;
  if (!roomId || (!text && !codeSnippet)) {
    return res.status(400).json({ success: false, error: 'Target room and message content required.' });
  }

  const currentUser = telegramBridge.getCurrentUser() || {
    id: 'tg-user-me',
    name: 'Alex Rivera (You)',
    username: 'alex_telechats',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  const newMessage = db.addMessage({
    roomId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderUsername: currentUser.username,
    senderAvatar: currentUser.avatar,
    isOfficialUser: false,
    text: text || '',
    mediaType: mediaType || 'text',
    codeSnippet,
    voiceDurationSeconds
  });

  broadcastSSE('message:new', newMessage);

  // If this was a direct message to an official Telegram contact, provide a natural response after a short delay!
  if (roomId.startsWith('dm-')) {
    const contactId = roomId.replace('dm-', '');
    const contact = db.getContactById(contactId);
    if (contact) {
      setTimeout(() => {
        let replyText = `Thanks for messaging! Received via Telegram MTProto bridge. We are live on ${contact.username}.`;
        if (text?.toLowerCase().includes('call')) {
          replyText = `I'm ready for the Telegram voice call! Tap the phone icon in the top right to start the WebRTC stream.`;
        } else if (text?.toLowerCase().includes('topic') || text?.toLowerCase().includes('room')) {
          replyText = `Awesome! Did you check the slash path rooms like /tech/programming/web3/smart-contracts? You can create your own anytime!`;
        }

        const replyMsg = db.addMessage({
          roomId,
          senderId: contact.id,
          senderName: contact.name,
          senderUsername: contact.username,
          senderAvatar: contact.avatar,
          isOfficialUser: true,
          text: replyText,
          mediaType: 'text'
        });
        broadcastSSE('message:new', replyMsg);
      }, 1200);
    }
  }

  res.json({ success: true, message: newMessage });
});

app.post('/api/messages/:targetId/reactions', (req: Request, res: Response) => {
  const { messageId, emoji } = req.body;
  const updated = db.toggleReaction(req.params.targetId, messageId, emoji);
  if (updated) {
    broadcastSSE('message:reaction', { targetId: req.params.targetId, message: updated });
  }
  res.json({ success: true, message: updated });
});

// Voice Rooms (WebRTC Signaling & Participant Management)
app.get('/api/voice/room/:roomId', (req: Request, res: Response) => {
  const participants = db.getVoiceParticipants(req.params.roomId);
  res.json({ success: true, participants });
});

app.post('/api/voice/join', (req: Request, res: Response) => {
  const { roomId, role } = req.body;
  const user = telegramBridge.getCurrentUser() || {
    id: 'tg-user-me',
    name: 'Alex Rivera (You)',
    username: 'alex_telechats',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  const participants = db.joinVoice(roomId, {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    isMuted: false,
    isSpeaking: true,
    isScreenSharing: false,
    role: role || 'speaker'
  });

  broadcastSSE('voice:update', { roomId, participants });
  res.json({ success: true, participants });
});

app.post('/api/voice/leave', (req: Request, res: Response) => {
  const { roomId } = req.body;
  const user = telegramBridge.getCurrentUser();
  const userId = user ? user.id : 'tg-user-me';

  const participants = db.leaveVoice(roomId, userId);
  broadcastSSE('voice:update', { roomId, participants });
  res.json({ success: true, participants });
});

app.post('/api/voice/mute', (req: Request, res: Response) => {
  const { roomId, isMuted } = req.body;
  const user = telegramBridge.getCurrentUser();
  const userId = user ? user.id : 'tg-user-me';

  const participants = db.updateVoiceMute(roomId, userId, Boolean(isMuted));
  broadcastSSE('voice:update', { roomId, participants });
  res.json({ success: true, participants });
});

// Telegram MTProto Authentication
app.get('/api/auth/status', (req: Request, res: Response) => {
  const status = telegramBridge.getApiStatus();
  res.json({ success: true, ...status });
});

app.post('/api/auth/send-code', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }

  const result = await telegramBridge.sendCode(phoneNumber);
  res.json(result);
});

app.post('/api/auth/sign-in', async (req: Request, res: Response) => {
  const { phoneNumber, phoneCodeHash, code } = req.body;
  if (!phoneNumber || !code) {
    return res.status(400).json({ success: false, error: 'Phone number and code are required.' });
  }

  const result = await telegramBridge.signIn(phoneNumber, phoneCodeHash || '', code);
  res.json(result);
});

app.post('/api/auth/2fa', async (req: Request, res: Response) => {
  const { password } = req.body;
  const result = await telegramBridge.verify2faPassword(password);
  res.json(result);
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  telegramBridge.logout();
  res.json({ success: true });
});

app.post('/api/auth/quick-demo', (req: Request, res: Response) => {
  const { userKey } = req.body;
  const user = telegramBridge.loginAsDemoUser(userKey || 'alex');
  res.json({ success: true, user });
});

// CI/CD & Build Pipeline Status
app.get('/api/cicd/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    workflows: {
      main: {
        file: '.github/workflows/main-apk-release.yml',
        branch: 'main',
        action: 'Builds & Releases Android Debug APK',
        triggers: ['push to main', 'workflow_dispatch'],
        artifact: 'telechats-debug-apk'
      },
      dev: {
        file: '.github/workflows/dev-apk-preview.yml',
        branch: 'dev',
        action: 'Builds Dev APK & Generates Webview Previews',
        triggers: ['push to dev', 'pull_request to dev', 'workflow_dispatch'],
        artifacts: ['telechats-dev-apk', 'telechats-webview-preview']
      }
    },
    androidConfig: {
      packageName: 'com.telechats.app',
      activity: 'MainActivity.kt',
      minSdk: 24,
      targetSdk: 34,
      features: ['WebRTC Audio / Video', 'MTProto TLS Networking', 'Deep Link telechats.app/join/{code}', 'Background Notifications']
    },
    secretsNeeded: [
      { name: 'TELEGRAM_API_ID', description: 'From my.telegram.org -> API development tools', required: true },
      { name: 'TELEGRAM_API_HASH', description: 'From my.telegram.org -> API development tools', required: true }
    ]
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function setupViteOrStatic() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}

await setupViteOrStatic();

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[TeleChats] Core Bridge Server running on http://0.0.0.0:${PORT}`);
});
