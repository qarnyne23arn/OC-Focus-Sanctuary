import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  BarChart2, 
  ChevronDown, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Cloud, 
  History, 
  Plus, 
  Sparkles, 
  CheckCircle,
  WifiOff,
  Sliders,
  BookOpen,
  Edit2,
  Check,
  Laptop,
  Flame,
  Target,
  Maximize2,
  Minimize2,
  AlertOctagon,
  Headphones,
  Zap,
  Tag,
  Eye,
  X,
  Sun,
  Moon,
  BatteryCharging,
  Settings as SettingsIcon,
  User as UserIcon,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  RefreshCw,
  Menu,
  ChevronRight,
  Search
} from 'lucide-react';
import { 
  TimerMode, 
  StudySession, 
  BlockedWebsite, 
  SessionSnapshot, 
  CloudSyncState,
  MilestoneAlert,
  TaskItem,
  SessionReflection,
  UserProfile,
  ThemeMode,
  FocusProtocol,
  AppSettings,
  GoalItem,
  DistractionLogItem
} from './types';
import { 
  loadLocalSessions, 
  saveLocalSessions, 
  loadLocalSettings, 
  saveLocalSettings,
  loadLocalBlockedSites,
  saveLocalBlockedSites,
  loadLocalTasks,
  saveLocalTasks,
  loadSyncCode,
  saveSyncCode,
  loadSessionSnapshot,
  saveSessionSnapshot,
  queueOfflineSession,
  getOfflineQueue,
  clearOfflineQueue,
  getTodayDateString,
  getInitialSeedSessions,
  DEFAULT_TASKS,
  DEFAULT_BLOCKED_SITES,
  DEFAULT_SETTINGS,
  loadLocalReflections,
  saveLocalReflections,
  performSystemReset,
  loadLocalActiveTask,
  saveLocalActiveTask,
  loadLocalFloatingDockHidden,
  saveLocalFloatingDockHidden,
  loadLocalGoals,
  saveLocalGoals,
  loadLocalDistractionLog,
  saveLocalDistractionLog
} from './utils/storage';
import { 
  playStartChime, 
  playToggleTick, 
  playCompletionFanfare, 
  playMilestoneChime 
} from './utils/audio';
import { CircularTimer } from './components/CircularTimer';
import { ProductivityChart } from './components/ProductivityChart';
import { FocusHoursChart } from './components/FocusHoursChart';
import { GoalProgressBar } from './components/GoalProgressBar';
import { WebsiteBlocker } from './components/WebsiteBlocker';
import { BlockedSiteModal } from './components/BlockedSiteModal';
import { ExtendRestoreModal } from './components/ExtendRestoreModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { StatsModal } from './components/StatsModal';
import { NotificationToast } from './components/NotificationToast';
import { TaskManager } from './components/TaskManager';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { ReflectionModal } from './components/ReflectionModal';
import { AntiCheatModal } from './components/AntiCheatModal';
import { SystemResetModal } from './components/SystemResetModal';
import { ZenSanctuaryModal } from './components/ZenSanctuaryModal';
import { MiniFloatingTimer } from './components/MiniFloatingTimer';
import { FocusProtocolsCard } from './components/FocusProtocolsCard';
import { SystemInitiateSplash } from './components/SystemInitiateSplash';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { AmbientSoundModal } from './components/AmbientSoundModal';
import { GoalsSection } from './components/GoalsSection';
import { HabitHeatmap } from './components/HabitHeatmap';
import { 
  loadStoredAuth, 
  saveStoredAuth, 
  clearStoredAuth, 
  isGuestDismissed, 
  apiPushUserSync, 
  apiPullUserSync 
} from './utils/auth';

