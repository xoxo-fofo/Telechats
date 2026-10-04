import React, { useState, useRef, useEffect } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  Send,
  Mic,
  Code,
  Square,
  Play,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export const DirectMessagesView: React.FC = () => {
  const {
    activeContact,
    leaveRoom,
    messages,
    sendMessage,
    startDirectCall,
    currentUser,
    toggleReaction
  } = useTeleChats();

  const [inputVal, setInputVal] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const voiceTimerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceDuration(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  if (!activeContact) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    const textToSend = inputVal;
    setInputVal('');
    await sendMessage(textToSend, 'text');
  };

  const handleStopAndSendVoice = async () => {
    setIsRecordingVoice(false);
    const duration = Math.max(1, voiceDuration);
    await sendMessage(`Voice Note (${duration}s)`, 'voice', undefined, duration);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e1621] overflow-hidden">
      {/* Header */}
      <div className="h-16 px-4 bg-[#17212b] border-b border-[#242f3d] flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={leaveRoom}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
            title="Back to topics"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-10 h-10 rounded-full object-cover border border-[#242f3d]"
            />
            <div
              className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 border-2 border-[#17212b] ${
                activeContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                {activeContact.name}
              </h2>
              {activeContact.verified && (
                <CheckCircle2 className="w-4 h-4 text-[#5288c1] shrink-0" />
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono truncate">
              @{activeContact.username} · {activeContact.phone}
            </div>
          </div>
        </div>

        {/* 1-on-1 Call Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => startDirectCall(activeContact)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            title={`Start Telegram Voice Call with ${activeContact.name}`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Voice Call</span>
          </button>
        </div>
      </div>

      {/* Contact Profile Sub-bar */}
      <div className="bg-[#17212b]/80 border-b border-[#242f3d] px-4 py-2 text-xs text-slate-300 flex items-center justify-between">
        <div className="truncate text-slate-400">
          <span className="text-slate-300 font-medium mr-1.5">Bio:</span>
          {activeContact.bio}
        </div>
        <div className="text-[11px] text-emerald-400 shrink-0 ml-2 font-mono">
          MTProto End-to-End Encrypted
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 group max-w-xl ${
                isMe ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#242f3d]"
              />

              <div className={`space-y-1 min-w-0 ${isMe ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-2 text-xs ${isMe ? 'justify-end' : ''}`}>
                  <span className="font-medium text-slate-200">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#2b5278] text-white rounded-tr-xs'
                      : 'bg-[#17212b] text-slate-100 rounded-tl-xs border border-[#242f3d]'
                  }`}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Voice Note */}
                  {msg.mediaType === 'voice' && (
                    <div className="mt-2 flex items-center gap-2 bg-[#0e1621]/60 px-3 py-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#5288c1] flex items-center justify-center text-white shrink-0">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-[#242f3d] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-3/4" />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          0:0{msg.voiceDurationSeconds || 5} / Telegram Voice Message
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reactions */}
                <div className={`flex items-center gap-1.5 pt-0.5 ${isMe ? 'justify-end' : ''}`}>
                  {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className="px-2 py-0.5 bg-[#17212b] hover:bg-[#242f3d] rounded-full text-xs text-slate-300 flex items-center gap-1 border border-[#242f3d]"
                    >
                      <span>{emoji}</span>
                      <span className="text-[10px] font-mono text-slate-400">{count}</span>
                    </button>
                  ))}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {['❤️', '👍', '🔥'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className="p-1 hover:bg-[#242f3d] rounded text-xs transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Direct Composer */}
      <div className="p-3 sm:p-4 bg-[#17212b] border-t border-[#242f3d] shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between bg-red-950/40 border border-red-500/40 px-3 py-2 rounded-xl text-xs text-red-200 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Recording Voice Message: 0:0{voiceDuration}</span>
              </div>
              <button
                type="button"
                onClick={handleStopAndSendVoice}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium flex items-center gap-1"
              >
                <Square className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Message ${activeContact.name}...`}
              className="flex-1 bg-[#0e1621] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 border border-[#242f3d] focus:outline-none focus:border-[#5288c1] transition-colors"
            />
          )}

          {!isRecordingVoice && (
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-[#242f3d] rounded-lg transition-colors"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 bg-[#2b5278] hover:bg-[#346595] disabled:opacity-40 disabled:hover:bg-[#2b5278] text-white rounded-xl transition-colors shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
