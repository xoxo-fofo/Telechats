import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Users,
  Volume2,
  Shield,
  ArrowRight,
  Plus,
  Sparkles,
  Link as LinkIcon,
  Flame,
  Radio,
  Check,
  Send
} from 'lucide-react';
import { SupergroupRoom } from '../types';

export const TopicFeed: React.FC = () => {
  const {
    rooms,
    selectedTopicPath,
    setSelectedTopicPath,
    searchQuery,
    openRoom,
    startVoiceRoom,
    setIsCreateRoomOpen,
    userInterests
  } = useTeleChats();

  const [feedFilter, setFeedFilter] = useState<'all' | 'voice' | 'active'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter rooms
  let filteredRooms = rooms;

  // Filter by slash topic path
  if (selectedTopicPath && selectedTopicPath !== '/') {
    filteredRooms = filteredRooms.filter(r => r.topicPath.startsWith(selectedTopicPath));
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredRooms = filteredRooms.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.topicPath.toLowerCase().includes(q) ||
      r.inviteCode.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Filter by tab
  if (feedFilter === 'voice') {
    filteredRooms = filteredRooms.filter(r => r.isVoiceActive);
  } else if (feedFilter === 'active') {
    filteredRooms = [...filteredRooms].sort((a, b) => b.memberCount - a.memberCount);
  }

  const handleCopyInvite = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://telechats.app/join/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Feed Hero Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242f3d]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5288c1] mb-1">
            <span>CURRENT PATH:</span>
            <span className="font-semibold bg-[#17212b] px-2 py-0.5 rounded border border-[#242f3d]">
              {selectedTopicPath}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {selectedTopicPath === '/' ? 'Dynamic Community Feed' : selectedTopicPath.split('/').filter(Boolean).pop()?.toUpperCase() + ' Supergroups'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Telegram MTProto supergroups organized by hierarchical topic tree.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#17212b] border border-[#242f3d] rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFeedFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              feedFilter === 'all'
                ? 'bg-[#2b5278] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setFeedFilter('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              feedFilter === 'voice'
                ? 'bg-[#2b5278] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Voice Live</span>
          </button>
          <button
            onClick={() => setFeedFilter('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              feedFilter === 'active'
                ? 'bg-[#2b5278] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Top Active</span>
          </button>
        </div>
      </div>

      {/* Rooms List */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#17212b] rounded-xl border border-[#242f3d]">
          <div className="w-12 h-12 rounded-full bg-[#242f3d] flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Chatrooms in this Path</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Be the first to provision a Telegram MTProto supergroup on{' '}
            <code className="text-[#5288c1]">{selectedTopicPath}</code>.
          </p>
          <button
            onClick={() => setIsCreateRoomOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create {selectedTopicPath} Room</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => openRoom(room)}
              className="group bg-[#17212b] hover:bg-[#1d2a37] border border-[#242f3d] hover:border-[#2b5278] rounded-xl p-4 sm:p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Clean Unboxed Metadata: Slash path · Activity · Members */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#5288c1] font-medium">{room.topicPath}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400 font-sans">{room.lastActivity}</span>
                  </div>

                  {/* Voice badge */}
                  {room.isVoiceActive && (
                    <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-400 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Voice Live ({room.voiceParticipantsCount})</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white group-hover:text-[#5288c1] transition-colors leading-snug mb-2">
                  {room.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {room.description}
                </p>

                {/* Unboxed Tags */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 mb-4 font-mono">
                  {room.tags.map((tag) => (
                    <span key={tag} className="hover:text-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Creator info + Member stats + Action */}
              <div className="pt-3 border-t border-[#242f3d] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={room.creator.avatar}
                    alt={room.creator.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#242f3d]"
                  />
                  <div className="text-xs text-slate-400 truncate">
                    <span>by @{room.creator.username}</span>
                    <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                    <span className="text-slate-300 font-medium">{room.memberCount.toLocaleString()} members</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Copy Invite Code */}
                  <button
                    onClick={(e) => handleCopyInvite(e, room.inviteCode)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-md transition-colors text-xs font-mono flex items-center gap-1"
                    title={`Copy invite link: telechats.app/join/${room.inviteCode}`}
                  >
                    {copiedCode === room.inviteCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] hidden sm:inline">{room.inviteCode}</span>
                  </button>

                  {/* Join / Open Room */}
                  <div className="w-7 h-7 rounded-lg bg-[#242f3d] group-hover:bg-[#2b5278] text-slate-300 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
