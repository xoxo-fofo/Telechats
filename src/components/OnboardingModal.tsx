import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Sparkles,
  Check,
  Cpu,
  Gamepad2,
  Coins,
  Film,
  Rocket,
  Palette,
  Bot,
  Music,
  ArrowRight
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slashPath: string;
  description: string;
  icon: any;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'tech', name: 'Tech & Programming', slashPath: '/tech/programming', description: 'Web3, smart contracts, backend systems, and compilers', icon: Cpu },
  { id: 'ai', name: 'AI & LLM Engineering', slashPath: '/tech/ai', description: 'Agents, prompt architecture, local inference, and RAG', icon: Bot },
  { id: 'gaming', name: 'Gaming & Esports', slashPath: '/gaming/esports', description: 'Valorant scrims, competitive lobbies, and game dev', icon: Gamepad2 },
  { id: 'crypto', name: 'Crypto & DeFi', slashPath: '/crypto/defi', description: 'MEV arbitrage, flash loans, and liquidity protocols', icon: Coins },
  { id: 'startups', name: 'Startups & Ventures', slashPath: '/startups/founders', description: 'Fundraising, SAFE notes, pitch reviews, and bootstrapping', icon: Rocket },
  { id: 'movies', name: 'Cinema & Sci-Fi', slashPath: '/movies/hollywood', description: 'Speculative cinema, IMAX screenings, and cinephile chat', icon: Film },
  { id: 'design', name: 'Design & UX', slashPath: '/design/ui-ux', description: 'Android design systems, micro-interactions, and typography', icon: Palette },
  { id: 'music', name: 'Music & Production', slashPath: '/music', description: 'Electronic, synthwave, modular synthesis, and DAW workflow', icon: Music },
];

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    userInterests,
    saveUserInterests,
    setSelectedTopicPath
  } = useTeleChats();

  const [selected, setSelected] = useState<string[]>(userInterests);

  if (!isOnboardingOpen) return null;

  const toggleCategory = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const finalInterests = selected.length > 0 ? selected : ['tech', 'gaming'];
    saveUserInterests(finalInterests);
    // Auto-focus on primary interest path
    const primary = CATEGORIES.find(c => finalInterests.includes(c.id));
    if (primary) {
      setSelectedTopicPath(primary.slashPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 text-center border-b border-[#242f3d] bg-gradient-to-b from-[#1c2a38] to-[#17212b]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#2b5278] to-[#5288c1] flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-[#2b5278]/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Personalize Your TeleChats Feed
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Choose your core communities. TeleChats organizes Telegram MTProto supergroups into a clean, hierarchical topic tree.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {CATEGORIES.map((cat) => {
            const isPicked = selected.includes(cat.id);
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                  isPicked
                    ? 'bg-[#203040] border-[#5288c1] shadow-sm'
                    : 'bg-[#0e1621] border-[#242f3d] hover:border-[#2b5278] opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isPicked ? 'bg-[#5288c1] text-white' : 'bg-[#17212b] text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      {cat.name}
                    </span>
                    {isPicked && (
                      <Check className="w-3.5 h-3.5 text-[#5288c1] shrink-0" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[#5288c1] block">
                    {cat.slashPath}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#242f3d] bg-[#121b24] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {selected.length} Topic{selected.length !== 1 ? 's' : ''} Selected
          </span>
          <button
            onClick={handleFinish}
            className="px-5 py-2 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Continue to Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
