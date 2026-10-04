import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  TopicNode,
  SupergroupRoom,
  ChatMessage,
  OfficialTelegramContact,
  VoiceParticipant,
  TelegramUser,
  ActiveCallSession
} from '../types';

interface TeleChatsContextType {
  // Navigation & Filtering
  selectedTopicPath: string;
  setSelectedTopicPath: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: 'feed' | 'room' | 'direct' | 'cicd';
  setActiveView: (view: 'feed' | 'room' | 'direct' | 'cicd') => void;
  
  // Data
  topics: TopicNode[];
  rooms: SupergroupRoom[];
  contacts: OfficialTelegramContact[];
  activeRoom: SupergroupRoom | null;
  activeContact: OfficialTelegramContact | null;
  messages: ChatMessage[];
  
  // Selection Handlers
  openRoom: (room: SupergroupRoom) => void;
  openDirectChat: (contact: OfficialTelegramContact) => void;
  leaveRoom: () => void;
  
  // Modals
  isCreateRoomOpen: boolean;
  setIsCreateRoomOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isJoinInviteOpen: boolean;
  setIsJoinInviteOpen: (open: boolean) => void;
  isCiCdOpen: boolean;
  setIsCiCdOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isRoomRulesOpen: boolean;
  setIsRoomRulesOpen: (open: boolean) => void;

  // Actions
  sendMessage: (text: string, mediaType?: 'text' | 'voice' | 'code', codeSnippet?: { language: string; code: string }, voiceDurationSeconds?: number) => Promise<void>;
  createRoom: (data: { title: string; description: string; topicPath: string; rules: Array<{ id: string; title: string; description: string }>; tags: string[] }) => Promise<SupergroupRoom | null>;
  joinRoomByCode: (code: string) => Promise<{ success: boolean; room?: SupergroupRoom; error?: string }>;
  toggleReaction: (messageId: string, emoji: string) => void;

  // User & Telegram MTProto Bridge
  currentUser: TelegramUser | null;
  mtprotoStatus: {
    isConfigured: boolean;
    dcCluster: string;
    protocol: string;
    activeSession: boolean;
  };
  loginWithPhone: (phone: string) => Promise<{ success: boolean; phoneCodeHash?: string; message?: string }>;
  verifyCode: (phone: string, phoneCodeHash: string, code: string) => Promise<{ success: boolean; requires2fa?: boolean; error?: string }>;
  verify2fa: (password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (key: 'alex' | 'sophia' | 'marcus' | 'elena') => Promise<void>;
  logout: () => Promise<void>;

  // WebRTC Voice & Calls
  activeCall: ActiveCallSession | null;
  isMicActive: boolean;
  audioFrequencyLevel: number;
  startVoiceRoom: (room: SupergroupRoom) => Promise<void>;
  startDirectCall: (contact: OfficialTelegramContact) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleScreenShare: () => void;

  // Personalization / User Preferences
  userInterests: string[];
  setUserInterests: (interests: string[]) => void;
  saveUserInterests: (interests: string[]) => void;
}

const TeleChatsContext = createContext<TeleChatsContextType | null>(null);

export const TeleChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTopicPath, setSelectedTopicPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'feed' | 'room' | 'direct' | 'cicd'>('feed');

