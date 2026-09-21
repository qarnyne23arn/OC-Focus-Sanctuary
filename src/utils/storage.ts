import { AppSettings, BlockedWebsite, StudySession, TaskItem, FocusProtocol, GoalItem } from '../types';

export const FOCUS_PROTOCOLS: FocusProtocol[] = [
  {
    id: 'ultradian',
    name: 'Ultradian Rhythm',
    tagline: '90m Focus + 20m Deep Break',
    focusMinutes: 90,
    breakMinutes: 20,
    iconName: 'flame',
    description: 'Aligned with natural 90-minute human biological ultradian cycles for peak neuro-endurance.',
    recommendedFor: 'Complex software engineering, thesis writing, deep academic problem solving',
  },
  {
    id: 'oc_standard',
    name: 'OC Standard',
    tagline: '50m Focus + 10m Break',
    focusMinutes: 50,
    breakMinutes: 10,
    iconName: 'target',
    description: 'The signature gold-standard cadence balancing deep concentration and cognitive recovery.',
    recommendedFor: 'University courses, STEM problem sets, textbook mastery, exam study blocks',
  },
  {
    id: 'pomodoro',
    name: 'Classic Pomodoro',
    tagline: '25m Focus + 5m Break',
    focusMinutes: 25,
    breakMinutes: 5,
    iconName: 'clock',
    description: 'The renowned interval technique to eliminate procrastination and preserve mental agility.',
    recommendedFor: 'Flashcard drilling, chapter reading, active recall sessions, task completion',
  },
  {
    id: 'sprint',
    name: 'Sprint Burst',
    tagline: '15m Quick Review',
    focusMinutes: 15,
    breakMinutes: 3,
    iconName: 'zap',
    description: 'High-velocity sprint designed for rapid conceptual review and urgent milestone bursts.',
    recommendedFor: 'Formula sheet review, vocabulary decks, pre-exam drill, quick summaries',
  },
];

export const DEFAULT_TASKS: TaskItem[] = [];

export const DEFAULT_BLOCKED_SITES: BlockedWebsite[] = [
  { id: '1', domain: 'youtube.com', name: 'YouTube', category: 'video', enabled: true },
  { id: '2', domain: 'instagram.com', name: 'Instagram', category: 'social', enabled: true },
  { id: '3', domain: 'tiktok.com', name: 'TikTok', category: 'social', enabled: true },
  { id: '4', domain: 'reddit.com', name: 'Reddit', category: 'social', enabled: true },
  { id: '5', domain: 'x.com', name: 'X / Twitter', category: 'social', enabled: true },
  { id: '6', domain: 'netflix.com', name: 'Netflix', category: 'video', enabled: true },
  { id: '7', domain: 'twitch.tv', name: 'Twitch', category: 'video', enabled: true },
  { id: '8', domain: 'discord.com', name: 'Discord', category: 'social', enabled: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  focusDurationMinutes: 45, // 45:00 dial
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  dailyGoalMinutes: 120,    // 2 hours goal
  autoStartBreaks: false,
  soundEnabled: true,
  notificationsEnabled: true,
  strictBlockerMode: true,
  strictAntiCheatMode: true,
  themeMode: 'dark',
};

const STORAGE_KEY_REFLECTIONS = 'oc_focus_reflections_v1';

export function loadLocalReflections(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REFLECTIONS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalReflections(reflections: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REFLECTIONS, JSON.stringify(reflections));
  } catch {
    // Ignore
  }
}

export function performSystemReset(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    localStorage.removeItem('focus_time_sessions_v1');
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem('focus_time_settings_v1');
    localStorage.removeItem(STORAGE_KEY_BLOCKED);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_TASK);
    localStorage.removeItem(STORAGE_KEY_MINI_DOCK_HIDDEN);
    localStorage.removeItem(STORAGE_KEY_SYNC_CODE);
    localStorage.removeItem(STORAGE_KEY_SNAPSHOT);
    localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
    localStorage.removeItem(STORAGE_KEY_REFLECTIONS);
    localStorage.removeItem(STORAGE_KEY_GOALS);
  } catch {
    // Ignore
  }
}

// Formats YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultGoals(): GoalItem[] {
  const today = getTodayDateString();
  const now = new Date();
  
  // End of current month
  const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endOfMonth = `${endOfMonthDate.getFullYear()}-${String(endOfMonthDate.getMonth() + 1).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;
  
  // 90 days from now for long-term
  const longTermDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const longTermStr = `${longTermDate.getFullYear()}-${String(longTermDate.getMonth() + 1).padStart(2, '0')}-${String(longTermDate.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'g-daily-1',
      title: 'Complete 2 Deep Work Focus Sessions',
      description: 'Master today\'s core problem sets with zero distractions.',
      timeframe: 'daily',
      category: 'study',
      deadlineDate: today,
      deadlineTime: '21:00',
      completed: false,
      createdAt: new Date().toISOString(),
      targetMinutes: 90,
      reminderEnabled: true,
      reminderLeadTime: '1h',
    },
    {
      id: 'g-monthly-1',
      title: 'Complete Chapter 4 & 5 Mock Exam Review',
      description: 'Review all formula derivations and practice question banks.',
      timeframe: 'monthly',
      category: 'exam',
      deadlineDate: endOfMonth,
      deadlineTime: '22:00',
      completed: false,
      createdAt: new Date().toISOString(),
      targetMinutes: 300,
      reminderEnabled: true,
      reminderLeadTime: '1d',
    },
    {
      id: 'g-long-1',
      title: 'Pass Semester Final Exams in Top 5%',
      description: 'Consistent daily adherence to Ultradian / Pomodoro study protocols.',
      timeframe: 'long_term',
      category: 'project',
      deadlineDate: longTermStr,
      deadlineTime: '18:00',
      completed: false,
      createdAt: new Date().toISOString(),
      targetMinutes: 1200,
      reminderEnabled: true,
      reminderLeadTime: '1d',
    },
  ];
}

