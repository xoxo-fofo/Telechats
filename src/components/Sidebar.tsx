import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  FolderTree,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Hash,
  Volume2,
  Users,
  Phone,
  Sparkles,
  Search,
  CheckCircle2,
  Shield,
  Filter,
  Compass
} from 'lucide-react';
import { TopicNode, OfficialTelegramContact } from '../types';

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenOnMobile, onCloseMobile }) => {
  const {
    topics,
    selectedTopicPath,
    setSelectedTopicPath,
    contacts,
    activeContact,
    openDirectChat,
    leaveRoom,
    startDirectCall,
    activeView,
    setActiveView,
    userInterests,
    setIsOnboardingOpen
  } = useTeleChats();

  const [activeTab, setActiveTab] = useState<'topics' | 'contacts'>('topics');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    '/tech': true,
    '/tech/programming': true,
    '/tech/ai': true,
    '/gaming': true,
    '/crypto': true
  });

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Group topics hierarchically
  const rootTopics = topics.filter(t => !t.parentPath || t.path.split('/').filter(Boolean).length === 1);

  const getSubtopics = (parentPath: string) => {
    return topics.filter(t => t.parentPath === parentPath);
  };

  const handleSelectTopic = (path: string) => {
    setSelectedTopicPath(path);
    leaveRoom();
    setActiveView('feed');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#17212b] border-r border-[#242f3d] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Tabs: Topics vs Direct Chats */}
        <div className="p-3 border-b border-[#242f3d]">
          <div className="grid grid-cols-2 p-1 bg-[#0e1621] rounded-lg gap-1">
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'topics'
                  ? 'bg-[#2b5278] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Topic Tree</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-[#2b5278] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Direct Chats</span>
              <span className="text-[10px] bg-[#242f3d] px-1.5 py-0.2 rounded-full text-slate-300">
                {contacts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Hierarchical Topic Tree */}
        {activeTab === 'topics' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-1">
            {/* All Topics Root Option */}
            <div
              onClick={() => handleSelectTopic('/')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedTopicPath === '/'
                  ? 'bg-[#242f3d] text-[#5288c1] font-semibold'
                  : 'text-slate-300 hover:bg-[#202b36] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#5288c1]" />
                <span>All Topics & Feed</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">/root</span>
            </div>

            {/* Interest Filter Prompt */}
            <div className="pt-2 pb-1 px-2.5 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <span>Hierarchical Topics</span>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="text-[#5288c1] hover:underline normal-case tracking-normal font-normal text-xs"
              >
                Customize
              </button>
            </div>

            {/* Render Topics Recursively */}
            {rootTopics.map((root) => {
              const subtopics = getSubtopics(root.path);
              const hasSubtopics = subtopics.length > 0;
              const isExpanded = Boolean(expandedPaths[root.path]);
              const isSelected = selectedTopicPath === root.path;

              return (
                <div key={root.id} className="space-y-0.5">
                  <div
                    onClick={() => handleSelectTopic(root.path)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#2b5278] text-white font-medium'
                        : 'text-slate-300 hover:bg-[#202b36] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {hasSubtopics ? (
                        <button
                          onClick={(e) => toggleExpand(root.path, e)}
                          className="p-0.5 hover:text-white text-slate-400"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className="font-mono text-slate-500 group-hover:text-slate-400">/</span>
                      <span className="truncate">{root.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500 group-hover:text-slate-400">
                      <span>{root.roomCount}</span>
                    </div>
                  </div>

                  {/* Level 2 Subtopics */}
                  {hasSubtopics && isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l border-[#242f3d]/60 ml-3">
                      {subtopics.map((sub) => {
                        const subSubtopics = getSubtopics(sub.path);
                        const hasSubSub = subSubtopics.length > 0;
                        const isSubExpanded = Boolean(expandedPaths[sub.path]);
                        const isSubSelected = selectedTopicPath === sub.path;

                        return (
                          <div key={sub.id} className="space-y-0.5">
                            <div
                              onClick={() => handleSelectTopic(sub.path)}
                              className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                                isSubSelected
                                  ? 'bg-[#242f3d] text-[#5288c1] font-medium'
                                  : 'text-slate-400 hover:bg-[#202b36] hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {hasSubSub ? (
                                  <button
                                    onClick={(e) => toggleExpand(sub.path, e)}
                                    className="p-0.5 hover:text-white text-slate-400"
                                  >
                                    {isSubExpanded ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                ) : (
                                  <Hash className="w-3 h-3 text-slate-500" />
                                )}
                                <span className="truncate">{sub.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-600 group-hover:text-slate-400 font-mono">
                                {sub.roomCount}
                              </span>
                            </div>

                            {/* Level 3 Subtopics (e.g. /tech/programming/web3/smart-contracts) */}
                            {hasSubSub && isSubExpanded && (
                              <div className="pl-3 space-y-0.5 border-l border-[#242f3d]/40 ml-2">
                                {subSubtopics.map((subSub) => {
                                  const isSubSubSelected = selectedTopicPath === subSub.path;
                                  return (
                                    <div
                                      key={subSub.id}
                                      onClick={() => handleSelectTopic(subSub.path)}
                                      className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                                        isSubSubSelected
                                          ? 'bg-[#242f3d] text-[#5288c1] font-semibold'
                                          : 'text-slate-400 hover:text-white hover:bg-[#202b36]'
                                      }`}
                                    >
                                      <span className="truncate">{subSub.name}</span>
                                      <span className="text-[10px] text-slate-600 font-mono">
                                        {subSub.roomCount}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Official Telegram Contacts & 1-on-1 Chats */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-1">
            <div className="px-2 pb-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Official Telegram Users</span>
              <span className="text-emerald-400 text-[10px]">MTProto Connected</span>
            </div>

            {contacts.map((contact) => {
              const isSelected = activeContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    openDirectChat(contact);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#242f3d] text-white'
                      : 'text-slate-300 hover:bg-[#202b36] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#242f3d]"
                      />
                      <div
                        className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#17212b] ${
                          contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-slate-100 truncate">
                          {contact.name}
                        </span>
                        {contact.verified && (
                          <CheckCircle2 className="w-3 h-3 text-[#5288c1] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        @{contact.username}
                      </div>
                    </div>
                  </div>

                  {/* 1-on-1 Call Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startDirectCall(contact);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-[#2b5278]/40 rounded-lg transition-colors"
                    title={`Call ${contact.name} via Telegram Voice`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Sidebar Footer: MTProto Bridge Status */}
        <div className="p-3 border-t border-[#242f3d] bg-[#121b24] text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telegram MTProto</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">DC4 Amsterdam</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Bridging native Supergroups & Voice to nested topic channels.
          </p>
        </div>
      </aside>
    </>
  );
};
