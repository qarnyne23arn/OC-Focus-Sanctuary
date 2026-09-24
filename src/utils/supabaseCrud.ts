import { getSupabaseClient } from './supabase';
import { StudySession, GoalItem, TaskItem, SessionReflection, BlockedWebsite, AppSettings } from '../types';

/**
 * Direct Supabase CRUD Functions for each feature table
 */

export async function ensureSupabaseProfile(userId: string, email: string, name?: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('profiles').upsert({
    id: userId,
    email: email.trim().toLowerCase(),
    name: name?.trim() || email.split('@')[0],
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) {
    console.error('Failed to insert or upsert profile in Supabase:', error.message);
    throw new Error(`Profile creation failed: ${error.message}`);
  }
}

export async function ensureSupabaseSettings(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { data, error: fetchError } = await client.from('app_settings').select('*').eq('user_id', userId).maybeSingle();
  console.log('ensureSupabaseSettings fetch result:', { userId, data, fetchError });
  if (!data || fetchError) {
    const res = await client.from('app_settings').upsert({
      user_id: userId,
      focus_duration_minutes: 25,
      short_break_minutes: 5,
      long_break_minutes: 15,
      daily_goal_minutes: 120,
      auto_start_breaks: false,
      sound_enabled: true,
      notifications_enabled: true,
      strict_blocker_mode: false,
      strict_anti_cheat_mode: false,
      theme_mode: 'dark',
    }, { onConflict: 'user_id' });
    console.log('ensureSupabaseSettings upsert result:', res);
    if (res.error) {
      console.warn('Failed to insert default app_settings in Supabase:', res.error.message);
    }
  }
}

// --- GOALS CRUD ---
export async function supabaseFetchGoals(userId: string): Promise<GoalItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('goals').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description || '',
    timeframe: g.timeframe,
    category: g.category || 'study',
    deadlineDate: g.deadline_date || '',
    deadlineTime: g.deadline_time || '',
    completed: !!g.completed,
    completedAt: g.completed_at || undefined,
    createdAt: g.created_at || new Date().toISOString(),
    targetMinutes: g.target_minutes || undefined,
    reminderEnabled: !!g.reminder_enabled,
    reminderLeadTime: g.reminder_lead_time || '1_hour_before',
  }));
}

export async function supabaseInsertGoal(userId: string, goal: GoalItem): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('goals').upsert({
    id: goal.id,
    user_id: userId,
    title: goal.title,
    description: goal.description || null,
    timeframe: goal.timeframe,
    category: goal.category || 'study',
    deadline_date: goal.deadlineDate || null,
    deadline_time: goal.deadlineTime || null,
    completed: !!goal.completed,
    completed_at: goal.completedAt || null,
    created_at: goal.createdAt || new Date().toISOString(),
    target_minutes: goal.targetMinutes || null,
    reminder_enabled: !!goal.reminderEnabled,
    reminder_lead_time: goal.reminderLeadTime || null,
  }, { onConflict: 'id' });
}

export async function supabaseUpdateGoal(userId: string, goal: GoalItem): Promise<void> {
  await supabaseInsertGoal(userId, goal);
}

export async function supabaseDeleteGoal(userId: string, goalId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('goals').delete().eq('user_id', userId).eq('id', goalId);
}


// --- TASKS CRUD ---
export async function supabaseFetchTasks(userId: string): Promise<TaskItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('tasks').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    completed: !!t.completed,
    pomodorosLogged: t.pomodoros_logged || 0,
    pomodorosTarget: t.pomodoros_target || 1,
    subject: t.subject || undefined,
    priority: t.priority || 'medium',
  }));
}

export async function supabaseInsertTask(userId: string, task: TaskItem): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('tasks').upsert({
    id: task.id,
    user_id: userId,
    name: task.name,
    completed: !!task.completed,
    pomodoros_logged: task.pomodorosLogged || 0,
    pomodoros_target: task.pomodorosTarget || 1,
    subject: task.subject || null,
    priority: task.priority || 'medium',
  }, { onConflict: 'id' });
}

export async function supabaseUpdateTask(userId: string, task: TaskItem): Promise<void> {
  await supabaseInsertTask(userId, task);
}

export async function supabaseDeleteTask(userId: string, taskId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('tasks').delete().eq('user_id', userId).eq('id', taskId);
}


