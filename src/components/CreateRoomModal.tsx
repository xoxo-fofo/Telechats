import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Plus,
  Trash2,
  Shield,
  Hash,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { RoomRule } from '../types';

export const CreateRoomModal: React.FC = () => {
  const {
    isCreateRoomOpen,
    setIsCreateRoomOpen,
    selectedTopicPath,
    topics,
    createRoom
  } = useTeleChats();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicPath, setTopicPath] = useState(selectedTopicPath === '/' ? '/tech/programming' : selectedTopicPath);
  const [tagsInput, setTagsInput] = useState('telegram, community');
  const [rules, setRules] = useState<RoomRule[]>([
    {
      id: 'r1',
      title: 'Be Respectful & Constructive',
      description: 'Zero harassment, trolling, or spam. Treat all community members professionally.'
    },
    {
      id: 'r2',
      title: 'Ground All Claims With References',
      description: 'Link audited repos, documentation, or verifiable data when discussing technical topics.'
    }
  ]);

  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateRoomOpen) return null;

  const handleAddRule = () => {
    if (!newRuleTitle.trim()) return;
    setRules(prev => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        title: newRuleTitle.trim(),
        description: newRuleDesc.trim() || 'Custom community room rule'
      }
    ]);
    setNewRuleTitle('');
    setNewRuleDesc('');
  };

  const handleRemoveRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topicPath.trim()) return;

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    let cleanPath = topicPath.trim();
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    await createRoom({
      title: title.trim(),
      description: description.trim(),
      topicPath: cleanPath,
      rules,
      tags
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Create Topic Chatroom & Supergroup
            </h3>
            <p className="text-xs text-slate-400">
              Auto-provisions a native Telegram MTProto Supergroup attached to the slash path.
            </p>
          </div>
          <button
            onClick={() => setIsCreateRoomOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Topic Slash Path */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hierarchical Topic Slash Path
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#5288c1]">
                PATH:
              </span>
              <input
                type="text"
                value={topicPath}
                onChange={(e) => setTopicPath(e.target.value)}
                placeholder="/tech/programming/web3/smart-contracts"
                className="w-full bg-[#0e1621] text-xs sm:text-sm font-mono text-slate-100 pl-16 pr-3 py-2 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Example: <code>/tech/ai/llm-engineering</code> or <code>/gaming/esports/valorant</code>
            </p>
          </div>

          {/* Room Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Room Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart Contracts Auditing & EVM Bytecode"
              className="w-full bg-[#0e1621] text-xs sm:text-sm text-slate-100 px-3 py-2 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this community discusses, guidelines, and focus areas..."
              rows={2}
              className="w-full bg-[#0e1621] text-xs sm:text-sm text-slate-100 p-3 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="solidity, audit, evm, security"
              className="w-full bg-[#0e1621] text-xs font-mono text-slate-100 px-3 py-2 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
            />
          </div>

          {/* Custom Room Rules Builder */}
          <div className="pt-2 border-t border-[#242f3d]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Custom Room Rules (Displayed on entry)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {rules.length} Rule{rules.length !== 1 ? 's' : ''} Defined
              </span>
            </div>

            {/* Existing Rules List */}
            <div className="space-y-2 mb-3">
              {rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="text-sky-400 font-mono">{idx + 1}.</span>
                      <span>{rule.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Rule Row */}
            <div className="bg-[#121b24] border border-[#242f3d] rounded-xl p-3 space-y-2">
              <input
                type="text"
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                placeholder="Rule title (e.g. Zero unsolicited direct messages)"
                className="w-full bg-[#0e1621] text-xs text-slate-100 px-3 py-1.5 border border-[#242f3d] rounded-lg focus:outline-none focus:border-[#5288c1]"
              />
              <input
                type="text"
                value={newRuleDesc}
                onChange={(e) => setNewRuleDesc(e.target.value)}
                placeholder="Rule explanation (e.g. Unsolicited marketing will result in immediate ban)"
                className="w-full bg-[#0e1621] text-xs text-slate-100 px-3 py-1.5 border border-[#242f3d] rounded-lg focus:outline-none focus:border-[#5288c1]"
              />
              <button
                type="button"
                onClick={handleAddRule}
                disabled={!newRuleTitle.trim()}
                className="w-full py-1.5 bg-[#242f3d] hover:bg-[#2c3a4d] disabled:opacity-40 text-xs font-medium text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room Rule</span>
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[#242f3d] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242f3d] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !topicPath.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2b5278] hover:bg-[#346595] disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>{isSubmitting ? 'Provisioning Supergroup...' : 'Create Room & Provision'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
