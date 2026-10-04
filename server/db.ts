/**
 * TeleChats Database & In-Memory Store
 * Manages hierarchical topic slash paths, Telegram supergroups, room rules,
 * direct messages, official contacts, and WebRTC voice sessions.
 */

export interface TopicNode {
  id: string;
  name: string;
  path: string; // e.g. /tech/programming/web3/smart-contracts
  description: string;
  roomCount: number;
  icon?: string;
  parentPath?: string;
}

export interface RoomRule {
  id: string;
  title: string;
  description: string;
}

export interface SupergroupRoom {
  id: string;
  topicPath: string; // e.g. /tech/programming/web3/smart-contracts
  title: string;
  description: string;
  rules: RoomRule[];
  inviteCode: string; // e.g. TECH-8823
  inviteLink: string; // telechats.app/join/TECH-8823
  telegramSupergroupId: string; // e.g. -1001893481234
  telegramChatLink?: string;
  memberCount: number;
  isVoiceActive: boolean;
  voiceParticipantsCount: number;
  tags: string[];
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  lastActivity: string;
  pinnedMessageId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; // can be room id or direct message thread id
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  isOfficialUser?: boolean;
  text: string;
  mediaType?: 'text' | 'voice' | 'code' | 'image';
  mediaUrl?: string;
  voiceDurationSeconds?: number;
  codeSnippet?: {
    language: string;
    code: string;
  };
  timestamp: string;
  reactions: Record<string, number>;
  isPinned?: boolean;
}

export interface OfficialTelegramContact {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar: string;
  bio: string;
  status: 'online' | 'recently' | 'offline';
  verified: boolean;
  lastSeen?: string;
}

export interface VoiceParticipant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  audioLevel: number;
  role: 'host' | 'speaker' | 'listener';
}

// Initial Topics Seed
export const INITIAL_TOPICS: TopicNode[] = [
  { id: 'tech', name: 'Tech', path: '/tech', description: 'Computing, software, artificial intelligence and engineering', roomCount: 14, icon: 'Cpu' },
  { id: 'tech-prog', name: 'Programming', path: '/tech/programming', parentPath: '/tech', description: 'Languages, frameworks, architecture, and developer tooling', roomCount: 8, icon: 'Code' },
  { id: 'tech-prog-web3', name: 'Web3', path: '/tech/programming/web3', parentPath: '/tech/programming', description: 'Decentralized systems, smart contracts, and blockchain protocols', roomCount: 4, icon: 'Blocks' },
  { id: 'tech-prog-web3-sc', name: 'Smart Contracts', path: '/tech/programming/web3/smart-contracts', parentPath: '/tech/programming/web3', description: 'Solidity, Rust, Cairo, auditing, and gas optimizations', roomCount: 2, icon: 'ShieldCheck' },
  { id: 'tech-ai', name: 'AI & Machine Learning', path: '/tech/ai', parentPath: '/tech', description: 'LLMs, neural networks, inference engines, and robotics', roomCount: 5, icon: 'Sparkles' },
  { id: 'tech-ai-llm', name: 'LLM Engineering', path: '/tech/ai/llm-engineering', parentPath: '/tech/ai', description: 'Prompt engineering, RAG, agent orchestration, and fine-tuning', roomCount: 3, icon: 'Bot' },
  { id: 'tech-hardware', name: 'Hardware', path: '/tech/hardware', parentPath: '/tech', description: 'Semiconductors, GPUs, microcontrollers, and RISC-V', roomCount: 2, icon: 'Server' },
  
  { id: 'gaming', name: 'Gaming', path: '/gaming', description: 'Esports, competitive titles, game design, and modding', roomCount: 9, icon: 'Gamepad2' },
  { id: 'gaming-esports', name: 'Esports', path: '/gaming/esports', parentPath: '/gaming', description: 'Competitive tourneys, scrims, and player discussions', roomCount: 4, icon: 'Trophy' },
  { id: 'gaming-esports-val', name: 'Valorant', path: '/gaming/esports/valorant', parentPath: '/gaming/esports', description: 'Ranked matches, agent lineups, and VCT tournament chat', roomCount: 2, icon: 'Crosshair' },

  { id: 'crypto', name: 'Crypto & DeFi', path: '/crypto', description: 'Decentralized finance, market dynamics, and Layer 2s', roomCount: 7, icon: 'Coins' },
  { id: 'crypto-defi', name: 'DeFi', path: '/crypto/defi', parentPath: '/crypto', description: 'Liquidity pools, yield strategies, and cross-chain bridges', roomCount: 4, icon: 'TrendingUp' },
  { id: 'crypto-defi-arb', name: 'Arbitrage', path: '/crypto/defi/arbitrage', parentPath: '/crypto/defi', description: 'MEV bots, DEX arbitrage, and flash loans', roomCount: 2, icon: 'Zap' },

  { id: 'movies', name: 'Movies & Cinema', path: '/movies', description: 'Film critique, cinephile lounges, and streaming', roomCount: 6, icon: 'Film' },
  { id: 'movies-hollywood', name: 'Hollywood', path: '/movies/hollywood', parentPath: '/movies', description: 'Major theatrical releases, blockbusters, and industry news', roomCount: 3, icon: 'Clapperboard' },
  { id: 'movies-hollywood-scifi', name: 'Sci-Fi', path: '/movies/hollywood/sci-fi', parentPath: '/movies/hollywood', description: 'Dune, Interstellar, Cyberpunk, and speculative cinema', roomCount: 2, icon: 'Rocket' },

  { id: 'startups', name: 'Startups & Ventures', path: '/startups', description: 'Bootstrapping, fundraising, indie hackers, and product launches', roomCount: 5, icon: 'Rocket' },
  { id: 'startups-founders', name: 'Founders', path: '/startups/founders', parentPath: '/startups', description: 'Founder war stories, pitch deck reviews, and co-founder matching', roomCount: 3, icon: 'Users' },
  { id: 'startups-founders-raise', name: 'Fundraising', path: '/startups/founders/fundraising', parentPath: '/startups/founders', description: 'Venture capital, angel syndicates, SAFE notes, and demos', roomCount: 2, icon: 'DollarSign' },

  { id: 'design', name: 'Design & UX', path: '/design', description: 'Interface systems, motion design, typography, and product design', roomCount: 4, icon: 'Palette' },
  { id: 'design-mobile', name: 'Mobile Systems', path: '/design/ui-ux/mobile-systems', parentPath: '/design', description: 'Android Material You, iOS HIG, micro-interactions, and responsive layout', roomCount: 2, icon: 'Smartphone' },

  { id: 'music', name: 'Music & Production', path: '/music', description: 'Electronic, synthwave, audio workstations, and sound design', roomCount: 4, icon: 'Music' }
];