// --- SESSIONS CRUD ---
export async function supabaseFetchSessions(userId: string): Promise<StudySession[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('study_sessions').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((s: any) => ({
    id: s.id,
    mode: s.mode,
    subject: s.subject || undefined,
    durationMinutes: s.duration_minutes,
    actualMinutes: s.actual_minutes,
    completed: !!s.completed,
    timestamp: s.timestamp,
    date: s.date,
    hour: s.hour,
    energy_before: s.energy_before ?? undefined,
    energy_after: s.energy_after ?? undefined,
    category: s.category || undefined,
  }));
}

export async function supabaseInsertSession(userId: string, session: StudySession): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('study_sessions').upsert({
    id: session.id,
    user_id: userId,
    mode: session.mode,
    subject: session.subject || null,
    duration_minutes: session.durationMinutes,
    actual_minutes: session.actualMinutes,
    completed: !!session.completed,
    timestamp: session.timestamp,
    date: session.date,
    hour: session.hour,
    energy_before: session.energy_before ?? null,
    energy_after: session.energy_after ?? null,
    category: session.category || null,
  }, { onConflict: 'id' });
}

export async function supabaseDeleteSession(userId: string, sessionId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('study_sessions').delete().eq('user_id', userId).eq('id', sessionId);
}


// --- REFLECTIONS CRUD ---
export async function supabaseFetchReflections(userId: string): Promise<SessionReflection[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('reflections').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    sessionId: r.session_id || undefined,
    taskName: r.task_name,
    timestamp: r.timestamp,
    date: r.date,
    energyLevel: r.energy_level,
    notes: r.notes || undefined,
    tags: r.tags || [],
    durationMinutes: r.duration_minutes,
  }));
}

export async function supabaseInsertReflection(userId: string, reflection: SessionReflection): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('reflections').upsert({
    id: reflection.id,
    user_id: userId,
    session_id: reflection.sessionId || null,
    task_name: reflection.taskName,
    timestamp: reflection.timestamp,
    date: reflection.date,
    energy_level: reflection.energyLevel,
    notes: reflection.notes || null,
    tags: reflection.tags || [],
    duration_minutes: reflection.durationMinutes,
  }, { onConflict: 'id' });
}

export async function supabaseDeleteReflection(userId: string, reflectionId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('reflections').delete().eq('user_id', userId).eq('id', reflectionId);
}


// --- BLOCKED WEBSITES CRUD ---
export async function supabaseFetchBlockedSites(userId: string): Promise<BlockedWebsite[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('blocked_websites').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    domain: b.domain,
    name: b.name,
    category: b.category,
    enabled: !!b.enabled,
  }));
}

export async function supabaseInsertBlockedSite(userId: string, site: BlockedWebsite): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('blocked_websites').upsert({
    id: site.id,
    user_id: userId,
    domain: site.domain,
    name: site.name,
    category: site.category,
    enabled: !!site.enabled,
  }, { onConflict: 'id' });
}

export async function supabaseUpdateBlockedSite(userId: string, site: BlockedWebsite): Promise<void> {
  await supabaseInsertBlockedSite(userId, site);
}

export async function supabaseDeleteBlockedSite(userId: string, siteId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('blocked_websites').delete().eq('user_id', userId).eq('id', siteId);
}


// --- APP SETTINGS CRUD ---
export async function supabaseFetchSettings(userId: string): Promise<AppSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from('app_settings').select('*').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return {
    focusDurationMinutes: data.focus_duration_minutes ?? 25,
    shortBreakMinutes: data.short_break_minutes ?? 5,
    longBreakMinutes: data.long_break_minutes ?? 15,
    dailyGoalMinutes: data.daily_goal_minutes ?? 120,
    autoStartBreaks: !!data.auto_start_breaks,
    soundEnabled: !!data.sound_enabled,
    notificationsEnabled: !!data.notifications_enabled,
    strictBlockerMode: !!data.strict_blocker_mode,
    strictAntiCheatMode: !!data.strict_anti_cheat_mode,
    themeMode: data.theme_mode || 'dark',
  };
}

export async function supabaseUpsertSettings(userId: string, settings: AppSettings): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('app_settings').upsert({
    user_id: userId,
    focus_duration_minutes: settings.focusDurationMinutes,
    short_break_minutes: settings.shortBreakMinutes,
    long_break_minutes: settings.longBreakMinutes,
    daily_goal_minutes: settings.dailyGoalMinutes,
    auto_start_breaks: settings.autoStartBreaks,
    sound_enabled: settings.soundEnabled,
    notifications_enabled: settings.notificationsEnabled,
    strict_blocker_mode: settings.strictBlockerMode,
    strict_anti_cheat_mode: settings.strictAntiCheatMode,
    theme_mode: settings.themeMode,
  }, { onConflict: 'user_id' });
}