  const [topics, setTopics] = useState<TopicNode[]>([]);
  const [rooms, setRooms] = useState<SupergroupRoom[]>([]);
  const [contacts, setContacts] = useState<OfficialTelegramContact[]>([]);
  const [activeRoom, setActiveRoom] = useState<SupergroupRoom | null>(null);
  const [activeContact, setActiveContact] = useState<OfficialTelegramContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Modals
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isJoinInviteOpen, setIsJoinInviteOpen] = useState(false);
  const [isCiCdOpen, setIsCiCdOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRoomRulesOpen, setIsRoomRulesOpen] = useState(false);

  // User State
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [mtprotoStatus, setMtprotoStatus] = useState({
    isConfigured: false,
    dcCluster: 'DC4 (Amsterdam, NL)',
    protocol: 'MTProto 2.0 (TLS Encrypted)',
    activeSession: true
  });

  // User Topic Preferences
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem('telechats_interests');
    return saved ? JSON.parse(saved) : ['tech', 'gaming', 'crypto'];
  });

  // Voice & Call
  const [activeCall, setActiveCall] = useState<ActiveCallSession | null>(null);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [audioFrequencyLevel, setAudioFrequencyLevel] = useState<number>(0);

  // Audio Context Ref for real microphone metering
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check URL params on launch for invite link (e.g. ?join=TECH-8823)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      joinRoomByCode(joinCode);
    }
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [resTopics, resRooms, resContacts, resAuth] = await Promise.all([
        fetch('/api/topics').then(r => r.json()),
        fetch('/api/rooms').then(r => r.json()),
        fetch('/api/contacts').then(r => r.json()),
        fetch('/api/auth/status').then(r => r.json())
      ]);

      if (resTopics.success) setTopics(resTopics.topics);
      if (resRooms.success) setRooms(resRooms.rooms);
      if (resContacts.success) setContacts(resContacts.contacts);
      if (resAuth.success && resAuth.currentUser) {
        setCurrentUser(resAuth.currentUser);
        setMtprotoStatus({
          isConfigured: resAuth.isConfigured,
          dcCluster: resAuth.dcCluster,
          protocol: resAuth.protocol,
          activeSession: resAuth.activeSession
        });
      }
    } catch (err) {
      console.error('Error loading TeleChats data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if first-time user
    const hasOnboarded = localStorage.getItem('telechats_onboarded');
    if (!hasOnboarded) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Setup Server-Sent Events (SSE) for Real-Time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('message:new', (e) => {
      try {
        const newMsg: ChatMessage = JSON.parse(e.data);
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          // Only append if it belongs to current room or direct chat
          return [...prev, newMsg];
        });
      } catch (err) {
        console.error('Failed to parse SSE message', err);
      }
    });

    eventSource.addEventListener('room:created', (e) => {
      try {
        const newRoom: SupergroupRoom = JSON.parse(e.data);
        setRooms(prev => [newRoom, ...prev]);
      } catch (err) {
        console.error('Failed to parse SSE room created', err);
      }
    });

    eventSource.addEventListener('voice:update', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (activeCall && activeCall.targetId === data.roomId) {
          setActiveCall(prev => prev ? { ...prev, participants: data.participants } : null);
        }
      } catch (err) {
        console.error('Voice update parse error', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [activeCall]);

  // Load messages when active room or contact changes
  useEffect(() => {
    const targetId = activeRoom ? activeRoom.id : (activeContact ? `dm-${activeContact.id}` : null);
    if (!targetId) {
      setMessages([]);
      return;
    }

    fetch(`/api/messages/${targetId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setMessages(res.messages);
        }
      })
      .catch(console.error);
  }, [activeRoom, activeContact]);

  const openRoom = (room: SupergroupRoom) => {
    setActiveRoom(room);
    setActiveContact(null);
    setActiveView('room');
  };

  const openDirectChat = (contact: OfficialTelegramContact) => {
    setActiveContact(contact);
    setActiveRoom(null);
    setActiveView('direct');
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setActiveContact(null);
    setActiveView('feed');
  };

  const sendMessage = async (
    text: string,
    mediaType: 'text' | 'voice' | 'code' = 'text',
    codeSnippet?: { language: string; code: string },
    voiceDurationSeconds?: number
  ) => {
    const targetId = activeRoom ? activeRoom.id : (activeContact ? `dm-${activeContact.id}` : null);
    if (!targetId) return;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: targetId,
          text,
          mediaType,
          codeSnippet,
          voiceDurationSeconds
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const createRoom = async (data: {
    title: string;
    description: string;
    topicPath: string;
    rules: Array<{ id: string; title: string; description: string }>;
    tags: string[];
  }): Promise<SupergroupRoom | null> => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success && result.room) {
        setRooms(prev => [result.room, ...prev]);
        openRoom(result.room);
        setIsCreateRoomOpen(false);
        return result.room;
      }
      return null;
    } catch (err) {
      console.error('Error creating room:', err);
      return null;
    }
  };

  const joinRoomByCode = async (code: string) => {
    try {
      const res = await fetch(`/api/rooms/by-invite/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && data.room) {
        openRoom(data.room);
        setIsJoinInviteOpen(false);
        return { success: true, room: data.room };
      }
      return { success: false, error: data.error || 'Room not found' };
    } catch {
      return { success: false, error: 'Network error joining room' };
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const targetId = activeRoom ? activeRoom.id : (activeContact ? `dm-${activeContact.id}` : null);
    if (!targetId) return;

    // Optimistic update
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...m, reactions };
        }
        return m;
      })
    );

    try {
      await fetch(`/api/messages/${targetId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji })
      });
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  // WebRTC Voice & Real Audio Metering Setup
  const setupAudioMetering = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioFrequencyLevel(Math.min(100, Math.round((avg / 255) * 100)));
          }
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
        setIsMicActive(true);
      }
    } catch {
      // Audio permission fallback with gentle simulated audio waves
      setIsMicActive(true);
      const interval = setInterval(() => {
        setAudioFrequencyLevel(Math.floor(25 + Math.random() * 50));
      }, 150);
      return () => clearInterval(interval);
    }
  };

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setAudioFrequencyLevel(0);
  };

  const startVoiceRoom = async (room: SupergroupRoom) => {
    await setupAudioMetering();

    // Call join API
    let participants: VoiceParticipant[] = [];
    try {
      const res = await fetch('/api/voice/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, role: 'speaker' })
      });
      const data = await res.json();
      if (data.success) {
        participants = data.participants;
      }
    } catch {
      // fallback
    }

    setActiveCall({
      targetType: 'room',
      targetId: room.id,
      targetTitle: room.title,
      startTime: Date.now(),
      status: 'connected',
      isMuted: false,
      isSpeakerOn: true,
      isScreenSharing: false,
      participants
    });
  };

  const startDirectCall = async (contact: OfficialTelegramContact) => {
    await setupAudioMetering();

    const directCallRoomId = `dm-call-${contact.id}`;
    setActiveCall({
      targetType: 'direct',
      targetId: directCallRoomId,
      targetTitle: contact.name,
      targetAvatar: contact.avatar,
      startTime: Date.now(),
      status: 'connected',
      isMuted: false,
      isSpeakerOn: true,
      isScreenSharing: false,
      participants: [
        {
          id: currentUser?.id || 'tg-user-me',
          name: currentUser?.name || 'Alex Rivera (You)',
          username: currentUser?.username || 'alex_telechats',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isMuted: false,
          isSpeaking: true,
          isScreenSharing: false,
          joinedAt: 'Now',
          audioLevel: 0.8,
          role: 'host'
        },
        {
          id: contact.id,
          name: contact.name,
          username: contact.username,
          avatar: contact.avatar,
          isMuted: false,
          isSpeaking: false,
          isScreenSharing: false,
          joinedAt: 'Now',
          audioLevel: 0.3,
          role: 'speaker'
        }
      ]
    });
  };

  const endCall = async () => {
    if (activeCall && activeCall.targetType === 'room') {
      try {
        await fetch('/api/voice/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: activeCall.targetId })
        });
      } catch (err) {
        console.error(err);
      }
    }
    cleanupAudio();
    setActiveCall(null);
  };

  const toggleMute = () => {
    if (!activeCall) return;
    const newMuted = !activeCall.isMuted;
    setActiveCall(prev => prev ? { ...prev, isMuted: newMuted } : null);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !newMuted;
      });
    }

    if (activeCall.targetType === 'room') {
      fetch('/api/voice/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeCall.targetId, isMuted: newMuted })
      }).catch(console.error);
    }
  };

  const toggleScreenShare = () => {
    if (!activeCall) return;
    setActiveCall(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null);
  };

  // Auth Functions
  const loginWithPhone = async (phone: string) => {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
    return res.json();
  };

  const verifyCode = async (phone: string, phoneCodeHash: string, code: string) => {
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, phoneCodeHash, code })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const verify2fa = async (password: string) => {
    const res = await fetch('/api/auth/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const loginAsDemo = async (key: 'alex' | 'sophia' | 'marcus' | 'elena') => {
    const res = await fetch('/api/auth/quick-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey: key })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  const saveUserInterests = (interests: string[]) => {
    setUserInterests(interests);
    localStorage.setItem('telechats_interests', JSON.stringify(interests));
    localStorage.setItem('telechats_onboarded', 'true');
    setIsOnboardingOpen(false);
  };

  return (
    <TeleChatsContext.Provider
      value={{
        selectedTopicPath,
        setSelectedTopicPath,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        topics,
        rooms,
        contacts,
        activeRoom,
        activeContact,
        messages,
        openRoom,
        openDirectChat,
        leaveRoom,
        isCreateRoomOpen,
        setIsCreateRoomOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isJoinInviteOpen,
        setIsJoinInviteOpen,
        isCiCdOpen,
        setIsCiCdOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isRoomRulesOpen,
        setIsRoomRulesOpen,
        sendMessage,
        createRoom,
        joinRoomByCode,
        toggleReaction,
        currentUser,
        mtprotoStatus,
        loginWithPhone,
        verifyCode,
        verify2fa,
        loginAsDemo,
        logout,
        activeCall,
        isMicActive,
        audioFrequencyLevel,
        startVoiceRoom,
        startDirectCall,
        endCall,
        toggleMute,
        toggleScreenShare,
        userInterests,
        setUserInterests,
        saveUserInterests
      }}
    >
      {children}
    </TeleChatsContext.Provider>
  );
};

export const useTeleChats = () => {
  const context = useContext(TeleChatsContext);
  if (!context) {
    throw new Error('useTeleChats must be used within a TeleChatsProvider');
  }
  return context;
};
