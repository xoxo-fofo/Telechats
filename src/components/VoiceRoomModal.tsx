import React, { useEffect, useRef } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Volume2,
  Users,
  Radio,
  Monitor,
  Headphones,
  Shield,
  Sparkles
} from 'lucide-react';

export const VoiceRoomModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    toggleMute,
    toggleScreenShare,
    audioFrequencyLevel,
    isMicActive,
    currentUser
  } = useTeleChats();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw real-time audio visualizer on canvas
  useEffect(() => {
    if (!activeCall || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      const activeAmp = activeCall.isMuted ? 2 : Math.max(8, (audioFrequencyLevel / 100) * (height / 2.5));

      // Draw glowing sine waves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5 - w * 0.6;
        ctx.strokeStyle = w === 0 ? 'rgba(52, 211, 153, 0.9)' : (w === 1 ? 'rgba(82, 136, 193, 0.7)' : 'rgba(56, 189, 248, 0.5)');

        for (let x = 0; x < width; x += 3) {
          const scaling = Math.sin((x / width) * Math.PI); // taper ends
          const y = mid + Math.sin((x * 0.03) + phase + (w * 1.2)) * activeAmp * scaling;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeCall, audioFrequencyLevel]);

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {activeCall.targetTitle}
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  LIVE WebRTC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeCall.targetType === 'room' ? 'Topic Supergroup Voice Room' : 'Direct Telegram Encrypted Call'} · {activeCall.participants.length} Participant{activeCall.participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={endCall}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live Audio Frequency Spectrum Canvas */}
        <div className="bg-[#0e1621] px-4 pt-3 pb-2 border-b border-[#242f3d] flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-mono">
              <span className={`w-2 h-2 rounded-full ${activeCall.isMuted ? 'bg-amber-500' : 'bg-emerald-400 animate-ping'}`} />
              {activeCall.isMuted ? 'Microphone Muted' : 'Voice Streaming Active'}
            </span>
            <span className="font-mono text-slate-500">
              Audio Bitrate: 64kbps Opus · Ping: 24ms
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={70}
            className="w-full h-16 rounded-lg bg-[#0a0f16]"
          />
        </div>

        {/* Participants Grid */}
        <div className="p-4 sm:p-6 max-h-80 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeCall.participants.map((participant) => {
            const isSpeaking = !participant.isMuted && (participant.audioLevel > 0.1 || (!activeCall.isMuted && participant.id === currentUser?.id));
            return (
              <div
                key={participant.id}
                className="bg-[#1e2a37] border border-[#242f3d] rounded-xl p-3 flex flex-col items-center text-center relative group"
              >
                {/* Speaking Ring */}
                <div className="relative mb-2">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className={`w-14 h-14 rounded-full object-cover transition-all ${
                      isSpeaking
                        ? 'ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/30 scale-105'
                        : 'border-2 border-[#242f3d]'
                    }`}
                  />
                  {/* Mute Badge */}
                  <div
                    className={`absolute bottom-0 right-0 p-1 rounded-full text-white text-[10px] ${
                      participant.isMuted ? 'bg-red-600' : 'bg-emerald-600'
                    }`}
                  >
                    {participant.isMuted ? (
                      <MicOff className="w-3 h-3" />
                    ) : (
                      <Mic className="w-3 h-3" />
                    )}
                  </div>
                </div>

                <div className="text-xs font-medium text-white truncate w-full">
                  {participant.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate w-full">
                  @{participant.username}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call Controls Toolbar */}
        <div className="p-4 sm:p-5 bg-[#121b24] border-t border-[#242f3d] flex items-center justify-center gap-4">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-3.5 rounded-full transition-all shadow-md flex items-center justify-center ${
              activeCall.isMuted
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#2b5278] hover:bg-[#346595] text-white'
            }`}
            title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition-all border ${
              activeCall.isScreenSharing
                ? 'bg-sky-600 text-white border-sky-400'
                : 'bg-[#1e2c3a] text-slate-300 hover:text-white border-[#242f3d]'
            }`}
            title="Toggle Screen Sharing"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* End Call / Leave Voice */}
          <button
            onClick={endCall}
            className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all hover:scale-105"
            title="Leave Voice Room"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Voice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
