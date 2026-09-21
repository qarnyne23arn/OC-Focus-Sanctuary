import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Sun,
  Moon,
  Smartphone,
  Laptop,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sliders,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { AppSettings, ThemeMode, UserProfile } from '../types';
import { apiChangePassword } from '../utils/auth';
import { loadLocalSessions, loadLocalTasks } from '../utils/storage';
import { calculateDailyReport, generateEnergyBreaksCSV } from '../utils/reports';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  authToken: string | null;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
  onTriggerSync: () => Promise<void>;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  onOpenAbout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  settings,
  onUpdateSettings,
  onSignOut,
  onOpenAuth,
  onTriggerSync,
  lastSyncedAt,
  isSyncing,
  onOpenAbout,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'sync' | 'timer' | 'export' | 'about'>('account');
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [activeTab, isOpen]);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!authToken) {
      setPassError('You must be signed in to change your password.');
      return;
    }

    if (!currentPassword || !newPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await apiChangePassword(authToken, currentPassword, newPassword);
      setPassSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    onUpdateSettings({
      ...settings,
      themeMode: mode,
    });
  };

  const handleExportJSON = () => {
    const sessions = loadLocalSessions();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const dailyRep = calculateDailyReport(sessions, dateStr, 0);
    const data = {
      sessions,
      tasks: loadLocalTasks(),
      settings,
      energy: {
        shift_start: dailyRep.energy_shift.start,
        shift_end: dailyRep.energy_shift.end,
        timeline: dailyRep.energy_timeline,
      },
      breaks: dailyRep.break_adherence,
      pattern_note: dailyRep.pattern_note,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oc-focus-sanctuary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const sessions = loadLocalSessions();
    if (sessions.length === 0) {
      alert('No study sessions found to export.');
      return;
    }
    const csvContent = generateEnergyBreaksCSV(sessions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy_breaks_log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTheme = settings.themeMode || 'dark';
  const isLight = currentTheme === 'light';

  return (
    <div
      id="settings-modal-backdrop"
      ref={modalRef}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 pt-[max(1rem,env(safe-area-inset-top))] overflow-y-auto"
    >
      <div
        id="settings-modal-container"
        className={`relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-4 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isLight
            ? 'bg-[#edf5f7] border-slate-300 text-slate-900'
            : 'bg-[#061022] border-sky-500/20 text-slate-100'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pinned Sticky Header & Tabs */}
        <div className={`sticky top-0 z-30 pb-3 pt-1 backdrop-blur-xl ${
          isLight ? 'bg-[#edf5f7]/95' : 'bg-[#061022]/95'
        }`}>
          {/* Modal Header */}
          <div className={`flex items-center justify-between pb-4 border-b mb-4 ${
            isLight ? 'border-slate-300' : 'border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-cyan-500/40 p-1 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/sandclock.svg"
                  alt="OC Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-black tracking-wider font-['Plus_Jakarta_Sans'] ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  System Settings
                </h2>
                <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Account credentials, day/night mode, and multi-device auto-sync
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-full transition cursor-pointer shrink-0 ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-[#dce9ed]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Navigation Tabs */}
          <div className={`grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-2xl border ${
            isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'account'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 shrink-0" />
              <span>Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timer')}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'timer'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Timer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenAbout) {
                  onClose();
                  onOpenAbout();
                } else {
                  setActiveTab('about');
                }
              }}
              className={`py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>About</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 mt-4">
          {/* TAB 1: ACCOUNT & CHANGE PASSWORD */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {currentUser ? (
                <>
                  {/* User Profile Card */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/70 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-slate-950 font-black text-lg flex items-center justify-center uppercase shadow-md">
                        {currentUser.name ? currentUser.name[0] : 'U'}
                      </div>
                      <div>
                        <div className={`font-bold text-base flex items-center gap-2 ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          <span>{currentUser.name || 'Student'}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                            Active Account
                          </span>
                        </div>
                        <div className={`text-xs font-mono ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onSignOut}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>

                  {/* Change Password Section */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-500" />
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Change Account Password
                      </h3>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                      Update your login password to secure cross-device access.
                    </p>

                    {passError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{passError}</span>
                      </div>
                    )}

                    {passSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>{passSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-3">
                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                          isLight ? 'text-slate-800' : 'text-slate-300'
                        }`}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                            isLight
                              ? 'bg-[#edf5f7] border border-slate-300 text-slate-900 placeholder-slate-500'
                              : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                            isLight ? 'text-slate-800' : 'text-slate-300'
                          }`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                              isLight
                                ? 'bg-[#edf5f7] border border-slate-300 text-slate-900 placeholder-slate-500'
                                : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                            isLight ? 'text-slate-800' : 'text-slate-300'
                          }`}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm password"
                            className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                              isLight
                                ? 'bg-[#edf5f7] border border-slate-300 text-slate-900 placeholder-slate-500'
                                : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500'
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isChangingPass}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isChangingPass ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Save New Password'
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Not Logged In State */
                <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                  isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      You are using Guest Mode
                    </h3>
                    <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      Create an account or sign in to save your sessions and auto-sync tasks across multiple devices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition cursor-pointer hover:brightness-110"
                  >
                    Sign In or Create Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPEARANCE (DAY MODE / LIGHT MODE VS NIGHT MODE / DARK MODE) */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Color Theme Selection
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  Switch between Daylight mode for bright ambient environments and Dark mode for deep nighttime flow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Night Mode Card */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden group ${
                    !isLight
                      ? 'bg-[#02050e] border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                      : 'bg-[#dce9ed] border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Moon className="w-5 h-5" />
                    </div>
                    {!isLight && (
                      <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Night Sanctuary (Dark)
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    Deep cosmic obsidian theme with glowing electric blue sand clock and minimal eye strain.
                  </p>
                </button>

                {/* Day Mode Card */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden group ${
                    isLight
                      ? 'bg-[#dce9ed] border-cyan-600 ring-2 ring-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#cbe0e7] border border-cyan-400 flex items-center justify-center text-cyan-800 shadow-inner">
                      <Sun className="w-5 h-5" />
                    </div>
                    {isLight && (
                      <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-slate-900">Day Mode (Light)</div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Crisp, high-contrast light theme with #edf5f7 canvas and deep readable text for daytime study.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-DEVICE AUTO-SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-[#dce9ed] border-cyan-400/40' : 'bg-cyan-500/10 border-cyan-500/25'
              }`}>
                <div className={`flex items-center gap-2 font-bold text-sm ${
                  isLight ? 'text-cyan-900' : 'text-cyan-400'
                }`}>
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Real-Time Multi-Device Auto Sync</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-cyan-200/80'}`}>
                  Sign in with the same account on your second laptop, tablet, or phone. All study sessions, daily goals, active tasks, and blocked distractions automatically synchronize across devices.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Auto-Sync Engine Status
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                    {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Ready to sync'}
                  </span>
                </div>

                <div className={`grid grid-cols-1 gap-2.5 pt-2 border-t ${
                  isLight ? 'border-slate-300' : 'border-slate-800'
                }`}>
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isLight ? 'bg-[#edf5f7] border-slate-300' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <Laptop className="w-5 h-5 text-sky-600 dark:text-sky-500 shrink-0" />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Primary Computer</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-500 font-bold">Connected & Synced</div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isLight ? 'bg-[#edf5f7] border-slate-300' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-500 shrink-0" />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Mobile / Tablet</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Auto-sync on login</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={onTriggerSync}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Workspace Now'}
                  </button>

                  {!currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className={`text-xs hover:underline font-bold cursor-pointer text-center sm:text-right ${
                        isLight ? 'text-cyan-800' : 'text-cyan-400'
                      }`}
                    >
                      Sign in to enable cloud sync
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIMER & DEFENSE PREFERENCES */}
          {activeTab === 'timer' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                    Focus Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={settings.focusDurationMinutes}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        focusDurationMinutes: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                      isLight
                        ? 'bg-[#edf5f7] border border-slate-300 text-slate-900'
                        : 'bg-slate-900 border border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                    Short Break (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.shortBreakMinutes}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        shortBreakMinutes: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                      isLight
                        ? 'bg-[#edf5f7] border border-slate-300 text-slate-900'
                        : 'bg-slate-900 border border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                    Daily Goal (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="900"
                    step="15"
                    value={settings.dailyGoalMinutes}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        dailyGoalMinutes: Math.max(10, Number(e.target.value)),
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition ${
                      isLight
                        ? 'bg-[#edf5f7] border border-slate-300 text-slate-900'
                        : 'bg-slate-900 border border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div>
                    <div className={`text-xs font-bold flex items-center gap-1.5 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
                      Strict Anti-Cheat
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      Lock tab switching
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.strictAntiCheatMode}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        strictAntiCheatMode: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA EXPORT (CSV / JSON) */}
          {activeTab === 'export' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/50 border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-500" />
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Export Study Data & Backups
                  </h3>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Download your complete study session logs as a spreadsheet (CSV) or backup all your application state as a JSON file.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                  isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/70 border-slate-800'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                      <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Study Sessions (CSV)
                      </h4>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      Export session logs, dates, subjects, durations, and task completion in spreadsheet format for Excel or Google Sheets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full py-3 sm:py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download CSV Report</span>
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                  isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-slate-900/70 border-slate-800'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-cyan-500 shrink-0" />
                      <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Complete Backup (JSON)
                      </h4>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      Export all application state including sessions, tasks, settings, and streak history as a backup file.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full py-3 sm:py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
