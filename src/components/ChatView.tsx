import React, { useState, useRef, useEffect } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  ArrowLeft,
  Users,
  Volume2,
  Shield,
  Copy,
  Check,
  Send,
  Code,
  Mic,
  Smile,
  ExternalLink,
  Pin,
  ChevronDown,
  Info,
  Radio,
  Play,
  Square
} from 'lucide-react';
import { ChatMessage } from '../types';

export const ChatView: React.FC = () => {
  const {
    activeRoom,
    leaveRoom,
    messages,
    sendMessage,
    toggleReaction,
    startVoiceRoom,
    currentUser,
    setIsRoomRulesOpen
  } = useTeleChats();

  const [inputVal, setInputVal] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRulesBanner, setShowRulesBanner] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const voiceTimerRef = useRef<any>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice note timer
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

  if (!activeRoom) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (showCodeInput && codeSnippet.trim()) {
      await sendMessage(inputVal.trim() || 'Code Snippet:', 'code', {
        language: codeLanguage,
        code: codeSnippet
      });
      setCodeSnippet('');
      setShowCodeInput(false);
      setInputVal('');
      return;
    }

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

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://telechats.app/join/${activeRoom.inviteCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e1621] overflow-hidden">
      {/* Room Header */}
      <div className="h-16 px-4 bg-[#17212b] border-b border-[#242f3d] flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={leaveRoom}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
            title="Back to topics"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                {activeRoom.title}
              </h2>
              {/* Telegram MTProto Supergroup Link */}
              {activeRoom.telegramChatLink && (
                <a
                  href={activeRoom.telegramChatLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-[#5288c1] transition-colors"
                  title="Open native Telegram Supergroup"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Quiet Unboxed Metadata: Slash path · Members · Rules */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
              <span className="text-[#5288c1]">{activeRoom.topicPath}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-sans text-slate-300">{activeRoom.memberCount.toLocaleString()} members</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <button
                onClick={() => setIsRoomRulesOpen(true)}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-sans underline"
              >
                <Shield className="w-3 h-3 text-sky-400" />
                <span>{activeRoom.rules.length} Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Room Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Join Voice Room Button */}
          <button
            onClick={() => startVoiceRoom(activeRoom)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeRoom.isVoiceActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40 animate-pulse'
                : 'bg-[#2b5278] hover:bg-[#346595] text-white'
            }`}
            title="Join or start WebRTC Voice stream"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice</span>
            {activeRoom.voiceParticipantsCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {activeRoom.voiceParticipantsCount}
              </span>
            )}
          </button>

          {/* Copy Invite Code */}
          <button
            onClick={copyInviteLink}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Copy Invite Link"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden md:inline">{activeRoom.inviteCode}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Rules Reminder Banner */}
      {showRulesBanner && activeRoom.rules.length > 0 && (
        <div className="bg-[#1e2c3a] border-b border-[#242f3d] px-4 py-2 text-xs flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-medium text-white shrink-0">Room Rules:</span>
            <span className="text-slate-400 truncate">
              {activeRoom.rules.map(r => `${r.title}`).join(' · ')}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              onClick={() => setIsRoomRulesOpen(true)}
              className="text-sky-400 hover:underline font-medium"
            >
              View All
            </button>
            <button
              onClick={() => setShowRulesBanner(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Welcome Card */}
        <div className="text-center py-6 px-4 bg-[#17212b]/60 rounded-xl border border-[#242f3d]/60 max-w-xl mx-auto my-2">
          <h4 className="text-sm font-semibold text-white mb-1">
            Welcome to {activeRoom.title}
          </h4>
          <p className="text-xs text-slate-400 mb-2">
            Slash path: <span className="font-mono text-[#5288c1]">{activeRoom.topicPath}</span> · Telegram ID: <span className="font-mono">{activeRoom.telegramSupergroupId}</span>
          </p>
          <div className="text-[11px] text-slate-400 max-w-md mx-auto">
            {activeRoom.description}
          </div>
        </div>

        {/* Message Items */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 group max-w-2xl ${
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
                  <span className="text-[11px] text-slate-400 font-mono">
                    @{msg.senderUsername}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#2b5278] text-white rounded-tr-xs'
                      : 'bg-[#17212b] text-slate-100 rounded-tl-xs border border-[#242f3d]'
                  }`}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Code Snippet Block */}
                  {msg.mediaType === 'code' && msg.codeSnippet && (
                    <div className="mt-2 bg-[#0a0f16] rounded-lg p-2.5 font-mono text-xs text-emerald-300 border border-[#242f3d] overflow-x-auto">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 pb-1 border-b border-[#242f3d]">
                        <span className="uppercase">{msg.codeSnippet.language}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.codeSnippet!.code)}
                          className="hover:text-white"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre">{msg.codeSnippet.code}</pre>
                    </div>
                  )}

                  {/* Voice Note Player */}
                  {msg.mediaType === 'voice' && (
                    <div className="mt-2 flex items-center gap-2 bg-[#0e1621]/60 px-3 py-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#5288c1] flex items-center justify-center text-white shrink-0">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-[#242f3d] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-2/3" />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          0:0{msg.voiceDurationSeconds || 4} / Telegram Audio
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
                  {/* Quick react buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {['🔥', '👍', '❤️', '⚡'].map((emoji) => (
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

      {/* Code Snippet Modal Input inside Composer */}
      {showCodeInput && (
        <div className="bg-[#17212b] border-t border-[#242f3d] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-[#5288c1]" />
              Insert Code Snippet
            </span>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-[#0e1621] text-xs text-slate-300 border border-[#242f3d] rounded px-2 py-1 focus:outline-none"
              >
                <option value="solidity">Solidity</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={() => setShowCodeInput(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste code here..."
            className="w-full h-24 bg-[#0e1621] text-xs font-mono text-emerald-300 border border-[#242f3d] rounded p-2 focus:outline-none focus:border-[#5288c1]"
          />
        </div>
      )}

      {/* Message Composer */}
      <div className="p-3 sm:p-4 bg-[#17212b] border-t border-[#242f3d] shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Code snippet trigger */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`p-2 rounded-lg transition-colors ${
              showCodeInput ? 'bg-[#2b5278] text-white' : 'text-slate-400 hover:text-white hover:bg-[#242f3d]'
            }`}
            title="Attach Code Snippet"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Voice recording state or text input */}
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between bg-red-950/40 border border-red-500/40 px-3 py-2 rounded-xl text-xs text-red-200 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Recording Telegram Voice Note: 0:0{voiceDuration}</span>
              </div>
              <button
                type="button"
                onClick={handleStopAndSendVoice}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium flex items-center gap-1"
              >
                <Square className="w-3 h-3" />
                <span>Send Note</span>
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Message ${activeRoom.title}...`}
              className="flex-1 bg-[#0e1621] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 border border-[#242f3d] focus:outline-none focus:border-[#5288c1] transition-colors"
            />
          )}

          {/* Voice note recorder button */}
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

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() && !codeSnippet.trim()}
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
