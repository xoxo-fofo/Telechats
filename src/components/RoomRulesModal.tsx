import React from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import { Shield, Check, ExternalLink } from 'lucide-react';

export const RoomRulesModal: React.FC = () => {
  const {
    isRoomRulesOpen,
    setIsRoomRulesOpen,
    activeRoom
  } = useTeleChats();

  if (!isRoomRulesOpen || !activeRoom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1e2c3a] border border-[#242f3d] flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Community Rules</h3>
              <p className="text-xs text-slate-400 font-mono">{activeRoom.topicPath}</p>
            </div>
          </div>
          <button
            onClick={() => setIsRoomRulesOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Rules Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          <p className="text-xs text-slate-300 leading-relaxed">
            By participating in <strong>{activeRoom.title}</strong>, members agree to follow these community standards set by the room creator:
          </p>

          <div className="space-y-3">
            {activeRoom.rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-3.5 space-y-1"
              >
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1e2c3a] text-sky-400 flex items-center justify-center text-[11px] font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{rule.title}</span>
                </div>
                <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Room Code: {activeRoom.inviteCode} · Supergroup ID: {activeRoom.telegramSupergroupId}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#242f3d] bg-[#121b24] flex items-center justify-end">
          <button
            onClick={() => setIsRoomRulesOpen(false)}
            className="px-5 py-2 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
