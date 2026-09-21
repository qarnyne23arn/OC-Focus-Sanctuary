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
import { clientSignUp, clientLogIn, clientGoogleSignIn, saveStoredAuth, setGuestDismissed } from '../utils/auth';

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
        const result = await clientSignUp(email.trim(), password, name.trim());
        saveStoredAuth(result.user, result.token);
        setSuccessMsg(`Welcome, ${result.user.name}! Your account has been created.`);
        setTimeout(() => {
          onAuthenticated(result.user, result.token);
          onClose();
        }, 600);
      } else {
        const result = await clientLogIn(email.trim(), password);
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

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await clientGoogleSignIn();
      saveStoredAuth(result.user, result.token);
      setSuccessMsg(`Welcome, ${result.user.name}!`);
      setTimeout(() => {
        onAuthenticated(result.user, result.token);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed.');
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

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition border cursor-pointer mb-4 ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className={`absolute inset-0 flex items-center ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
            <div className={`w-full border-t ${isLight ? 'border-slate-300' : 'border-slate-800'}`} />
          </div>
          <span className={`relative px-3 text-[10px] font-semibold uppercase tracking-wider ${
            isLight ? 'bg-[#edf5f7] text-slate-500' : 'bg-[#061022] text-slate-400'
          }`}>
            Or with email
          </span>
        </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Start Syncing</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In & Restore Sanctuary</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Guest Dismiss */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className={`text-xs transition cursor-pointer underline underline-offset-4 ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Continue as guest (sync locally)
          </button>
        </div>
      </div>
    </div>
  );
};
