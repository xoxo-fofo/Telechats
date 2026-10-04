import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  ShieldCheck,
  Phone,
  KeyRound,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithPhone,
    verifyCode,
    verify2fa,
    loginAsDemo
  } = useTeleChats();

  const [step, setStep] = useState<'phone' | 'otp' | '2fa'>('phone');
  const [phone, setPhone] = useState('+1 415 555 0199');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFaPassword, setTwoFaPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginWithPhone(phone.trim());
      setLoading(false);
      if (res.success) {
        setPhoneCodeHash(res.phoneCodeHash || '');
        setStatusNotice(res.message || 'Confirmation code sent to Telegram.');
        setStep('otp');
      } else {
        setErrorMsg(res.error || 'Failed to dispatch MTProto code.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Network error connecting to Telegram DC.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verifyCode(phone.trim(), phoneCodeHash, otpCode.trim());
      setLoading(false);
      if (res.success) {
        if (res.requires2fa) {
          setStep('2fa');
        } else {
          setIsAuthModalOpen(false);
        }
      } else {
        setErrorMsg(res.error || 'Invalid code.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to verify code.');
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaPassword.trim()) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await verify2fa(twoFaPassword.trim());
      setLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Invalid 2FA password.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('SRP verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2b5278] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Telegram Native Login</h3>
              <p className="text-xs text-slate-400 font-mono">MTProto 2.0 Auth Bridge</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone Number (with Country Code)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 415 555 0199"
                  className="w-full bg-[#0e1621] text-sm text-slate-100 pl-9 pr-3 py-2.5 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1] font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A verification code will be sent to your official Telegram app.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-2.5 bg-[#2b5278] hover:bg-[#346595] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Connecting to Telegram DC...' : 'Send Login Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Click Demo Profiles */}
            <div className="pt-3 border-t border-[#242f3d]">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                Or Test As Verified Telegram Profile:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loginAsDemo('alex')}
                  className="p-2 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-lg text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-white truncate">Alex Rivera</div>
                  <div className="text-[10px] text-slate-400 font-mono">@alex_telegram</div>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('sophia')}
                  className="p-2 bg-[#0e1621] hover:bg-[#202b36] border border-[#242f3d] rounded-lg text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-white truncate">Sophia Chen</div>
                  <div className="text-[10px] text-slate-400 font-mono">@sophia_web3</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyCode} className="p-5 space-y-4">
            {statusNotice && (
              <div className="p-2.5 rounded-lg bg-[#1e2c3a] border border-[#242f3d] text-sky-300 text-xs font-mono">
                {statusNotice}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Telegram Confirmation Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 77712"
                  className="w-full bg-[#0e1621] text-center tracking-widest text-lg font-mono text-slate-100 pl-9 pr-3 py-2.5 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                For sandbox testing, use code: <code className="text-emerald-400 font-bold">77712</code>
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-1/3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242f3d] rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !otpCode.trim()}
                className="flex-1 py-2.5 bg-[#2b5278] hover:bg-[#346595] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: 2FA Password */}
        {step === '2fa' && (
          <form onSubmit={handleVerify2fa} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Two-Step Verification (Cloud Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={twoFaPassword}
                  onChange={(e) => setTwoFaPassword(e.target.value)}
                  placeholder="Enter 2FA password"
                  className="w-full bg-[#0e1621] text-sm text-slate-100 pl-9 pr-3 py-2.5 border border-[#242f3d] rounded-xl focus:outline-none focus:border-[#5288c1]"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your account is protected with SRP (Secure Remote Password) hash verification.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !twoFaPassword.trim()}
              className="w-full py-2.5 bg-[#2b5278] hover:bg-[#346595] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Checking SRP hash...' : 'Confirm 2FA Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
