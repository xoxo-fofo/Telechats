import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Link as LinkIcon,
  ArrowRight,
  Shield,
  AlertCircle,
  Hash
} from 'lucide-react';

export const JoinInviteModal: React.FC = () => {
  const {
    isJoinInviteOpen,
    setIsJoinInviteOpen,
    joinRoomByCode,
    rooms
  } = useTeleChats();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isJoinInviteOpen) return null;

  const handleJoin = async (codeToUse?: string) => {
    const raw = codeToUse || inputCode;
    if (!raw.trim()) return;

    setErrorMsg('');
    setLoading(true);

    // Extract code if user pasted full URL (e.g. https://telechats.app/join/TECH-8823)
    let clean = raw.trim();
    if (clean.includes('/join/')) {
      clean = clean.split('/join/')[1];
    }
    clean = clean.replace(/[^a-zA-Z0-9\-]/g, '');

    const res = await joinRoomByCode(clean);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid invite code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2b5278] flex items-center justify-center text-white">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Join by Invite Code</h3>
              <p className="text-xs text-slate-400">Enter a room code or telechats.app/join link</p>
            </div>
          </div>
          <button
            onClick={() => setIsJoinInviteOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Room Invite Code or Deep Link
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="e.g. TECH-8823 or AI-4091"
              className="w-full bg-[#0e1621] text-sm font-mono text-slate-100 px-3.5 py-2.5 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1] uppercase"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Click Popular Room Codes */}
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Active Room Codes
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rooms.slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setInputCode(r.inviteCode);
                    handleJoin(r.inviteCode);
                  }}
                  className="p-2 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-lg text-left text-xs transition-colors group"
                >
                  <div className="font-mono font-bold text-[#5288c1] group-hover:text-sky-300">
                    {r.inviteCode}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {r.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#242f3d] bg-[#121b24] flex items-center justify-end gap-2">
          <button
            onClick={() => setIsJoinInviteOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242f3d] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleJoin()}
            disabled={loading || !inputCode.trim()}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2b5278] hover:bg-[#346595] disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>{loading ? 'Verifying...' : 'Join Room'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
