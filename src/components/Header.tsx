import React from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Search,
  Plus,
  Link as LinkIcon,
  Smartphone,
  PhoneCall,
  Volume2,
  Settings,
  Shield,
  Layers,
  Sparkles,
  UserCheck,
  ChevronRight,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    selectedTopicPath,
    setSelectedTopicPath,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    setIsCreateRoomOpen,
    setIsJoinInviteOpen,
    setIsCiCdOpen,
    setIsSettingsOpen,
    setIsAuthModalOpen,
    currentUser,
    mtprotoStatus,
    activeCall,
    leaveRoom
  } = useTeleChats();

  // Split slash path for interactive breadcrumb navigation
  const pathSegments = selectedTopicPath.split('/').filter(Boolean);

  return (
    <header className="h-14 border-b border-[#242f3d] bg-[#17212b] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none z-20">
      {/* Left: Mobile Menu + Logo & Slash Path Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* TeleChats Brand */}
        <div
          onClick={() => {
            setSelectedTopicPath('/');
            leaveRoom();
            setActiveView('feed');
          }}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2b5278] to-[#5288c1] flex items-center justify-center text-white font-bold shadow-md shadow-[#2b5278]/20 group-hover:scale-105 transition-transform">
            <span className="font-mono text-sm tracking-tight">TC</span>
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline text-white">TeleChats</span>
        </div>

        {/* Slash Path Breadcrumbs */}
        <div className="hidden lg:flex items-center text-xs font-mono text-slate-400 overflow-x-auto no-scrollbar max-w-md py-1">
          <button
            onClick={() => {
              setSelectedTopicPath('/');
              leaveRoom();
            }}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              selectedTopicPath === '/' ? 'text-[#5288c1] font-semibold bg-[#242f3d]' : 'hover:text-slate-200'
            }`}
          >
            /root
          </button>
          {pathSegments.map((segment, index) => {
            const currentSubPath = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;
            return (
              <React.Fragment key={currentSubPath}>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 mx-0.5" />
                <button
                  onClick={() => {
                    setSelectedTopicPath(currentSubPath);
                    leaveRoom();
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors truncate max-w-[140px] ${
                    isLast ? 'text-[#5288c1] font-semibold bg-[#242f3d]' : 'hover:text-slate-200'
                  }`}
                  title={currentSubPath}
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Middle: Live Search Bar with direct topic queries */}
      <div className="flex-1 max-w-xs md:max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics, rooms, /slash paths, tags..."
          className="w-full bg-[#0e1621] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 rounded-lg pl-9 pr-3 py-1.5 border border-[#242f3d] focus:outline-none focus:border-[#5288c1] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right: Actions, CI/CD, Voice Bar, and Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Active Voice Pill if currently in call */}
        {activeCall && (
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium hidden md:inline">Voice Live</span>
            <span className="text-[10px] text-emerald-400/80">({activeCall.participants.length})</span>
          </div>
        )}

        {/* Create Room Button */}
        <button
          onClick={() => setIsCreateRoomOpen(true)}
          className="flex items-center gap-1 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
          title="Create a new slash-topic Telegram Supergroup"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Room</span>
        </button>

        {/* Join by Invite Link / Code */}
        <button
          onClick={() => setIsJoinInviteOpen(true)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-300 hover:text-white bg-[#242f3d] hover:bg-[#2c394b] rounded-lg transition-colors flex items-center gap-1"
          title="Join via invite link or code (e.g. TECH-8823)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Join Code</span>
        </button>

        {/* Android CI/CD Pipeline & APK Builder Button */}
        <button
          onClick={() => setIsCiCdOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#1e2c3a] hover:bg-[#27384a] text-sky-400 border border-sky-500/30 rounded-lg transition-colors"
          title="Android CI/CD Pipeline & GitHub Actions APK Builder"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline">Android APK CI/CD</span>
        </button>

        {/* MTProto Status & User Profile */}
        <div className="flex items-center gap-1.5 pl-1 border-l border-[#242f3d]">
          {currentUser ? (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 p-1 hover:bg-[#242f3d] rounded-lg transition-colors"
              title="Settings & MTProto Session"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#242f3d]"
                />
                <div
                  className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#17212b] ${
                    mtprotoStatus.activeSession ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={mtprotoStatus.activeSession ? 'MTProto 2.0 Connected' : 'Connecting to Telegram DC'}
                />
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-medium text-white truncate max-w-[100px] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-tight">
                  @{currentUser.username}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#5288c1] hover:bg-[#4372a8] text-white text-xs font-medium rounded-lg transition-colors"
            >
              Telegram Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
