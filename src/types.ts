export interface TopicNode {
  id: string;
  name: string;
  path: string;
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
  inviteLink: string;
  telegramSupergroupId: string;
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
  roomId: string;
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

export interface TelegramUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar: string;
  is2faEnabled: boolean;
  authenticated: boolean;
  dcId?: number;
}

export interface ActiveCallSession {
  targetType: 'room' | 'direct';
  targetId: string;
  targetTitle: string;
  targetAvatar?: string;
  startTime: number;
  status: 'connecting' | 'connected' | 'ended';
  isMuted: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  participants: VoiceParticipant[];
}
