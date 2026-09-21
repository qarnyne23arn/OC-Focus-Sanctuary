import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { UserProfile } from '../types';
import { apiLogIn, apiSignUp, saveStoredAuth, setGuestDismissed } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: UserProfile, token: string) => void;
  initialMode?: 'login' | 'signup';
  isLight?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialMode = 'signup',
  isLight = false,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await apiSignUp(email.trim(), password, name.trim());
        saveStoredAuth(result.user, result.token);
        setSuccessMsg(`Welcome, ${result.user.name}! Your account has been created.`);
        setTimeout(() => {
          onAuthenticated(result.user, result.token);
          onClose();
        }, 600);
      } else {
        const result = await apiLogIn(email.trim(), password);
        saveStoredAuth(result.user, result.token);
        setSuccessMsg(`Welcome back, ${result.user.name}!`);
        setTimeout(() => {
          onAuthenticated(result.user, result.token);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuestDismissed(true);
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="auth-modal-container"
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isLight
            ? 'bg-[#edf5f7] border-slate-300 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#061022] border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition cursor-pointer ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-[#dce9ed]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Sand Clock Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-black border border-cyan-500/40 p-2 shadow-[0_0_30px_rgba(6,182,212,0.25)] mb-3 flex items-center justify-center overflow-hidden">
            <img
              src="/sandclock.svg"
              alt="OC Sand Clock"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]"
            />
          </div>
          <h2 className={`text-2xl font-black tracking-wider font-['Plus_Jakarta_Sans'] ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back to OC'}
          </h2>
          <p className={`text-xs mt-1 max-w-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {mode === 'signup'
              ? 'Join OC to auto-sync your study sessions, goals, and focus tasks across all your devices.'
              : 'Sign in to access your synchronized focus sanctuary and study history.'}
          </p>
        </div>

        {/* Multi-Device Auto-Sync Banner */}
        <div className={`mb-5 p-2.5 rounded-xl border flex items-center gap-3 ${
          isLight
            ? 'bg-[#dce9ed] border-cyan-400/40 text-slate-800'
            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200/90'
        }`}>
          <div className={`flex items-center gap-1 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
            <Laptop className="w-4 h-4" />
            <span className="text-[11px] font-bold">⇄</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] leading-tight">
            <span className={`font-bold ${isLight ? 'text-cyan-900' : 'text-cyan-300'}`}>Multi-Device Auto Sync:</span> Use one account on laptop, tablet, & phone with live auto-refresh.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className={`grid grid-cols-2 p-1 rounded-2xl border mb-5 ${
          isLight
            ? 'bg-[#dce9ed] border-slate-300'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : isLight
                  ? 'text-slate-700 hover:text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : isLight
                  ? 'text-slate-700 hover:text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Log In
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Your Name
              </label>
              <div className="relative">
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isLight ? 'text-slate-500' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition ${
                    isLight
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLight ? 'text-slate-500' : 'text-slate-500'
              }`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLight ? 'text-slate-500' : 'text-slate-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isLight ? 'text-slate-500' : 'text-slate-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition ${
                    isLight
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-slate-950 font-black tracking-wider text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Start Syncing</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Sync Workspace</span>
              </>
            )}
          </button>
        </form>

        {/* Guest Continue Footer */}
        <div className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${
          isLight ? 'border-slate-300 text-slate-600' : 'border-slate-800/80 text-slate-500'
        }`}>
          <span className={isLight ? 'text-slate-600' : 'text-slate-500'}>Want to test first?</span>
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className={`font-semibold cursor-pointer underline underline-offset-2 ${
              isLight ? 'text-cyan-800 hover:text-cyan-950' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
};