// Initial Supergroups Seed
export const INITIAL_ROOMS: SupergroupRoom[] = [
  {
    id: 'room-smart-contracts',
    topicPath: '/tech/programming/web3/smart-contracts',
    title: 'Smart Contracts Security & Auditing Hub',
    description: 'Deep dive into EVM bytecode, re-entrancy vectors, foundry test harnesses, and gas optimizations for production deployments.',
    rules: [
      { id: 'r1', title: 'Verify Proofs Before Sharing', description: 'All vulnerability claims must include reproducible Foundry or Hardhat test cases.' },
      { id: 'r2', title: 'Zero Unsolicited DMs', description: 'Never DM users offering investment deals or unverified smart contract audits.' },
      { id: 'r3', title: 'No Pirated Code', description: 'Share open-source and audited repositories with appropriate license disclosures.' }
    ],
    inviteCode: 'TECH-8823',
    inviteLink: 'https://telechats.app/join/TECH-8823',
    telegramSupergroupId: '-1001948271891',
    telegramChatLink: 'https://t.me/TeleChats_SmartContracts',
    memberCount: 3420,
    isVoiceActive: true,
    voiceParticipantsCount: 8,
    tags: ['solidity', 'foundry', 'audit', 'evm', 'security'],
    creator: {
      id: 'tg-alex-dev',
      name: 'Alex Rivera',
      username: 'alex_telegram',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-08-14T10:00:00Z',
    lastActivity: 'Just now'
  },
  {
    id: 'room-llm-engineering',
    topicPath: '/tech/ai/llm-engineering',
    title: 'LLM Agents & Multi-Agent Swarms',
    description: 'Production patterns for autonomous agent loops, context compression, tool calling latency, and local model inference with llama.cpp/Ollama.',
    rules: [
      { id: 'r1', title: 'High Signal Discussions Only', description: 'Ground questions with system prompts, latency benchmarks, or architecture diagrams.' },
      { id: 'r2', title: 'Respect Model Compute Limits', description: 'Do not flood the room with raw token outputs or unformatted JSON.' }
    ],
    inviteCode: 'AI-4091',
    inviteLink: 'https://telechats.app/join/AI-4091',
    telegramSupergroupId: '-1001859384910',
    telegramChatLink: 'https://t.me/TeleChats_LLMEngineering',
    memberCount: 5120,
    isVoiceActive: true,
    voiceParticipantsCount: 14,
    tags: ['agents', 'rag', 'llm', 'inference', 'python'],
    creator: {
      id: 'tg-marcus-ai',
      name: 'Marcus Sterling',
      username: 'marcus_ai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-01T12:00:00Z',
    lastActivity: '2m ago'
  },
  {
    id: 'room-valorant-ranked',
    topicPath: '/gaming/esports/valorant',
    title: 'VCT Strategy & Radiant Scrims Lounge',
    description: 'Agent comp breakdowns, Viper/Omen smoke executes, VCT Masters watch parties, and 5-stack Radiant coordination.',
    rules: [
      { id: 'r1', title: 'Zero Toxicity', description: 'Constructive comms only. Flaming or bad-mannered behavior triggers instant timeout.' },
      { id: 'r2', title: 'Mic Required in Voice Rooms', description: 'Join the voice channel with a clear headset mic and push-to-talk enabled.' }
    ],
    inviteCode: 'VAL-7712',
    inviteLink: 'https://telechats.app/join/VAL-7712',
    telegramSupergroupId: '-1002019482103',
    telegramChatLink: 'https://t.me/TeleChats_ValorantScrims',
    memberCount: 2840,
    isVoiceActive: true,
    voiceParticipantsCount: 5,
    tags: ['valorant', 'vct', 'esports', 'scrims', 'radiant'],
    creator: {
      id: 'tg-sophia-chen',
      name: 'Sophia Chen',
      username: 'sophia_web3',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-10T14:30:00Z',
    lastActivity: '5m ago'
  },
  {
    id: 'room-defi-arbitrage',
    topicPath: '/crypto/defi/arbitrage',
    title: 'MEV Searchers & Flash Arbitrage',
    description: 'Flash loan liquidity routing, private mempool bundling, Builder/Relay latency optimizations, and cross-DEX spreads.',
    rules: [
      { id: 'r1', title: 'No Shill Tokens', description: 'Zero pump-and-dump or unvetted meme coin promotion.' },
      { id: 'r2', title: 'Simulate First', description: 'Always verify tenderly fork simulations before discussing live arbitrage transactions.' }
    ],
    inviteCode: 'DEFI-9021',
    inviteLink: 'https://telechats.app/join/DEFI-9021',
    telegramSupergroupId: '-1001748291039',
    memberCount: 1980,
    isVoiceActive: false,
    voiceParticipantsCount: 0,
    tags: ['mev', 'defi', 'arbitrage', 'flashloans', 'ethereum'],
    creator: {
      id: 'tg-alex-dev',
      name: 'Alex Rivera',
      username: 'alex_telegram',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-15T08:00:00Z',
    lastActivity: '12m ago'
  },
  {
    id: 'room-founders-fundraising',
    topicPath: '/startups/founders/fundraising',
    title: 'Seed & Series A Founders Syndicate',
    description: 'Term sheet breakdowns, safe conversion math, investor warm intros, and real feedback on live pitch decks.',
    rules: [
      { id: 'r1', title: 'Strict Confidentiality', description: 'What is shared in the deck review channel stays in TeleChats.' },
      { id: 'r2', title: 'No Cold Pitch Spam', description: 'Ask before sending pitch decks; share context and specific questions.' }
    ],
    inviteCode: 'VC-3304',
    inviteLink: 'https://telechats.app/join/VC-3304',
    telegramSupergroupId: '-1001889271104',
    memberCount: 1650,
    isVoiceActive: true,
    voiceParticipantsCount: 6,
    tags: ['seed', 'series-a', 'founders', 'fundraising', 'venture'],
    creator: {
      id: 'tg-elena-ux',
      name: 'Elena Rostova',
      username: 'elena_ux',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-20T16:00:00Z',
    lastActivity: '18m ago'
  },
  {
    id: 'room-scifi-cinema',
    topicPath: '/movies/hollywood/sci-fi',
    title: 'Hard Sci-Fi & Speculative Cinema Lounge',
    description: 'Philosophy of Denis Villeneuve, Christopher Nolan, cyberpunk worldbuilding, practical FX, and IMAX screenings.',
    rules: [
      { id: 'r1', title: 'Mandatory Spoiler Tags', description: 'Use spoiler masking for movies released within the last 30 days.' }
    ],
    inviteCode: 'FILM-5520',
    inviteLink: 'https://telechats.app/join/FILM-5520',
    telegramSupergroupId: '-1001992019482',
    memberCount: 2210,
    isVoiceActive: false,
    voiceParticipantsCount: 0,
    tags: ['sci-fi', 'cinema', 'imax', 'hollywood', 'dune'],
    creator: {
      id: 'tg-pavel-tech',
      name: 'Pavel Durov (Tech)',
      username: 'pavel_tech',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-22T20:00:00Z',
    lastActivity: '30m ago'
  }
];

// Official Telegram Contacts
export const OFFICIAL_CONTACTS: OfficialTelegramContact[] = [
  {
    id: 'tg-alex-dev',
    name: 'Alex Rivera',
    username: 'alex_telegram',
    phone: '+1 415 889 0192',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Core MTProto engineer & WebRTC audio systems lead @ TeleChats',
    status: 'online',
    verified: true
  },
  {
    id: 'tg-sophia-chen',
    name: 'Sophia Chen',
    username: 'sophia_web3',
    phone: '+44 7911 123456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Decentralized systems researcher | Solidity auditor | Valorant Immortal',
    status: 'online',
    verified: true
  },
  {
    id: 'tg-marcus-ai',
    name: 'Marcus Sterling',
    username: 'marcus_ai',
    phone: '+1 650 928 3311',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Building AI agent collectives and low-latency voice streaming bridges',
    status: 'online',
    verified: true
  },
  {
    id: 'tg-elena-ux',
    name: 'Elena Rostova',
    username: 'elena_ux',
    phone: '+49 30 901820',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Product Designer for Android & Telegram Webview experiences',
    status: 'recently',
    verified: true
  },
  {
    id: 'tg-pavel-tech',
    name: 'Pavel Durov (Tech)',
    username: 'pavel_tech',
    phone: '+971 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Decentralization, high-speed encrypted protocols, and open internet',
    status: 'online',
    verified: true
  }
];

// Initial Seed Messages
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'room-smart-contracts': [
    {
      id: 'msg-sc-1',
      roomId: 'room-smart-contracts',
      senderId: 'tg-alex-dev',
      senderName: 'Alex Rivera',
      senderUsername: 'alex_telegram',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Welcome to the Smart Contracts Security Hub! Notice the slash topic routing: /tech/programming/web3/smart-contracts. All room creations here auto-provision a Telegram Supergroup via MTProto!',
      timestamp: '10:14 AM',
      reactions: { '🔥': 8, '🛡️': 12 },
      isPinned: true
    },
    {
      id: 'msg-sc-2',
      roomId: 'room-smart-contracts',
      senderId: 'tg-sophia-chen',
      senderName: 'Sophia Chen',
      senderUsername: 'sophia_web3',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Here is the gas-optimized assembly re-entrancy guard we tested with Foundry fuzzing. Saves ~2,100 gas on every state transition:',
      mediaType: 'code',
      codeSnippet: {
        language: 'solidity',
        code: `assembly {
    // Custom 1-slot transient reentrancy guard
    if tload(0) { revert(0, 0) }
    tstore(0, 1)
}`
      },
      timestamp: '10:16 AM',
      reactions: { '⚡': 15, '👏': 9 }
    },
    {
      id: 'msg-sc-3',
      roomId: 'room-smart-contracts',
      senderId: 'tg-marcus-ai',
      senderName: 'Marcus Sterling',
      senderUsername: 'marcus_ai',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Voice room is live right now! Tap the "Join Voice" button above to jump on the WebRTC voice stream and talk about Cancun EIP-1153 opcode benchmarks.',
      timestamp: '10:20 AM',
      reactions: { '🎙️': 7 }
    }
  ],
  'room-llm-engineering': [
    {
      id: 'msg-llm-1',
      roomId: 'room-llm-engineering',
      senderId: 'tg-marcus-ai',
      senderName: 'Marcus Sterling',
      senderUsername: 'marcus_ai',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Topic: /tech/ai/llm-engineering. We are testing streaming speculative decoding over the GramJS MTProto bridge. Latency drops from 480ms to 92ms TTFT.',
      timestamp: '11:05 AM',
      reactions: { '🚀': 14, '🧠': 11 }
    }
  ],
  'room-valorant-ranked': [
    {
      id: 'msg-val-1',
      roomId: 'room-valorant-ranked',
      senderId: 'tg-sophia-chen',
      senderName: 'Sophia Chen',
      senderUsername: 'sophia_web3',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'LF2 for Radiant 5-stack scrims tonight! Have Discord or use our integrated TeleChats WebRTC voice room.',
      timestamp: '01:22 PM',
      reactions: { '🎯': 9, '🏆': 6 }
    }
  ],
  // Direct messages with Alex Rivera
  'dm-tg-alex-dev': [
    {
      id: 'dm-1',
      roomId: 'dm-tg-alex-dev',
      senderId: 'tg-alex-dev',
      senderName: 'Alex Rivera',
      senderUsername: 'alex_telegram',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Hey! Glad you are testing TeleChats. You can message me directly here, or tap the Voice Call icon in the top right to start a 1-on-1 Telegram call with WebRTC audio!',
      timestamp: '09:30 AM',
      reactions: { '👋': 1 }
    },
    {
      id: 'dm-2',
      roomId: 'dm-tg-alex-dev',
      senderId: 'tg-alex-dev',
      senderName: 'Alex Rivera',
      senderUsername: 'alex_telegram',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Also make sure to check the Android CI/CD tab in the top header. It generates the exact GitHub Actions workflow for building the Debug APK on `main` branch and Dev APK on `dev` branch.',
      timestamp: '09:31 AM',
      reactions: { '🚀': 2 }
    }
  ],
  // Direct messages with Sophia Chen
  'dm-tg-sophia-chen': [
    {
      id: 'dm-sc-1',
      roomId: 'dm-tg-sophia-chen',
      senderId: 'tg-sophia-chen',
      senderName: 'Sophia Chen',
      senderUsername: 'sophia_web3',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isOfficialUser: true,
      text: 'Hi there! If you want to create a new chatroom under any nested slash path (like `/tech/hardware` or `/gaming/esports`), just click "+ Create Room". It will auto-generate invite codes and custom rules!',
      timestamp: '11:15 AM',
      reactions: { '✨': 3 }
    }
  ]
};

// In-Memory Database Controller
class DatabaseStore {
  private topics: TopicNode[] = [...INITIAL_TOPICS];
  private rooms: SupergroupRoom[] = [...INITIAL_ROOMS];
  private contacts: OfficialTelegramContact[] = [...OFFICIAL_CONTACTS];
  private messages: Record<string, ChatMessage[]> = { ...INITIAL_MESSAGES };
  private voiceParticipants: Record<string, VoiceParticipant[]> = {
    'room-smart-contracts': [
      {
        id: 'tg-alex-dev',
        name: 'Alex Rivera',
        username: 'alex_telegram',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isMuted: false,
        isSpeaking: true,
        isScreenSharing: false,
        joinedAt: '10:00 AM',
        audioLevel: 0.78,
        role: 'host'
      },
      {
        id: 'tg-sophia-chen',
        name: 'Sophia Chen',
        username: 'sophia_web3',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        isMuted: false,
        isSpeaking: false,
        isScreenSharing: false,
        joinedAt: '10:05 AM',
        audioLevel: 0.12,
        role: 'speaker'
      },
      {
        id: 'tg-marcus-ai',
        name: 'Marcus Sterling',
        username: 'marcus_ai',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isMuted: true,
        isSpeaking: false,
        isScreenSharing: false,
        joinedAt: '10:12 AM',
        audioLevel: 0.0,
        role: 'listener'
      }
    ]
  };

  public getTopics(): TopicNode[] {
    return this.topics;
  }

  public getRooms(): SupergroupRoom[] {
    return this.rooms;
  }

  public getRoomById(id: string): SupergroupRoom | undefined {
    return this.rooms.find(r => r.id === id);
  }

  public getRoomByInvite(code: string): SupergroupRoom | undefined {
    const clean = code.trim().toUpperCase();
    return this.rooms.find(r => r.inviteCode.toUpperCase() === clean);
  }

  public createRoom(room: Omit<SupergroupRoom, 'id' | 'inviteLink' | 'telegramSupergroupId' | 'memberCount' | 'isVoiceActive' | 'voiceParticipantsCount' | 'createdAt' | 'lastActivity'>): SupergroupRoom {
    const id = `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const telegramSupergroupId = `-100${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const fullRoom: SupergroupRoom = {
      ...room,
      id,
      inviteLink: `https://telechats.app/join/${room.inviteCode}`,
      telegramSupergroupId,
      telegramChatLink: `https://t.me/TeleChats_${room.inviteCode}`,
      memberCount: 1,
      isVoiceActive: false,
      voiceParticipantsCount: 0,
      createdAt: new Date().toISOString(),
      lastActivity: 'Just now'
    };

    this.rooms.unshift(fullRoom);

    // Update topic room counts
    const topic = this.topics.find(t => t.path === room.topicPath);
    if (topic) {
      topic.roomCount += 1;
    } else {
      // Create new subtopic if it doesn't exist
      const segments = room.topicPath.split('/').filter(Boolean);
      const name = segments[segments.length - 1] || 'Topic';
      this.topics.push({
        id: `topic-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        path: room.topicPath,
        description: `Custom topic for ${name}`,
        roomCount: 1,
        icon: 'Folder'
      });
    }

    // Initialize messages
    this.messages[id] = [
      {
        id: `msg-welcome-${id}`,
        roomId: id,
        senderId: room.creator.id,
        senderName: room.creator.name,
        senderUsername: room.creator.username,
        senderAvatar: room.creator.avatar,
        text: `Welcome to ${room.title}! This room was created on path ${room.topicPath} with native Telegram Supergroup ID ${telegramSupergroupId}. Rules are pinned above.`,
        timestamp: 'Just now',
        reactions: { '🎉': 1 }
      }
    ];

    return fullRoom;
  }

  public getContacts(): OfficialTelegramContact[] {
    return this.contacts;
  }

  public getContactById(id: string): OfficialTelegramContact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  public getMessages(targetId: string): ChatMessage[] {
    return this.messages[targetId] || [];
  }

  public addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'reactions'>): ChatMessage {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullMsg: ChatMessage = {
      ...msg,
      id,
      timestamp,
      reactions: {}
    };

    if (!this.messages[msg.roomId]) {
      this.messages[msg.roomId] = [];
    }
    this.messages[msg.roomId].push(fullMsg);

    // Update room activity
    const room = this.rooms.find(r => r.id === msg.roomId);
    if (room) {
      room.lastActivity = 'Just now';
    }

    return fullMsg;
  }

  public toggleReaction(targetId: string, messageId: string, emoji: string): ChatMessage | undefined {
    const list = this.messages[targetId];
    if (!list) return undefined;
    const msg = list.find(m => m.id === messageId);
    if (!msg) return undefined;
    if (!msg.reactions) msg.reactions = {};
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
    return msg;
  }

  public getVoiceParticipants(roomId: string): VoiceParticipant[] {
    return this.voiceParticipants[roomId] || [];
  }

  public joinVoice(roomId: string, participant: Omit<VoiceParticipant, 'joinedAt' | 'audioLevel'>): VoiceParticipant[] {
    if (!this.voiceParticipants[roomId]) {
      this.voiceParticipants[roomId] = [];
    }
    // Remove if already in
    this.voiceParticipants[roomId] = this.voiceParticipants[roomId].filter(p => p.id !== participant.id);
    const newP: VoiceParticipant = {
      ...participant,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioLevel: 0.4
    };
    this.voiceParticipants[roomId].push(newP);

    // Update room state
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.isVoiceActive = true;
      room.voiceParticipantsCount = this.voiceParticipants[roomId].length;
    }

    return this.voiceParticipants[roomId];
  }

  public leaveVoice(roomId: string, participantId: string): VoiceParticipant[] {
    if (!this.voiceParticipants[roomId]) return [];
    this.voiceParticipants[roomId] = this.voiceParticipants[roomId].filter(p => p.id !== participantId);

    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.voiceParticipantsCount = this.voiceParticipants[roomId].length;
      if (room.voiceParticipantsCount === 0) {
        room.isVoiceActive = false;
      }
    }

    return this.voiceParticipants[roomId];
  }

  public updateVoiceMute(roomId: string, participantId: string, isMuted: boolean): VoiceParticipant[] {
    const list = this.voiceParticipants[roomId];
    if (!list) return [];
    const p = list.find(item => item.id === participantId);
    if (p) {
      p.isMuted = isMuted;
    }
    return list;
  }
}

export const db = new DatabaseStore();