export default function App() {
  // Persistence state
  const [sessions, setSessions] = useState<StudySession[]>(loadLocalSessions);
  const [settings, setSettings] = useState(loadLocalSettings);
  const [blockedSites, setBlockedSites] = useState<BlockedWebsite[]>(loadLocalBlockedSites);
  const [tasks, setTasks] = useState<TaskItem[]>(loadLocalTasks);
  const [syncCode, setSyncCode] = useState<string>(loadSyncCode);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // System Initiation Splash Screen state (shows user logo for ~1s on startup then enters main app)
  const [isInitiating, setIsInitiating] = useState<boolean>(true);

  // Active task name (user enters task name by themselves; defaults to empty)
  const [activeTaskName, setActiveTaskName] = useState<string>(loadLocalActiveTask);
  const [isEditingTaskInline, setIsEditingTaskInline] = useState<boolean>(false);
  const [tempTaskName, setTempTaskName] = useState<string>(loadLocalActiveTask);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  // Initialize to 45 minutes (45 * 60 = 2700 seconds)
  const [totalSeconds, setTotalSeconds] = useState<number>(settings.focusDurationMinutes * 60 || 45 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.focusDurationMinutes * 60 || 45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // UI Modals & Popups
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'This Week'>('Today');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showBlockerModal, setShowBlockerModal] = useState<boolean>(false);
  const [showExtendRestoreModal, setShowExtendRestoreModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [simulatedBlockedDomain, setSimulatedBlockedDomain] = useState<string | null>(null);

  // Right column tab for PC webpage view (Consolidated 4 Views: workspace, goals, insights, protocols_shield)
  type DesktopTab = 'workspace' | 'goals' | 'insights' | 'protocols_shield';
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('workspace');
  const [goals, setGoals] = useState<GoalItem[]>(loadLocalGoals);
  const [showGoalsModal, setShowGoalsModal] = useState<boolean>(false);

  // New Requested Feature States
  const [isClockExpanded, setIsClockExpanded] = useState<boolean>(false);
  const [showZenSanctuary, setShowZenSanctuary] = useState<boolean>(false);
  const [showSystemResetModal, setShowSystemResetModal] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [reflections, setReflections] = useState<SessionReflection[]>(loadLocalReflections);
  const [strictAntiCheatMode, setStrictAntiCheatMode] = useState<boolean>(true);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState<boolean>(false);
  const [strayDurationSeconds, setStrayDurationSeconds] = useState<number>(0);
  const [totalViolationsCount, setTotalViolationsCount] = useState<number>(0);
  const strayStartTimeRef = useRef<number | null>(null);

  // Floating Mini Timer Dock Hide & Undo State
  const [isFloatingDockHidden, setIsFloatingDockHidden] = useState<boolean>(loadLocalFloatingDockHidden);
  const [showHideUndoToast, setShowHideUndoToast] = useState<boolean>(false);
  const [lastExtensionMinutes, setLastExtensionMinutes] = useState<number | null>(null);
  const hideToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const undoExtendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stats & Distraction counters
  const [distractionCount, setDistractionCount] = useState<number>(14);
  const [distractionLog, setDistractionLog] = useState<DistractionLogItem[]>(loadLocalDistractionLog);
  const [alerts, setAlerts] = useState<MilestoneAlert[]>([]);

  // User Authentication & Multi-Device Auto Sync State
  const [authData, setAuthData] = useState<{ user: UserProfile | null; token: string | null }>(loadStoredAuth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('signup');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isAmbientModalOpen, setIsAmbientModalOpen] = useState<boolean>(false);
  const [lastAccountSyncedAt, setLastAccountSyncedAt] = useState<string | null>(null);
  const [isAccountSyncing, setIsAccountSyncing] = useState<boolean>(false);
  const [savedSnapshot, setSavedSnapshot] = useState<SessionSnapshot | null>(loadSessionSnapshot);
  const [isCommandDeckOpen, setIsCommandDeckOpen] = useState<boolean>(false);

  // Cloud Sync & Offline State
  const [syncState, setSyncState] = useState<CloudSyncState>({
    syncCode: loadSyncCode(),
    lastSyncedAt: new Date().toISOString(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    hasUnsavedChanges: false,
    connectedDevices: [
      { id: '1', name: 'PC / Desktop Workstation', platform: 'desktop', lastActive: 'Active Now', isCurrent: true },
      { id: '2', name: 'iPhone 15 Pro', platform: 'mobile', lastActive: 'Synced 10m ago', isCurrent: false },
    ],
  });
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => getOfflineQueue().length);

  // Ref for timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Calculate metrics for Today matching the image
  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayFocusMinutes = todaySessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);
  const todaySessionCount = todaySessions.length;

  // Add notification helper
  const addAlert = useCallback((title: string, message: string, type: MilestoneAlert['type']) => {
    const newAlert: MilestoneAlert = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 5000);
  }, []);

  // Save tasks and sessions locally
  useEffect(() => {
    saveLocalSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveLocalActiveTask(activeTaskName);
  }, [activeTaskName]);

  useEffect(() => {
    saveLocalGoals(goals);
  }, [goals]);

  // Goal Deadline Reminders Checker (every 20 seconds)
  useEffect(() => {
    const checkGoalReminders = () => {
      const now = new Date();
      const nowMs = now.getTime();

      setGoals((prevGoals) => {
        let hasChanges = false;
        const nextGoals = prevGoals.map((goal) => {
          if (goal.completed || !goal.reminderEnabled || goal.reminderTriggered) {
            return goal;
          }

          try {
            const [y, m, d] = goal.deadlineDate.split('-').map(Number);
            const [h, min] = goal.deadlineTime.split(':').map(Number);
            const deadlineMs = new Date(y, m - 1, d, h || 0, min || 0).getTime();

            let leadMs = 0;
            switch (goal.reminderLeadTime) {
              case '15m': leadMs = 15 * 60 * 1000; break;
              case '30m': leadMs = 30 * 60 * 1000; break;
              case '1h': leadMs = 60 * 60 * 1000; break;
              case '2h': leadMs = 2 * 60 * 60 * 1000; break;
              case '1d': leadMs = 24 * 60 * 60 * 1000; break;
              case 'at_deadline': leadMs = 0; break;
              default: leadMs = 0; break;
            }

            const alertTimeMs = deadlineMs - leadMs;

            // Trigger if current time has reached or passed reminder time (within 3 hours)
            if (nowMs >= alertTimeMs && nowMs <= deadlineMs + 3 * 60 * 60 * 1000) {
              hasChanges = true;
              playMilestoneChime();
              addAlert(
                `🔔 Goal Reminder: ${goal.title}`,
                `Deadline is ${goal.deadlineDate} at ${goal.deadlineTime} (${goal.timeframe.replace('_', ' ')} goal). Stay focused!`,
                'goal_completed'
              );

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`Goal Reminder: ${goal.title}`, {
                    body: `Due at ${goal.deadlineTime}. Make progress today!`,
                    icon: '/sandclock.svg',
                  });
                } catch {
                  // ignore
                }
              }

              return { ...goal, reminderTriggered: true };
            }
          } catch {
            // ignore
          }
          return goal;
        });

        return hasChanges ? nextGoals : prevGoals;
      });
    };

    checkGoalReminders();
    const reminderInterval = setInterval(checkGoalReminders, 20000);
    return () => clearInterval(reminderInterval);
  }, [addAlert]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
      addAlert('Network Restored', 'Back online! Syncing cached sessions to the cloud...', 'milestone');
      flushOfflineQueue();
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
      addAlert('Offline Mode Active', 'No internet connection. All study data safely cached locally.', 'milestone');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addAlert]);

  // PC Keyboard Shortcuts (Space = Play/Pause, R = Reset, E = Extend +5m, F = Zen Sanctuary)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'e' || e.key === 'E') {
        handleExtend(5);
      } else if (e.key === 'f' || e.key === 'F') {
        setShowZenSanctuary((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Anti-Cheat: Visibility Change & Window Blur Listener (Strict Study Mode)
  useEffect(() => {
    if (!strictAntiCheatMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning && mode === 'focus' && !strayStartTimeRef.current) {
          strayStartTimeRef.current = Date.now();
        }
      } else {
        if (strayStartTimeRef.current) {
          const elapsed = Math.max(1, Math.round((Date.now() - strayStartTimeRef.current) / 1000));
          strayStartTimeRef.current = null;
          setStrayDurationSeconds(elapsed);
          setTotalViolationsCount((prev) => prev + 1);
          setDistractionCount((prev) => prev + 1);
          setShowAntiCheatModal(true);
          addAlert('Anti-Cheat Warning', `Study sanctuary lost for ${elapsed}s! Stay focused.`, 'anti_cheat');
        }
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && mode === 'focus' && !strayStartTimeRef.current) {
        strayStartTimeRef.current = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (strayStartTimeRef.current) {
        const elapsed = Math.max(1, Math.round((Date.now() - strayStartTimeRef.current) / 1000));
        strayStartTimeRef.current = null;
        setStrayDurationSeconds(elapsed);
        setTotalViolationsCount((prev) => prev + 1);
        setDistractionCount((prev) => prev + 1);
        setShowAntiCheatModal(true);
        addAlert('Anti-Cheat Warning', `Study sanctuary lost for ${elapsed}s! Stay focused.`, 'anti_cheat');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [strictAntiCheatMode, isRunning, mode, addAlert]);

  // Persist settings locally
  useEffect(() => {
    saveLocalSettings(settings);
  }, [settings]);

  // Sync theme mode to document.documentElement
  useEffect(() => {
    if (settings.themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [settings.themeMode]);

  // Pull Account Data for Multi-Device Auto-Sync
  const pullAccountSync = useCallback(async (token: string, silent = true) => {
    try {
      setIsAccountSyncing(true);
      const res = await apiPullUserSync(token);
      if (res.exists && res.data) {
        if (res.data.sessions) setSessions(res.data.sessions);
        if (res.data.settings) setSettings(res.data.settings);
        if (res.data.blockedSites) setBlockedSites(res.data.blockedSites);
        if (res.data.tasks) setTasks(res.data.tasks);
        if (res.data.goals) setGoals(res.data.goals);
        if (res.data.activeTaskName !== undefined) setActiveTaskName(res.data.activeTaskName);
        if (res.updatedAt) setLastAccountSyncedAt(res.updatedAt);
        if (!silent) {
          addAlert('Account Synced', 'Updated with latest state from other devices.', 'milestone');
        }
      }
    } catch (err) {
      console.warn('Failed to auto-sync account workspace', err);
    } finally {
      setIsAccountSyncing(false);
    }
  }, [addAlert]);

  // Initial Pull when signed in
  useEffect(() => {
    if (authData.token) {
      pullAccountSync(authData.token, true);
    }
  }, [authData.token, pullAccountSync]);

  // Debounced Push to Server on State Changes for Multi-Device Auto-Sync
  useEffect(() => {
    if (!authData.token) return;

    const timer = setTimeout(async () => {
      try {
        const res = await apiPushUserSync(authData.token!, {
          sessions,
          settings,
          blockedSites,
          tasks,
          goals,
          activeTaskName,
        });
        setLastAccountSyncedAt(res.updatedAt);
      } catch (err) {
        console.warn('Auto sync push failed', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessions, settings, blockedSites, tasks, goals, activeTaskName, authData.token]);

  // Background Auto-Sync Poller (every 20 seconds and on window focus for cross-device live updates)
  useEffect(() => {
    if (!authData.token) return;

    const interval = setInterval(() => {
      pullAccountSync(authData.token!, true);
    }, 20000);

    const onFocus = () => {
      pullAccountSync(authData.token!, true);
    };

    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [authData.token, pullAccountSync]);

  // Manual Trigger Sync for Current Account
  const handleTriggerAccountSync = async () => {
    if (!authData.token) {
      addAlert('Guest Mode', 'Sign in or create an account to auto-sync across devices.', 'milestone');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsAccountSyncing(true);
      const pushRes = await apiPushUserSync(authData.token, {
        sessions,
        settings,
        blockedSites,
        tasks,
        activeTaskName,
      });
      setLastAccountSyncedAt(pushRes.updatedAt);
      await pullAccountSync(authData.token, false);
      addAlert('Account Synced', 'Workspace is synchronized with all devices in real-time.', 'milestone');
    } catch {
      addAlert('Sync Error', 'Failed to reach synchronization service.', 'milestone');
    } finally {
      setIsAccountSyncing(false);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    clearStoredAuth();
    setAuthData({ user: null, token: null });
    setIsSettingsModalOpen(false);
    addAlert('Signed Out', 'You are now in guest mode. Data remains stored locally.', 'milestone');
  };

  // Theme Mode Toggle
  const toggleThemeMode = () => {
    const nextTheme: ThemeMode = settings.themeMode === 'light' ? 'dark' : 'light';
    const updatedSettings: AppSettings = { ...settings, themeMode: nextTheme };
    setSettings(updatedSettings);
    saveLocalSettings(updatedSettings);
    addAlert('Theme Changed', `Switched to ${nextTheme === 'light' ? 'Day Mode (Light)' : 'Night Mode (Dark)'}`, 'milestone');
  };

  // Splash Screen completion handler
  const handleInitiateComplete = () => {
    setIsInitiating(false);
    // For first-time users (not logged in and haven't explicitly dismissed guest mode), show login/signup modal
    if (!authData.user && !isGuestDismissed()) {
      setAuthModalInitialMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  // Flush offline queue to server
  const flushOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      await fetch(`/api/sync/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sessions,
            settings,
            blockedSites,
            tasks,
          },
        }),
      });
      clearOfflineQueue();
      setOfflineQueueCount(0);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
      }));
    } catch {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [sessions, settings, blockedSites, tasks, syncCode]);

  // Force Cloud Sync Push
  const handleTriggerSync = async () => {
    if (!syncState.isOnline) {
      addAlert('Offline', 'Cannot sync with cloud while offline. Saved locally.', 'milestone');
      return;
    }

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const res = await fetch(`/api/sync/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sessions,
            settings,
            blockedSites,
            tasks,
            goals,
            activeTaskName,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
        }));
        addAlert('Cloud Synced', 'Your focus stats are synchronized across all devices.', 'milestone');
      }
    } catch {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
      addAlert('Sync Error', 'Failed to reach cloud endpoint. Using local storage.', 'milestone');
    }
  };

  // Sync Code Change
  const handleUpdateSyncCode = async (newCode: string) => {
    setSyncCode(newCode);
    saveSyncCode(newCode);
    setSyncState((prev) => ({ ...prev, syncCode: newCode }));

    if (syncState.isOnline) {
      try {
        const res = await fetch(`/api/sync/${newCode}`);
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          if (json.data.sessions) setSessions(json.data.sessions);
          if (json.data.settings) setSettings(json.data.settings);
          if (json.data.blockedSites) setBlockedSites(json.data.blockedSites);
          if (json.data.tasks) setTasks(json.data.tasks);
          if (json.data.goals) setGoals(json.data.goals);
          addAlert('Device Paired', `Pulled workspace data for ${newCode}!`, 'milestone');
        }
      } catch {
        // Ignore
      }
    }
  };

  // Session completion handler
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    playCompletionFanfare();

    const elapsedMins = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
    const newSession: StudySession = {
      id: 'session-' + Date.now(),
      mode,
      subject: activeTaskName,
      durationMinutes: Math.round(totalSeconds / 60),
      actualMinutes: elapsedMins,
      completed: true,
      timestamp: new Date().toISOString(),
      date: getTodayDateString(),
      hour: new Date().getHours(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update pomodoros on active task
    setTasks((prev) =>
      prev.map((t) =>
        t.name.toLowerCase() === activeTaskName.toLowerCase()
          ? { ...t, pomodorosLogged: t.pomodorosLogged + 1 }
          : t
      )
    );

    // Handle offline queue
    if (!navigator.onLine) {
      queueOfflineSession(newSession);
      setOfflineQueueCount(getOfflineQueue().length);
    }

    addAlert(
      '🎉 Focus Session Completed!',
      `Great job! You completed ${elapsedMins} minutes of study on "${activeTaskName}".`,
      'session_finished'
    );

    // Prompt Study Session Reflection & Energy Journaling
    if (mode === 'focus') {
      setTimeout(() => {
        setShowReflectionModal(true);
      }, 700);
    }

    // Auto prompt break
    if (mode === 'focus') {
      setTimeout(() => {
        setMode('short_break');
        setTotalSeconds(settings.shortBreakMinutes * 60);
        setRemainingSeconds(settings.shortBreakMinutes * 60);
        addAlert('Break Time', 'Rest your eyes, hydrate, and relax for 5 minutes.', 'milestone');
      }, 1500);
    }
  }, [totalSeconds, remainingSeconds, mode, activeTaskName, settings.shortBreakMinutes, addAlert]);

  // Main Timer Interval Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }

          // Check for 25-minute milestone
          const elapsed = totalSeconds - prev;
          if (elapsed === 25 * 60 && mode === 'focus') {
            playMilestoneChime();
            addAlert('🏆 25-Minute Flow Milestone', 'Quarter-hour milestone reached! You are locked in.', 'milestone');
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, totalSeconds, mode, handleSessionComplete, addAlert]);

  // Toggle Start / Pause
  const handleToggleTimer = () => {
    playToggleTick();
    if (!isRunning) {
      playStartChime();
      sessionStartTimeRef.current = Date.now();
      setIsRunning(true);
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    } else {
      setIsRunning(false);
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    }
  };

  // Reset Timer
  const handleReset = () => {
    playToggleTick();
    if (remainingSeconds < totalSeconds) {
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    }

    setIsRunning(false);
    let defaultTime = settings.focusDurationMinutes * 60;
    if (mode === 'short_break') defaultTime = settings.shortBreakMinutes * 60;
    if (mode === 'long_break') defaultTime = settings.longBreakMinutes * 60;

    setTotalSeconds(defaultTime);
    setRemainingSeconds(defaultTime);
  };

  // Set Timer Time by Yourself (requested by user)
  const handleSetCustomDuration = (minutes: number) => {
    playToggleTick();
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);

    if (mode === 'focus') {
      const updatedSettings = { ...settings, focusDurationMinutes: minutes };
      setSettings(updatedSettings);
      saveLocalSettings(updatedSettings);
    }

    addAlert('Timer Adjusted', `Duration set to ${minutes} minutes. Ready to start!`, 'milestone');
  };

  // Switch Modes (Focus / Short Break / Long Break)
  const handleSwitchMode = (newMode: TimerMode) => {
    playToggleTick();
    setIsRunning(false);
    setMode(newMode);

    let secs = settings.focusDurationMinutes * 60;
    if (newMode === 'short_break') secs = settings.shortBreakMinutes * 60;
    if (newMode === 'long_break') secs = settings.longBreakMinutes * 60;

    setTotalSeconds(secs);
    setRemainingSeconds(secs);
  };

  // Extend Mode (+5m, +10m, +15m) with Undo capability
  const handleExtend = (extraMinutes: number) => {
    playMilestoneChime();
    const addSecs = extraMinutes * 60;
    setTotalSeconds((prev) => prev + addSecs);
    setRemainingSeconds((prev) => prev + addSecs);
    setLastExtensionMinutes(extraMinutes);
    if (undoExtendTimerRef.current) clearTimeout(undoExtendTimerRef.current);
    undoExtendTimerRef.current = setTimeout(() => {
      setLastExtensionMinutes(null);
    }, 20000);
    addAlert(
      '⚡ Flow State Extended',
      `Added +${extraMinutes} minutes to your active session. Keep focused!`,
      'milestone'
    );
  };

  // Undo Extension
  const handleUndoExtend = () => {
    if (!lastExtensionMinutes) return;
    playToggleTick();
    const removeSecs = lastExtensionMinutes * 60;
    setTotalSeconds((prev) => Math.max(60, prev - removeSecs));
    setRemainingSeconds((prev) => Math.max(1, prev - removeSecs));
    const undone = lastExtensionMinutes;
    setLastExtensionMinutes(null);
    if (undoExtendTimerRef.current) clearTimeout(undoExtendTimerRef.current);
    addAlert(
      '↩ Extension Reverted',
      `Reverted +${undone} minutes from your session timer.`,
      'system'
    );
  };

  // Floating Mini Timer Dock Hide & Undo Handlers
  const handleHideFloatingDock = () => {
    playToggleTick();
    setIsFloatingDockHidden(true);
    saveLocalFloatingDockHidden(true);
    setShowHideUndoToast(true);
    if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
    hideToastTimerRef.current = setTimeout(() => {
      setShowHideUndoToast(false);
    }, 8000);
  };

  const handleUndoHideFloatingDock = () => {
    playToggleTick();
    setIsFloatingDockHidden(false);
    saveLocalFloatingDockHidden(false);
    setShowHideUndoToast(false);
    if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
    addAlert(
      'Floating Timer Restored',
      'The floating focus dock is active on screen.',
      'system'
    );
  };

  // Restore Mode
  const handleRestore = () => {
    if (!savedSnapshot) return;
    playToggleTick();
    setMode(savedSnapshot.mode);
    setTotalSeconds(savedSnapshot.totalSeconds);
    setRemainingSeconds(savedSnapshot.remainingSeconds);
    setActiveTaskName(savedSnapshot.subject);
    setIsRunning(false);
    addAlert(
      '↺ Session Restored',
      `Restored previous session (${Math.floor(savedSnapshot.remainingSeconds / 60)}m remaining).`,
      'milestone'
    );
  };

  // Save Inline Task Name
  const handleSaveInlineTask = () => {
    if (tempTaskName.trim()) {
      setActiveTaskName(tempTaskName.trim());
      // Also add or update in tasks list
      if (!tasks.some((t) => t.name.toLowerCase() === tempTaskName.trim().toLowerCase())) {
        const newTask: TaskItem = {
          id: 'task-' + Date.now(),
          name: tempTaskName.trim(),
          completed: false,
          pomodorosLogged: 0,
          pomodorosTarget: 4,
          subject: 'Academic Study',
          priority: 'medium',
        };
        setTasks((prev) => [newTask, ...prev]);
      }
    }
    setIsEditingTaskInline(false);
  };



  // Task List Handlers
  const handleAddTask = (name: string, targetPomodoros = 4, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      name,
      completed: false,
      pomodorosLogged: 0,
      pomodorosTarget: targetPomodoros,
      subject: 'General Study',
      priority,
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskName(name);
    addAlert('Task Added', `"${name}" is now your active study task!`, 'milestone');
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete && taskToDelete.name.toLowerCase() === activeTaskName.toLowerCase()) {
      setActiveTaskName('');
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Website Blocker Actions
  const handleToggleBlockedSite = (id: string) => {
    const updated = blockedSites.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
  };

  const handleAddBlockedSite = (domain: string, name: string) => {
    const newSite: BlockedWebsite = {
      id: 'site-' + Date.now(),
      domain,
      name,
      category: 'custom',
      enabled: true,
    };
    const updated = [newSite, ...blockedSites];
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
    addAlert('Shield Updated', `Added ${domain} to blocked websites list.`, 'milestone');
  };

  const handleRemoveBlockedSite = (id: string) => {
    const updated = blockedSites.filter((s) => s.id !== id);
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
  };

  const handleSimulateBlock = (domain: string) => {
    setDistractionCount((prev) => prev + 1);
    setSimulatedBlockedDomain(domain);
    const newItem: DistractionLogItem = {
      id: 'd-' + Math.random().toString(36).substring(2, 9),
      domain,
      timestamp: new Date().toISOString(),
      action: 'Blocked & Shielded',
    };
    const updated = [newItem, ...distractionLog];
    setDistractionLog(updated);
    saveLocalDistractionLog(updated);
  };

  const handleClearDistractionLog = () => {
    setDistractionLog([]);
    saveLocalDistractionLog([]);
    addAlert('Log Cleared', 'Visited & intercepted sites history cleared.', 'milestone');
  };

  // Full System Reset Handler
  const handleConfirmSystemReset = () => {
    performSystemReset();
    setSessions([]);
    setTasks(DEFAULT_TASKS);
    setBlockedSites(DEFAULT_BLOCKED_SITES);
    setSettings(DEFAULT_SETTINGS);
    setActiveTaskName('');
    setTotalSeconds(45 * 60);
    setRemainingSeconds(45 * 60);
    setIsRunning(false);
    setMode('focus');
    setDistractionCount(0);
    setTotalViolationsCount(0);
    setIsClockExpanded(false);
    setIsFloatingDockHidden(false);
    saveLocalFloatingDockHidden(false);
    setShowHideUndoToast(false);
    setReflections([]);
    setSavedSnapshot(null);
    setGoals(loadLocalGoals());
    addAlert('System Reset Complete', 'All study data, tasks, and settings restored to factory defaults.', 'milestone');
  };

  // Save Session Reflection
  const handleSaveReflection = (newRef: Omit<SessionReflection, 'id' | 'timestamp'>) => {
    const reflection: SessionReflection = {
      ...newRef,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    const updated = [reflection, ...reflections];
    setReflections(updated);
    saveLocalReflections(updated);

    // Update latest session with energy_after
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        energy_after: reflection.energyLevel,
      };
      saveLocalSessions(copy);
      return copy;
    });

    addAlert('Reflection Recorded', `Energy rating ${reflection.energyLevel}/5 saved for "${reflection.taskName}"`, 'milestone');
  };

  const handleLogBreakAdherence = (taken: boolean) => {
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        break_scheduled: true,
        break_taken: taken,
      };
      saveLocalSessions(copy);
      return copy;
    });
    addAlert('Break Adherence Logged', taken ? 'Recorded: Break Taken ✓' : 'Recorded: Break Skipped ✕', 'milestone');
  };

  // 1-Click Science-Backed Focus Protocol Activation
  const handleSelectProtocol = (proto: FocusProtocol) => {
    setIsRunning(false);
    setSettings((prev) => ({
      ...prev,
      focusDurationMinutes: proto.focusMinutes,
      shortBreakMinutes: proto.breakMinutes,
    }));
    setTotalSeconds(proto.focusMinutes * 60);
    setRemainingSeconds(proto.focusMinutes * 60);
    setMode('focus');
    addAlert(
      `${proto.name} Activated`,
      `${proto.focusMinutes}m Focus + ${proto.breakMinutes}m Break. ${proto.description}`,
      'milestone'
    );
  };

  // Goals & Deadlines Handlers
  const handleAddGoal = (newGoalData: Omit<GoalItem, 'id' | 'createdAt' | 'completed'>) => {
    const newGoal: GoalItem = {
      ...newGoalData,
      id: 'g-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setGoals((prev) => [newGoal, ...prev]);
    playToggleTick();
    addAlert('🎯 Goal Created', `"${newGoal.title}" added with deadline at ${newGoal.deadlineTime}.`, 'milestone');
  };

  const handleUpdateGoal = (updatedGoal: GoalItem) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
    playToggleTick();
    addAlert('Goal Updated', `"${updatedGoal.title}" settings saved.`, 'milestone');
  };

  const handleToggleGoalComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextCompleted = !g.completed;
          if (nextCompleted) {
            playCompletionFanfare();
            addAlert('🏆 Goal Achieved!', `Great work! "${g.title}" marked as complete.`, 'goal_completed');
          } else {
            playToggleTick();
            addAlert('Goal Reopened', `"${g.title}" marked active.`, 'milestone');
          }
          return {
            ...g,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    playToggleTick();
    addAlert('Goal Removed', 'Goal deleted from tracker.', 'milestone');
  };

  const handleSelectGoalAsTask = (goalTitle: string, targetMinutes?: number) => {
    setActiveTaskName(goalTitle);
    saveLocalActiveTask(goalTitle);
    if (targetMinutes && targetMinutes > 0) {
      const secs = targetMinutes * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
    }
    playToggleTick();
    addAlert('Focus Target Set', `Now studying for goal: "${goalTitle}"`, 'milestone');
    const timerCard = document.getElementById('focus-time-main-card');
    if (timerCard) {
      timerCard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTriggerTestReminder = (goal: GoalItem) => {
    playMilestoneChime();
    addAlert(
      `🔔 Test Reminder: ${goal.title}`,
      `Scheduled for ${goal.deadlineDate} at ${goal.deadlineTime} (${goal.reminderLeadTime.replace('_', ' ')} before deadline). Reminder alert is active!`,
      'goal_completed'
    );
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      } else if (Notification.permission === 'granted') {
        try {
          new Notification(`Goal Reminder: ${goal.title}`, {
            body: `Deadline is ${goal.deadlineDate} at ${goal.deadlineTime}.`,
            icon: '/sandclock.svg',
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const isLight = settings.themeMode === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f4f7fb] text-slate-800' : 'bg-[#030712] text-slate-100'} flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 relative overflow-x-hidden font-['Plus_Jakarta_Sans'] ${isLight ? 'selection:bg-cyan-500/30 selection:text-cyan-900' : 'selection:bg-cyan-500/30 selection:text-cyan-200'}`}>
      {/* Atmospheric Ambient Glows */}
      {isLight ? (
        <>
          <div className="fixed top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-sky-400/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="fixed bottom-10 right-10 w-[550px] h-[550px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.35] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="fixed top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-b from-sky-600/10 via-cyan-700/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
          <div className="fixed bottom-10 right-10 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.12] pointer-events-none" />
        </>
      )}

      {/* Top PC Webpage Header & Navigation Bar */}
      <header className={`w-full max-w-7xl mx-auto mb-5 p-3.5 sm:p-4 rounded-3xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 ${
        isLight
          ? 'bg-white/95 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] text-slate-900'
          : 'bg-[#061022]/85 border border-sky-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-slate-100'
      }`}>
        {/* Brand Container with Hamburger Menu (Phone) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu Button (Phone version) */}
          <button
            type="button"
            onClick={() => setIsCommandDeckOpen(!isCommandDeckOpen)}
            className={`sm:hidden p-2.5 rounded-2xl border flex items-center justify-center transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-[#061022] border-sky-500/25 text-cyan-400 hover:text-white hover:border-cyan-400'
            }`}
            title="Open Command Deck"
          >
            {isCommandDeckOpen ? (
              <X className="w-5 h-5 transition-transform duration-200" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsInitiating(true)}
            className="w-11 h-11 rounded-2xl bg-black border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] overflow-hidden shrink-0 group cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 select-none"
            title="OC Sand Clock (Click to replay system initiation)"
          >
            <img
              src="/sandclock.svg"
              alt="OC Sand Clock Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg sm:text-xl tracking-wider font-['Plus_Jakarta_Sans'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                OC
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                  : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}>
                Focus Sanctuary
              </span>
            </div>

          </div>
        </div>

        {/* Right Status Badges & Quick Action Controls (Hidden on phone, shown on sm+; actions moved to Command Deck on phone) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Zen Sanctuary Fullscreen Trigger */}
          <button
            type="button"
            onClick={() => setShowZenSanctuary(true)}
            className={`p-2 rounded-xl border transition cursor-pointer shadow-sm ${
              isLight
                ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'bg-gradient-to-r from-sky-900/70 to-cyan-900/70 hover:from-sky-800 hover:to-cyan-800 border border-cyan-500/30 text-cyan-200'
            }`}
            title="Ambient Fullscreen Focus Mode (Zen Study Sanctuary) - Shortcut: F"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </button>

          {/* Floating Dock Restore Button (visible when dock is hidden) */}
          {isFloatingDockHidden && (
            <button
              type="button"
              onClick={handleUndoHideFloatingDock}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition shadow-sm animate-in fade-in ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-[#061022] hover:bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400 text-cyan-300'
              }`}
              title="Restore Floating Mini Timer Dock"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[11px] hidden md:inline">Floating Timer: Hidden (Undo)</span>
              <span className="text-[11px] md:hidden">Dock (Undo)</span>
            </button>
          )}

          {/* Strict Mode / Focus Lock (Anti-Cheat) Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !strictAntiCheatMode;
              setStrictAntiCheatMode(next);
              addAlert(
                next ? 'Anti-Cheat Locked' : 'Anti-Cheat Disabled',
                next ? 'Tab strays will be recorded and penalized.' : 'Tab stray monitoring paused.',
                'anti_cheat'
              );
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              strictAntiCheatMode
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-slate-200'
            }`}
            title={strictAntiCheatMode ? 'Anti-Cheat: Strict (Click to disable)' : 'Anti-Cheat: Off (Click to enable)'}
          >
            <ShieldCheck className={`w-4 h-4 ${strictAntiCheatMode ? 'text-rose-400' : isLight ? 'text-slate-600' : 'text-slate-400'}`} />
          </button>

          {/* Cloud Sync Status */}
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-[#061022] border-sky-500/20 text-sky-300 hover:text-white hover:border-cyan-400'
            }`}
            title={syncState.isOnline ? 'Cloud Sync: Online' : 'Cloud Sync: Offline'}
          >
            {syncState.isOnline ? (
              <Cloud className="w-4 h-4 text-cyan-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Website Blocker Shield */}
          <button
            type="button"
            onClick={() => setShowBlockerModal(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isRunning
                ? isLight
                  ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-sky-300'
            }`}
            title={isRunning ? 'Website Distraction Shield: Active' : 'Website Distraction Shield: Standby'}
          >
            <Shield className="w-4 h-4 text-cyan-500" />
          </button>



          {/* Goals & Deadlines Tracker Button */}
          <button
            type="button"
            onClick={() => {
              if (isClockExpanded) {
                setShowGoalsModal(true);
              } else {
                setDesktopTab('goals');
                const tabsNav = document.getElementById('study-suite-container');
                if (tabsNav) tabsNav.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs transition cursor-pointer ${
              desktopTab === 'goals' && !isClockExpanded
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-[#061022] border-sky-500/20 text-cyan-400 hover:text-white hover:border-cyan-400'
            }`}
            title="Daily, Monthly & Long-Term Goals with Deadlines & Reminders"
          >
            <Target className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-medium">Goals</span>
            {goals.filter((g) => !g.completed).length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                desktopTab === 'goals' && !isClockExpanded
                  ? 'bg-slate-950 text-white'
                  : isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {goals.filter((g) => !g.completed).length}
              </span>
            )}
          </button>

          {/* Productivity Stats */}
          <button
            type="button"
            onClick={() => setShowStatsModal(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-white hover:border-sky-500/40'
            }`}
            title="Productivity Statistics & Performance Trends"
          >
            <BarChart2 className="w-4 h-4 text-cyan-500" />
          </button>

          {/* Workflow Modes: Extend & Restore */}
          <button
            type="button"
            onClick={() => setShowExtendRestoreModal(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-white hover:border-sky-500/40'
            }`}
            title="Extend Flow / Restore Session"
          >
            <History className="w-4 h-4 text-emerald-500" />
          </button>

          {/* Global System Reset Button */}
          <button
            type="button"
            onClick={() => setShowSystemResetModal(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-slate-200'
                : 'bg-[#061022] border-rose-500/20 text-rose-400 hover:text-rose-300 hover:border-rose-500/50'
            }`}
            title="System Reset (Restore all settings and data to factory default)"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </button>

          {/* Quick Day / Night Theme Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-[#061022] border-sky-500/20 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/40'
            }`}
            title={isLight ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Settings Section Button (Change Password, Day/Light Mode, Sync) */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                : 'bg-[#061022] border-sky-500/20 text-slate-300 hover:text-white hover:border-cyan-400/40'
            }`}
            title="Settings (Change Password, Day/Light Mode, Multi-Device Auto Sync)"
          >
            <SettingsIcon className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-cyan-400'}`} />
          </button>

          {/* User Account / Multi-Device Sign In Button (At the most right) */}
          {authData.user ? (
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className={`hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isLight
                  ? 'bg-cyan-50 border-cyan-300 text-slate-900 shadow-sm hover:bg-cyan-100'
                  : 'bg-[#061022] border-cyan-500/40 text-white hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              }`}
              title={`Signed in as ${authData.user.email}. Auto-syncing across devices. Click for settings & change password.`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-black text-[11px] flex items-center justify-center uppercase shadow-sm">
                {authData.user.name ? authData.user.name[0] : 'U'}
              </div>
              <span className="truncate max-w-[120px]">{authData.user.name}</span>
              <span 
                className={`w-2 h-2 rounded-full ${isAccountSyncing ? 'bg-cyan-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`} 
                title={isAccountSyncing ? 'Synchronizing with cloud...' : 'Auto-synced across devices'} 
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalInitialMode('login');
                setIsAuthModalOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:brightness-105 active:scale-95 transition cursor-pointer"
              title="Sign in or create account for multi-device auto sync"
            >
              <LogInIcon className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>
      </header>

      {/* Main PC Webpage Layout */}
      <div className={`w-full max-w-7xl mx-auto ${isClockExpanded ? 'flex flex-col items-center justify-center py-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start'} transition-all duration-300`}>
        
        {/* The Focus Time Card from image.png (Centered on page when expanded) */}
        <div className={`${isClockExpanded ? 'w-full max-w-[460px] flex flex-col items-center' : 'lg:col-span-5 flex flex-col items-center w-full'} transition-all duration-300`}>
          <main 
            id="focus-time-main-card"
            className={`w-full ${isClockExpanded ? 'max-w-[460px] shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-cyan-500/35' : 'max-w-[440px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-sky-500/20'} rounded-[2.5rem] ${isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xl' : 'bg-[#081326]/95 border-sky-500/20 text-slate-100'} backdrop-blur-2xl border p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between transition-all duration-300`}
          >
            {/* Subtle internal gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none" />

            {/* 1. Header: Title & Subtitle + Expand/Restore Option & Date Dropdown */}
            <div className="flex items-start justify-between relative z-10 gap-2">
              <div className="min-w-0 pr-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h1 className={`text-xl sm:text-[26px] font-extrabold tracking-tight leading-tight shrink-0 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Focus Time
                  </h1>
                  {isClockExpanded && (
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center ${
                      isLight
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      Enlarged Clock
                    </span>
                  )}
                </div>

              </div>

              {/* Action Buttons: Expand / Restore & Date Filter */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Expand / Restore Button */}
                <button
                  type="button"
                  onClick={() => setIsClockExpanded(!isClockExpanded)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-[#0d203e]/90 hover:bg-[#132d56] border-cyan-500/30 text-cyan-300'
                  }`}
                  title={isClockExpanded ? 'Restore clock to normal size' : 'Expand focus clock'}
                >
                  {isClockExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restore Size</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>

                {/* "Today ⌵" Dropdown Pill Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    id="period-dropdown-button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        : 'bg-[#0d203e]/90 hover:bg-[#132d56] border-sky-500/25 text-sky-200'
                    }`}
                  >
                    <span>{dateFilter}</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-sky-400'}`} />
                  </button>

                  {showFilterDropdown && (
                    <div className={`absolute right-0 mt-2 w-32 rounded-xl border shadow-2xl py-1 z-30 text-xs ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50' : 'bg-[#091833] border-sky-500/30 text-slate-200 shadow-2xl'
                    }`}>
                      {(['Today', 'Yesterday', 'This Week'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            setDateFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer ${
                            dateFilter === filter
                              ? isLight ? 'text-cyan-800 font-bold bg-cyan-50' : 'text-cyan-300 font-bold bg-sky-500/10'
                              : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-sky-500/20 text-slate-300'
                          }`}
                        >
                          {filter}
                          {dateFilter === filter && <CheckCircle className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Work & Break Quick Segmented Switcher */}
            <div className={`my-3 flex items-center p-1 rounded-xl border relative z-10 ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#061022] border-sky-500/15'
            }`}>
              <button
                type="button"
                onClick={() => handleSwitchMode('focus')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎯 Focus ({Math.floor(settings.focusDurationMinutes)}m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('short_break')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'short_break'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ☕ Break (5m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('long_break')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'long_break'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌴 Long (15m)
              </button>
            </div>

            {mode !== 'focus' && (
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 my-2 relative z-10 ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold">Scheduled Break: Did you take it?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLogBreakAdherence(true)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition cursor-pointer shadow-sm"
                  >
                    Take Break ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogBreakAdherence(false)}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                      isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Skip ✕
                  </button>
                </div>
              </div>
            )}

            {/* EDITABLE TASK NAME (Explicitly requested by user!) */}
            <div className="mb-2 relative z-10">
              {isEditingTaskInline ? (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-cyan-500' : 'bg-[#061022] border-cyan-400'
                }`}>
                  <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                  <input
                    type="text"
                    value={tempTaskName}
                    onChange={(e) => setTempTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveInlineTask();
                      if (e.key === 'Escape') setIsEditingTaskInline(false);
                    }}
                    placeholder="Enter study task name..."
                    className={`flex-1 bg-transparent text-xs font-semibold focus:outline-none ${
                      isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveInlineTask}
                    className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setTempTaskName(activeTaskName);
                    setIsEditingTaskInline(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 text-xs group cursor-pointer py-1 px-2 rounded-lg transition ${
                    isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-sky-200 hover:text-white hover:bg-sky-500/10'
                  }`}
                  title="Click to enter or edit task name"
                >
                  <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>TASK:</span>
                  <span className={`font-semibold truncate max-w-[240px] underline decoration-dashed underline-offset-4 transition ${
                    isLight ? 'text-slate-900 decoration-cyan-600/50 group-hover:text-cyan-700' : 'text-slate-200 decoration-sky-500/40 group-hover:text-cyan-200'
                  }`}>
                    {activeTaskName || 'TASK'}
                  </span>
                  <Edit2 className={`w-3 h-3 transition ${isLight ? 'text-cyan-700 opacity-70 group-hover:opacity-100' : 'text-cyan-400 opacity-60 group-hover:opacity-100'}`} />
                </div>
              )}
            </div>



            {/* 2. Prominent Circular Countdown Timer Dial (Exact Match to Image) */}
            <div className="my-1 relative z-10 flex justify-center">
              <CircularTimer
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                isRunning={isRunning}
                mode={mode}
                onToggle={handleToggleTimer}
                onSetCustomDuration={handleSetCustomDuration}
                size={isClockExpanded ? 380 : 310}
                isExpanded={isClockExpanded}
                onToggleExpand={() => setIsClockExpanded(!isClockExpanded)}
                onEnterZenMode={() => setShowZenSanctuary(true)}
                isLight={isLight}
              />
            </div>

            {/* 3. Action Buttons (Pause / Start & Reset - Right Under Clock) */}
            <div className="mt-3 grid grid-cols-2 gap-3 relative z-10">
              <button
                type="button"
                id="timer-primary-toggle-button"
                onClick={handleToggleTimer}
                className="py-3 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="timer-reset-button"
                onClick={handleReset}
                className={`py-3 px-6 rounded-full active:scale-[0.98] border font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-[#0a1832]/90 hover:bg-[#0f244c] border-[#1b3a69] hover:border-sky-500/40 text-sky-200 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Quick Flow booster bar */}
            <div className={`mt-2.5 flex items-center justify-between text-[11px] px-1 relative z-10 ${
              isLight ? 'text-slate-600' : 'text-sky-300/60'
            }`}>
              <button
                type="button"
                onClick={() => handleExtend(5)}
                className={`transition flex items-center gap-1 cursor-pointer font-medium ${
                  isLight ? 'hover:text-cyan-700 text-slate-700' : 'hover:text-cyan-300'
                }`}
              >
                <Plus className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                +5m Extend
              </button>
              <button
                type="button"
                onClick={() => handleExtend(10)}
                className={`transition flex items-center gap-1 cursor-pointer font-medium ${
                  isLight ? 'hover:text-cyan-700 text-slate-700' : 'hover:text-cyan-300'
                }`}
              >
                <Plus className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                +10m Extend
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!savedSnapshot}
                className={`transition flex items-center gap-1 cursor-pointer font-medium ${
                  savedSnapshot
                    ? isLight ? 'hover:text-emerald-700 text-emerald-600' : 'hover:text-emerald-300 text-emerald-400/80'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <History className="w-3 h-3" />
                Restore Session
              </button>
            </div>

            {/* 4. Goal Progress Bar Component (Daily Productivity Goal Tracker) */}
            <div className="mt-4 relative z-10">
              <GoalProgressBar
                currentMinutes={todayFocusMinutes}
                goalMinutes={settings.dailyGoalMinutes}
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                isFocusMode={mode === 'focus'}
                isLight={isLight}
                onOpenGoals={() => {
                  if (isClockExpanded) {
                    setShowGoalsModal(true);
                  } else {
                    setDesktopTab('goals');
                    const tabsNav = document.getElementById('study-suite-container');
                    if (tabsNav) tabsNav.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                activeGoalsCount={goals.filter((g) => !g.completed).length}
              />
            </div>

            {/* 5. Productivity Flow Graph with Live Data & Interactive Hours */}
            <div className="mt-5 relative z-10">
              <ProductivityChart
                sessions={sessions}
                activeDateFilter={dateFilter}
                isLight={isLight}
              />
            </div>
          </main>
        </div>

        {/* RIGHT COLUMN: PC Webpage Expansive Study Suite (Columns 6-12 on Desktop) */}
        {!isClockExpanded && (
          <div id="study-suite-container" className="lg:col-span-7 flex flex-col gap-6 w-full animate-in fade-in duration-200">
          
          {/* CONSOLIDATED 4 CLEAN TABS SELECTOR */}
          <nav aria-label="Study Suite Views" className={`p-1.5 rounded-2xl backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 shadow-lg ${isLight ? 'bg-white/90 border border-slate-200 shadow-slate-200/50' : 'bg-[#081326]/90 border border-sky-500/20'}`}>
            <button
              type="button"
              onClick={() => setDesktopTab('workspace')}
              className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                desktopTab === 'workspace'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Tasks</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${desktopTab === 'workspace' ? 'bg-slate-950/20 text-slate-900 font-bold' : isLight ? 'bg-slate-100 text-slate-700 font-medium' : 'bg-slate-800 text-slate-400'}`}>
                {tasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopTab('goals')}
              className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                desktopTab === 'goals'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="truncate">Goals</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${desktopTab === 'goals' ? 'bg-slate-950/20 text-slate-900 font-bold' : isLight ? 'bg-cyan-100 text-cyan-800 font-bold' : 'bg-cyan-950/80 text-cyan-300 font-bold'}`}>
                {goals.filter((g) => !g.completed).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopTab('insights')}
              className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                desktopTab === 'insights'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Insights</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${desktopTab === 'insights' ? 'bg-slate-950/20 text-slate-900 font-bold' : isLight ? 'bg-slate-100 text-slate-700 font-medium' : 'bg-slate-800 text-slate-400'}`}>
                {reflections.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopTab('protocols_shield')}
              className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                desktopTab === 'protocols_shield'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Protocols</span>
            </button>
          </nav>

          {/* PC Desktop Content Panel */}
          <div className={`p-5 sm:p-6 rounded-3xl backdrop-blur-2xl shadow-xl min-h-[480px] flex flex-col justify-between border ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
              : 'bg-[#081326]/90 border-sky-500/20 text-slate-100'
          }`}>
            
            {/* VIEW 1: Workspace & Tasks (Tasks + Flow Audio Visualizer) */}
            {desktopTab === 'workspace' && (
              <div className="space-y-6">
                {/* Academic Task List */}
                <div>
                  <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
                    isLight ? 'border-slate-200' : 'border-sky-500/15'
                  }`}>
                    <div>
                      <h2 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <BookOpen className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                        Academic Task List & Checklist
                      </h2>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                        Select any task to set it as active focus task, or edit directly.
                      </p>
                    </div>
                    <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                      isLight
                        ? 'text-cyan-800 bg-cyan-50 border-cyan-200 font-semibold'
                        : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'
                    }`}>
                      {activeTaskName ? `Active: ${activeTaskName}` : 'TASK'}
                    </span>
                  </div>

                  {/* Search Task Bar */}
                  <div className="relative mb-4">
                    <Search className={`w-3.5 h-3.5 absolute left-3 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search task..."
                      className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-400 transition ${
                        isLight
                          ? 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'
                          : 'bg-[#061022] border border-sky-500/20 text-white placeholder-slate-500'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <TaskManager
                    tasks={tasks.filter(t => (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.tags && t.tags.some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()))))}
                    activeTaskName={activeTaskName}
                    onSelectActiveTask={(name) => {
                      setActiveTaskName(name);
                      addAlert('Active Task Changed', `Switched focus to "${name}"`, 'milestone');
                    }}
                    onUpdateActiveTaskName={(newName) => {
                      setActiveTaskName(newName);
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.name.toLowerCase() === activeTaskName.toLowerCase()
                            ? { ...t, name: newName }
                            : t
                        )
                      );
                      addAlert('Task Renamed', `Task name updated to "${newName}"`, 'milestone');
                    }}
                    onAddTask={handleAddTask}
                    onToggleTaskComplete={handleToggleTaskComplete}
                    onDeleteTask={handleDeleteTask}
                    isLight={isLight}
                  />
                </div>

                {/* Embedded Ambient Sound Engine & Wave Visualizer */}
                <div className={`pt-3 border-t ${isLight ? 'border-slate-200' : 'border-sky-500/15'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <Headphones className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                        Ambient Audio & Binaural Soundscape
                      </h3>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                        Binaural beats, ambient noise layers, or insert custom audio streams with live visualizer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowZenSanctuary(true)}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                        isLight
                          ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                          : 'bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zen Mode</span>
                    </button>
                  </div>

                  <AmbientSoundPlayer isTimerRunning={isRunning} compact={true} isLight={isLight} />
                </div>
              </div>
            )}

            {/* VIEW 2: Goals & Milestones (Daily, Monthly, Long-Term with Deadlines & Reminders) */}
            {desktopTab === 'goals' && (
              <GoalsSection
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onToggleGoalComplete={handleToggleGoalComplete}
                onDeleteGoal={handleDeleteGoal}
                onSelectGoalAsTask={handleSelectGoalAsTask}
                onTriggerTestReminder={handleTriggerTestReminder}
                isLight={isLight}
              />
            )}

            {/* VIEW 3: Insights & Reflections (Hourly Chart + Metrics + Energy Journal) */}
            {desktopTab === 'insights' && (
              <div className="space-y-5">
                {/* Summary Metric Badges */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className={`p-3 rounded-2xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                  }`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-sky-300/70'}`}>Today's Focus</div>
                    <div className={`text-xl font-bold font-mono mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {todayFocusMinutes}<span className={`text-xs font-normal ${isLight ? 'text-cyan-700' : 'text-sky-400'}`}>m</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                  }`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-sky-300/70'}`}>Sessions</div>
                    <div className={`text-xl font-bold font-mono mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {todaySessionCount}
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                  }`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-sky-300/70'}`}>Shielded Blocks</div>
                    <div className={`text-xl font-bold font-mono mt-0.5 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                      {distractionCount}
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                  }`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-sky-300/70'}`}>Reflections</div>
                    <div className={`text-xl font-bold font-mono mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                      {reflections.length}
                    </div>
                  </div>
                </div>

                {/* Monthly Activity Line Chart */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                }`}>
                  <div className={`text-xs font-bold mb-2 flex items-center justify-between ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <BarChart2 className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                      Monthly Activity → Line Chart
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStatsModal(true)}
                      className={`text-[11px] hover:underline cursor-pointer ${
                        isLight ? 'text-cyan-700 font-semibold' : 'text-cyan-400'
                      }`}
                    >
                      Detailed Analytics →
                    </button>
                  </div>
                  <FocusHoursChart
                    sessions={sessions}
                    isLight={isLight}
                  />
                </div>

                {/* Daily Study Streak & Habit Heatmap */}
                <HabitHeatmap sessions={sessions} isLight={isLight} />

                {/* Energy Journaling & Session Reflections */}
                <div className="pt-2">
                  <div className={`flex items-center justify-between pb-2 mb-3 border-b ${
                    isLight ? 'border-slate-200' : 'border-sky-500/15'
                  }`}>
                    <div>
                      <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                        Session Reflections & Energy Journal
                      </h3>
                      <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                        Subjective energy ratings (1-5), accomplishments, and study notes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReflectionModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Log Reflection</span>
                    </button>
                  </div>

                  {reflections.length === 0 ? (
                    <div className={`text-center py-6 rounded-2xl border space-y-1.5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                    }`}>
                      <Sparkles className={`w-6 h-6 mx-auto ${isLight ? 'text-cyan-700' : 'text-cyan-400/50'}`} />
                      <p className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>No reflections recorded yet</p>
                      <p className={`text-[10px] max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Complete a focus session or click "Log Reflection" to log mental focus and energy metrics.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {reflections.map((ref) => (
                        <div
                          key={ref.id}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                              : 'bg-[#061022] border-sky-500/20 hover:border-cyan-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-xs flex items-center gap-1.5 ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}>
                              <BookOpen className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                              {ref.taskName}
                            </span>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold text-[10px] ${
                              isLight
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                                : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
                            }`}>
                              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              <span>Energy: {ref.energyLevel}/5</span>
                            </div>
                          </div>
                          {ref.notes && (
                            <p className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-700'
                                : 'bg-[#040914] border-slate-800 text-slate-300'
                            }`}>
                              {ref.notes}
                            </p>
                          )}
                          <div className={`flex items-center justify-between text-[9px] ${
                            isLight ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            <div className="flex items-center gap-1">
                              {ref.tags?.map((tag) => (
                                <span key={tag} className={`px-1.5 py-0.2 rounded-full font-mono ${
                                  isLight ? 'bg-slate-200 text-slate-800 font-semibold' : 'bg-slate-800 text-sky-300'
                                }`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span>
                              {new Date(ref.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ref.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: Protocols & Shield (Science Protocols + Custom Slider + Website Blocker + Anti-Cheat) */}
            {desktopTab === 'protocols_shield' && (
              <div className="space-y-5">
                {/* 1-Click Science Protocols */}
                <FocusProtocolsCard
                  currentFocusMinutes={Math.floor(totalSeconds / 60)}
                  onSelectProtocol={handleSelectProtocol}
                  isLight={isLight}
                />

                {/* Custom Duration Slider */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold flex items-center gap-1.5 ${
                      isLight ? 'text-slate-900' : 'text-slate-200'
                    }`}>
                      <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                      Custom Duration Slider
                    </span>
                    <span className={`font-bold font-mono text-sm ${
                      isLight ? 'text-cyan-800' : 'text-cyan-400'
                    }`}>
                      {Math.floor(totalSeconds / 60)} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={Math.floor(totalSeconds / 60)}
                    onChange={(e) => handleSetCustomDuration(Number(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      isLight ? 'bg-slate-200 accent-cyan-600' : 'bg-slate-800 accent-cyan-400'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] font-mono ${
                    isLight ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    <span>5m</span>
                    <span>25m (Pomodoro)</span>
                    <span>50m (OC)</span>
                    <span>90m (Ultradian)</span>
                    <span>120m</span>
                  </div>
                </div>

                {/* Student Distraction Shield & Anti-Cheat */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                }`}>
                  <div className={`flex items-center justify-between pb-2 border-b ${
                    isLight ? 'border-slate-200' : 'border-sky-500/15'
                  }`}>
                    <div>
                      <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <ShieldAlert className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                        Student Distraction Shield & Focus Lock
                      </h3>
                      <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                        Blocks distracting websites and logs tab switches while studying.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateBlock('youtube.com')}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-semibold cursor-pointer ${
                        isLight
                          ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300'
                      }`}
                    >
                      Test Shield
                    </button>
                  </div>

                  <WebsiteBlocker
                    blockedSites={blockedSites}
                    onToggleSite={handleToggleBlockedSite}
                    onAddSite={handleAddBlockedSite}
                    onRemoveSite={handleRemoveBlockedSite}
                    isTimerRunning={isRunning && mode === 'focus'}
                    onSimulateBlock={handleSimulateBlock}
                    distractionCount={distractionCount}
                    distractionLog={distractionLog}
                    onClearDistractionLog={handleClearDistractionLog}
                    isLight={isLight}
                  />
                </div>
              </div>
            )}

            {/* Desktop PC Footer Bar with Shortcuts */}
            <div className={`pt-4 border-t flex flex-wrap items-center justify-between text-[11px] mt-4 ${
              isLight ? 'border-slate-200 text-slate-600' : 'border-sky-500/10 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <span>PC Keyboard Shortcuts:</span>
                <span className={`font-mono border px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#061022] border-sky-500/20 text-sky-300'
                }`}>Space</span> Play/Pause
                <span className={`font-mono border px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#061022] border-sky-500/20 text-sky-300'
                }`}>R</span> Reset
                <span className={`font-mono border px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#061022] border-sky-500/20 text-sky-300'
                }`}>E</span> +5m
              </div>
              <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Auto-saved to local offline storage & cloud</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {/* 1. Website Blocker Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#08152c] border-sky-500/25 text-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-sky-500/15'
            }`}>
              <div className={`flex items-center gap-2 font-bold text-base ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Shield className={`w-5 h-5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Student Distraction Blocker
              </div>
              <button
                onClick={() => setShowBlockerModal(false)}
                className={`text-xs px-2 py-1 rounded-lg cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <WebsiteBlocker
                blockedSites={blockedSites}
                onToggleSite={handleToggleBlockedSite}
                onAddSite={handleAddBlockedSite}
                onRemoveSite={handleRemoveBlockedSite}
                isTimerRunning={isRunning && mode === 'focus'}
                onSimulateBlock={handleSimulateBlock}
                distractionCount={distractionCount}
                distractionLog={distractionLog}
                onClearDistractionLog={handleClearDistractionLog}
                isLight={isLight}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Blocked Site Screen Simulator */}
      <BlockedSiteModal
        isOpen={Boolean(simulatedBlockedDomain)}
        domain={simulatedBlockedDomain || ''}
        remainingSeconds={remainingSeconds}
        onClose={() => setSimulatedBlockedDomain(null)}
        onEmergencyBypass={() => {
          setSimulatedBlockedDomain(null);
          addAlert('60s Bypass Activated', 'Remember to return to your study material after checking.', 'milestone');
        }}
        isLight={isLight}
      />

      {/* 3. Extend and Restore Mode Modal */}
      <ExtendRestoreModal
        isOpen={showExtendRestoreModal}
        onClose={() => setShowExtendRestoreModal(false)}
        onExtend={handleExtend}
        onRestore={handleRestore}
        hasSavedSnapshot={Boolean(savedSnapshot)}
        lastSnapshot={savedSnapshot}
        remainingSeconds={remainingSeconds}
        isLight={isLight}
      />

      {/* 4. Cross-Device Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncState={syncState}
        onTriggerSync={handleTriggerSync}
        onUpdateSyncCode={handleUpdateSyncCode}
        offlineQueueCount={offlineQueueCount}
        isLight={isLight}
      />

      {/* 5. Statistics & Productivity Dashboard Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        sessions={sessions}
        goalMinutes={settings.dailyGoalMinutes}
        distractionCount={distractionCount}
        blockedSites={blockedSites}
        distractionLog={distractionLog}
        isLight={isLight}
      />

      {/* 6. Milestone & Celebration Notification Toast */}
      <NotificationToast
        alerts={alerts}
        onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
      />

      {/* 7. Ambient Fullscreen "Focus Mode" (Zen Study Sanctuary) */}
      <ZenSanctuaryModal
        isOpen={showZenSanctuary}
        onClose={() => setShowZenSanctuary(false)}
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isRunning={isRunning}
        mode={mode}
        activeTaskName={activeTaskName}
        onToggleTimer={handleToggleTimer}
        onReset={handleReset}
        onExtend={handleExtend}
        onSetCustomDuration={handleSetCustomDuration}
        strictAntiCheatMode={strictAntiCheatMode}
        isLight={isLight}
      />

      {/* 8. Strict Mode / Focus Lock (Anti-Cheat Protection Modal) */}
      <AntiCheatModal
        isOpen={showAntiCheatModal}
        onClose={() => setShowAntiCheatModal(false)}
        strayDurationSeconds={strayDurationSeconds}
        totalViolationsCount={totalViolationsCount}
        currentTaskName={activeTaskName}
        isLight={isLight}
      />

      {/* 9. Global System Reset Confirmation Modal */}
      <SystemResetModal
        isOpen={showSystemResetModal}
        onClose={() => setShowSystemResetModal(false)}
        onConfirmReset={handleConfirmSystemReset}
        isLight={isLight}
      />

      {/* 10. Study Session Reflection & Energy Journaling Modal */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        currentTaskName={activeTaskName}
        sessionMinutes={Math.max(1, Math.round(totalSeconds / 60))}
        onSave={handleSaveReflection}
        isLight={isLight}
      />

      {/* 11. Mini Floating Picture-in-Picture Sticky Timer with Hide & Undo */}
      {!isFloatingDockHidden && (
        <MiniFloatingTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          mode={mode}
          activeTaskName={activeTaskName}
          onToggleTimer={handleToggleTimer}
          onExtend={handleExtend}
          onUndoExtend={handleUndoExtend}
          canUndoExtend={!!lastExtensionMinutes}
          onOpenZen={() => setShowZenSanctuary(true)}
          onHide={handleHideFloatingDock}
          isLight={isLight}
        />
      )}

      {/* 12. Authentication Modal (Sign In / Sign Up for New & Existing Users) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(user, token) => {
          setAuthData({ user, token });
          setIsAuthModalOpen(false);
          pullAccountSync(token, false);
          addAlert('Account Connected', `Welcome, ${user.name}! Workspace synchronized across your devices.`, 'milestone');
        }}
        isLight={isLight}
      />

      {/* 13. System Settings Modal (Change Password, Day/Light Mode, Multi-Device Auto Sync) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => {
          setSettings(updated);
          saveLocalSettings(updated);
        }}
        currentUser={authData.user}
        authToken={authData.token}
        onOpenAuthModal={(mode) => {
          setIsSettingsModalOpen(false);
          setAuthModalInitialMode(mode);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        lastSyncedAt={lastAccountSyncedAt}
        isSyncing={isAccountSyncing}
        onTriggerSync={handleTriggerAccountSync}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        isLight={isLight}
      />

      <AmbientSoundModal
        isOpen={isAmbientModalOpen}
        onClose={() => setIsAmbientModalOpen(false)}
        isLight={isLight}
      />

      {/* Goals & Milestones Modal (Quick popup access when clock is expanded) */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-3xl border shadow-2xl ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#08152c] border-sky-500/25 text-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
              isLight ? 'border-slate-200' : 'border-sky-500/15'
            }`}>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Goals & Deadlines Sanctuary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGoalsModal(false)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✕ Close
              </button>
            </div>
            <GoalsSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onToggleGoalComplete={handleToggleGoalComplete}
              onDeleteGoal={handleDeleteGoal}
              onSelectGoalAsTask={(name, mins) => {
                handleSelectGoalAsTask(name, mins);
                setShowGoalsModal(false);
              }}
              onTriggerTestReminder={handleTriggerTestReminder}
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {/* 0. System Initiate Splash Screen (Shows user golden hourglass logo for ~1 second, then enters app) */}
      {isInitiating && (
        <SystemInitiateSplash onComplete={handleInitiateComplete} />
      )}

      {/* Floating Timer Hidden Status Toast with Immediate Undo */}
      {isFloatingDockHidden && showHideUndoToast && (
        <aside
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-40 select-none flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-300 ${
            isLight
              ? 'bg-[#edf5f7] border-slate-300 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.15)]'
              : 'bg-[#061022]/95 border-cyan-500/40 text-white shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-500'}`} />
            <span className={`text-xs font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Floating dock hidden</span>
          </div>

          <button
            type="button"
            onClick={handleUndoHideFloatingDock}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs cursor-pointer transition shadow-sm ${
              isLight
                ? 'bg-cyan-500 hover:bg-cyan-400 border-cyan-500 text-slate-950'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300'
            }`}
            title="Restore Floating Timer"
          >
            <RotateCcw className="w-3 h-3" />
            Undo
          </button>

          <button
            type="button"
            onClick={() => setShowHideUndoToast(false)}
            className={`p-1 rounded-md transition cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Command Deck Sidebar (Phone Version Slide-out) */}
      {isCommandDeckOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCommandDeckOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className={`relative w-[85vw] max-w-sm h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 ${
            isLight ? 'bg-white text-slate-900 border-r border-slate-200' : 'bg-[#061022] text-slate-100 border-r border-sky-500/20'
          }`}>
            {/* Deck Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-sky-500/15 bg-[#08152c]'
            }`}>
              <div>
                <h2 className="font-extrabold text-base tracking-tight">Command Deck</h2>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-sky-200/60'}`}>
                  OC Sanctuary Quick Controls
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCommandDeckOpen(false)}
                className={`p-1.5 rounded-lg border ${
                  isLight ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-300'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deck Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Section 1: This session */}
              <div className="space-y-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                  isLight ? 'text-slate-400' : 'text-sky-400/70'
                }`}>
                  This session
                </div>
                
                <div className="space-y-1.5">
                  {/* Smart suggestions / Zen Sanctuary */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setShowZenSanctuary(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Smart suggestions</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Zen sanctuary mode</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Focus shield */}
                  <div 
                    onClick={() => {
                      const next = !strictAntiCheatMode;
                      setStrictAntiCheatMode(next);
                      addAlert(next ? 'Anti-Cheat Locked' : 'Anti-Cheat Disabled', next ? 'Tab strays will be recorded.' : 'Paused.', 'anti_cheat');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                        strictAntiCheatMode ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Focus shield</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Blocks alerts while running</div>
                      </div>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition p-0.5 ${strictAntiCheatMode ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${strictAntiCheatMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Ambient sound */}
                  <div 
                    onClick={() => {
                      setIsCommandDeckOpen(false);
                      setShowZenSanctuary(true);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Ambient sound</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Binaural beats & rain soundscapes
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Distraction blocker */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setShowBlockerModal(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Distraction blocker</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Shield: {isRunning ? 'Active' : 'Standby'}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Daily target */}
                  <div 
                    onClick={() => {
                      setIsCommandDeckOpen(false);
                      if (isClockExpanded) {
                        setShowGoalsModal(true);
                      } else {
                        setDesktopTab('goals');
                        const tabsNav = document.getElementById('study-suite-container');
                        if (tabsNav) tabsNav.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Daily target</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {goals.filter((g) => g.completed).length} of {Math.max(1, goals.length)} completed
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      {goals.filter((g) => !g.completed).length} active
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Looking back */}
              <div className="space-y-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                  isLight ? 'text-slate-400' : 'text-sky-400/70'
                }`}>
                  Looking back
                </div>
                
                <div className="space-y-1.5">
                  {/* Statistics */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setShowStatsModal(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Statistics</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Productivity metrics & trends</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Session history */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setShowExtendRestoreModal(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Session history</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {savedSnapshot ? 'Last session saved' : 'No recent session'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Section 3: Sanctuary */}
              <div className="space-y-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${
                  isLight ? 'text-slate-400' : 'text-sky-400/70'
                }`}>
                  Sanctuary
                </div>
                
                <div className="space-y-1.5">
                  {/* Reset the day */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setShowSystemResetModal(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-rose-50' : 'bg-[#091833] border-rose-500/20 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-400">Reset the day</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Restore factory defaults</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400/70" />
                  </div>

                  {/* Appearance */}
                  <div 
                    onClick={toggleThemeMode}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">Appearance</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isLight ? 'Day Mode (Light)' : 'Night Mode (Dark)'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-cyan-300'}`}>
                      {isLight ? 'Light' : 'Dark'}
                    </span>
                  </div>

                  {/* Settings */}
                  <div 
                    onClick={() => { setIsCommandDeckOpen(false); setIsSettingsModalOpen(true); }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-cyan-50' : 'bg-[#091833] border-sky-500/15 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Settings</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Password, auto-sync & preferences</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

            </div>

            {/* Deck Footer (Log In / Sign Up full width) */}
            <div className={`p-4 border-t ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-sky-500/15 bg-[#08152c]'
            }`}>
              {authData.user ? (
                <button
                  type="button"
                  onClick={() => { setIsCommandDeckOpen(false); setIsSettingsModalOpen(true); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-lg bg-slate-950 text-cyan-300 font-black text-[10px] flex items-center justify-center uppercase">
                    {authData.user.name ? authData.user.name[0] : 'U'}
                  </div>
                  <span className="truncate">{authData.user.name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCommandDeckOpen(false);
                    setAuthModalInitialMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Log In / Sign Up
                </button>
              )}
              <div className={`text-[10px] text-center mt-2 ${isLight ? 'text-slate-500' : 'text-sky-200/60'}`}>
                Syncs progress securely across devices
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
