export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface StudySession {
  id: string;
  mode: TimerMode;
  subject: string;
  durationMinutes: number; // Planned duration
  actualMinutes: number;   // Elapsed minutes
  completed: boolean;
  timestamp: string;       // ISO string
  date: string;            // YYYY-MM-DD
  hour: number;            // 0-23
  energy_before?: number;  // 1-5 logged at session start
  energy_after?: number;   // 1-5 logged at session end
  break_scheduled?: boolean;
  break_taken?: boolean;
  status?: 'completed' | 'interrupted' | 'abandoned';
  category?: string;
  pause_count?: number;
}

export interface BreakRecord {
  break_id: string;
  session_id: string;
  date: string;
  scheduled: boolean;
  taken: boolean;
}

export interface BlockedWebsite {
  id: string;
  domain: string;
  name: string;
  category: 'social' | 'video' | 'gaming' | 'shopping' | 'news' | 'custom';
  enabled: boolean;
}

export type GoalTimeframe = 'daily' | 'monthly' | 'long_term';

export type ReminderLeadTime = 'at_deadline' | '15m' | '30m' | '1h' | '2h' | '1d' | 'custom';

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  timeframe: GoalTimeframe;
  category: 'study' | 'exam' | 'project' | 'habit' | 'personal';
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string;   // ISO string
  targetMinutes?: number;
  reminderEnabled: boolean;
  reminderLeadTime: ReminderLeadTime;
  customReminderDateTime?: string; // YYYY-MM-DDTHH:mm
  reminderTriggered?: boolean;
}

export interface DailyGoal {
  targetMinutes: number;
  date: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'desktop' | 'mobile' | 'tablet';
  lastActive: string;
  isCurrent: boolean;
}

export interface SessionSnapshot {
  remainingSeconds: number;
  totalSeconds: number;
  mode: TimerMode;
  subject: string;
  elapsedSeconds: number;
  timestamp: number;
}

export interface CloudSyncState {
  syncCode: string;
  lastSyncedAt: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  hasUnsavedChanges: boolean;
  connectedDevices: DeviceInfo[];
}

export interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  pomodorosLogged: number;
  pomodorosTarget: number;
  subject?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ProductivityDataPoint {
  hour: number;
  label: string;
  minutes: number;
  sessions: number;
  sessionsList?: StudySession[];
}

export interface SessionReflection {
  id: string;
  sessionId?: string;
  taskName: string;
  timestamp: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1 = Distracted, 5 = Deep Flow
  notes: string;
  tags: string[];
  durationMinutes: number;
}

export type AmbientSoundMode = 'none' | 'alpha' | 'theta' | 'brown_noise' | 'rain' | 'custom_1' | 'custom_2' | 'custom_3' | 'custom_4' | 'custom_file' | 'custom_url';

export interface CustomAudioConfig {
  sourceType: 'file' | 'url';
  fileName?: string;
  url?: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export interface AntiCheatRecord {
  timestamp: number;
  durationSeconds: number;
  taskName: string;
}

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AppSettings {
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  dailyGoalMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  strictBlockerMode: boolean;
  strictAntiCheatMode: boolean;
  themeMode?: ThemeMode;
}

export interface MilestoneAlert {
  id: string;
  title: string;
  message: string;
  type: 'milestone' | 'goal_completed' | 'session_finished' | 'streak' | 'anti_cheat';
  timestamp: number;
}

export interface FocusProtocol {
  id: 'ultradian' | 'oc_standard' | 'pomodoro' | 'sprint';
  name: string;
  tagline: string;
  focusMinutes: number;
  breakMinutes: number;
  iconName: 'zap' | 'flame' | 'clock' | 'target';
  description: string;
  recommendedFor: string;
}

export interface DistractionLogItem {
  id: string;
  domain: string;
  timestamp: string;
  action: string;
}