const STORAGE_KEY_GOALS = 'focus_time_goals_v1';

export function loadLocalGoals(): GoalItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    if (!raw) {
      const defaults = getDefaultGoals();
      saveLocalGoals(defaults);
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultGoals();
  }
}

export function saveLocalGoals(goals: GoalItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch {
    // Ignore
  }
}

// Initial sessions start at 0 (empty) as requested
export function getInitialSeedSessions(): StudySession[] {
  return [];
}

const STORAGE_KEY_SESSIONS = 'oc_focus_sessions_v2';
const STORAGE_KEY_SETTINGS = 'oc_focus_settings_v2';
const STORAGE_KEY_BLOCKED = 'focus_time_blocked_sites_v1';
const STORAGE_KEY_SYNC_CODE = 'focus_time_sync_code_v1';
const STORAGE_KEY_SNAPSHOT = 'focus_time_snapshot_v1';
const STORAGE_KEY_OFFLINE_QUEUE = 'focus_time_offline_queue_v1';
const STORAGE_KEY_TASKS = 'focus_time_tasks_v1';
const STORAGE_KEY_ACTIVE_TASK = 'focus_time_active_task_name_v2';
const STORAGE_KEY_MINI_DOCK_HIDDEN = 'focus_time_mini_dock_hidden_v2';
const STORAGE_KEY_DISTRACTION_LOG = 'focus_time_distraction_log_v1';

export function loadLocalDistractionLog(): import('../types').DistractionLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISTRACTION_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDistractionLog(log: import('../types').DistractionLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISTRACTION_LOG, JSON.stringify(log));
  } catch {
    // Ignore
  }
}


export function loadLocalFloatingDockHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_MINI_DOCK_HIDDEN) === 'true';
  } catch {
    return false;
  }
}

export function saveLocalFloatingDockHidden(hidden: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_MINI_DOCK_HIDDEN, hidden ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

export function loadLocalActiveTask(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_TASK);
    return raw !== null ? raw : '';
  } catch {
    return '';
  }
}

export function saveLocalActiveTask(taskName: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TASK, taskName);
  } catch {
    // Ignore
  }
}

export function loadLocalTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) return [];
    const parsed: TaskItem[] = JSON.parse(raw);
    if (parsed.length > 0 && parsed.some(t => t.name === 'Algorithms & Data Structures' || t.name === 'Distributed Systems Architecture')) {
      saveLocalTasks([]);
      return [];
    }
    return parsed.map(t => ({
      ...t,
      priority: t.priority || 'medium'
    }));
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks: TaskItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch {
    // Ignore
  }
}

export function loadLocalSessions(): StudySession[] {
  try {
    // Clear legacy mock sessions if present
    localStorage.removeItem('focus_time_sessions_v1');
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      saveLocalSessions([]);
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalSessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch {
    // Ignore storage quota error
  }
}

export function loadLocalSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS) || localStorage.getItem('focus_time_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure 47 is upgraded to 45 as requested
      if (parsed.focusDurationMinutes === 47) {
        parsed.focusDurationMinutes = 45;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadLocalBlockedSites(): BlockedWebsite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCKED);
    return raw ? JSON.parse(raw) : DEFAULT_BLOCKED_SITES;
  } catch {
    return DEFAULT_BLOCKED_SITES;
  }
}

export function saveLocalBlockedSites(sites: BlockedWebsite[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(sites));
  } catch {
    // Ignore
  }
}

export function loadSyncCode(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_SYNC_CODE) || 'STUDY-8429';
  } catch {
    return 'STUDY-8429';
  }
}

export function saveSyncCode(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_CODE, code);
  } catch {
    // Ignore
  }
}

// Session snapshot for Restore mode
export function saveSessionSnapshot(snapshot: any): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNAPSHOT, JSON.stringify(snapshot));
  } catch {
    // Ignore
  }
}

export function loadSessionSnapshot(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Offline sync queue management
export function queueOfflineSession(session: StudySession): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
    const queue: StudySession[] = raw ? JSON.parse(raw) : [];
    queue.push(session);
    localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
  } catch {
    // Ignore
  }
}

export function getOfflineQueue(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
  } catch {
    // Ignore
  }
}
