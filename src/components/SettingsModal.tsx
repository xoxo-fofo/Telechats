import React from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Settings,
  Shield,
  Radio,
  Sliders,
  LogOut,
  Sparkles,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    currentUser,
    mtprotoStatus,
    logout,
    setIsOnboardingOpen,
    loginAsDemo,
    setIsCiCdOpen
  } = useTeleChats();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242f3d] flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">TeleChats Settings</h3>
              <p className="text-xs text-slate-400">Profile & MTProto Infrastructure</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto no-scrollbar max-h-[75vh]">
          {/* User Profile Card */}
          {currentUser && (
            <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4 flex items-center gap-3.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#2b5278]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {currentUser.name}
                  </h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5288c1] shrink-0" />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  @{currentUser.username} · {currentUser.phone}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Authenticated via GramJS MTProto</span>
                </div>
              </div>
            </div>
          )}

          {/* MTProto Network Diagnostics */}
          <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Telegram MTProto Bridge Status</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                <span className="text-slate-500 block text-[10px]">Data Center</span>
                <span className="text-slate-200">{mtprotoStatus.dcCluster}</span>
              </div>
              <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                <span className="text-slate-500 block text-[10px]">Protocol</span>
                <span className="text-slate-200">{mtprotoStatus.protocol}</span>
              </div>
            </div>
          </div>

          {/* Quick Identity Switcher */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Switch Test Telegram Account
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loginAsDemo('alex')}
                className="p-2.5 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-xl text-left text-xs transition-colors"
              >
                <div className="font-semibold text-white">Alex Rivera</div>
                <div className="text-[10px] text-slate-400 font-mono">@alex_telegram (MTProto Core)</div>
              </button>
              <button
                onClick={() => loginAsDemo('sophia')}
                className="p-2.5 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-xl text-left text-xs transition-colors"
              >
                <div className="font-semibold text-white">Sophia Chen</div>
                <div className="text-[10px] text-slate-400 font-mono">@sophia_web3 (Solidity Lead)</div>
              </button>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsOnboardingOpen(true);
              }}
              className="w-full p-3 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-xl text-left text-xs text-slate-200 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#5288c1]" />
                <span>Customize Topic Preferences & Feed</span>
              </span>
              <span className="text-slate-500">Edit →</span>
            </button>

            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsCiCdOpen(true);
              }}
              className="w-full p-3 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-xl text-left text-xs text-slate-200 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Android CI/CD Workflows & APK Releases</span>
              </span>
              <span className="text-slate-500">View →</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#242f3d] bg-[#121b24] flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              setIsSettingsOpen(false);
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Telegram Session</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
