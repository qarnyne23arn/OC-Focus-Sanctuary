import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Calendar, 
  Clock, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Edit3, 
  Flag, 
  Sparkles, 
  AlertCircle, 
  CalendarDays, 
  CheckCheck, 
  Play, 
  SlidersHorizontal,
  ChevronRight,
  SunMedium,
  Compass,
  Volume2
} from 'lucide-react';
import { GoalItem, GoalTimeframe, ReminderLeadTime } from '../types';

interface GoalsSectionProps {
  goals: GoalItem[];
  onAddGoal: (goal: Omit<GoalItem, 'id' | 'createdAt' | 'completed'>) => void;
  onUpdateGoal: (goal: GoalItem) => void;
  onToggleGoalComplete: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onSelectGoalAsTask?: (goalTitle: string, targetMinutes?: number) => void;
  onTriggerTestReminder?: (goal: GoalItem) => void;
  isLight?: boolean;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onToggleGoalComplete,
  onDeleteGoal,
  onSelectGoalAsTask,
  onTriggerTestReminder,
  isLight = false,
}) => {
  // Filters
  const [activeTimeframe, setActiveTimeframe] = useState<GoalTimeframe | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>('daily');
  const [category, setCategory] = useState<GoalItem['category']>('study');
  const [deadlineDate, setDeadlineDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [deadlineTime, setDeadlineTime] = useState<string>('21:00');
  const [targetMinutes, setTargetMinutes] = useState<number>(60);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderLeadTime, setReminderLeadTime] = useState<ReminderLeadTime>('1h');
  const [customReminderDateTime, setCustomReminderDateTime] = useState<string>('');

  // Open Add Form with sensible defaults based on active timeframe
  const handleOpenAddForm = (defaultTf?: GoalTimeframe) => {
    const tf = defaultTf || (activeTimeframe !== 'all' ? activeTimeframe : 'daily');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    let defaultDate = `${year}-${month}-${day}`;
    let defaultMinutes = 60;
    let defaultTime = '21:00';
    let defaultLead: ReminderLeadTime = '1h';

    if (tf === 'monthly') {
      const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      defaultDate = `${endOfMonthDate.getFullYear()}-${String(endOfMonthDate.getMonth() + 1).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;
      defaultMinutes = 240;
      defaultTime = '22:00';
      defaultLead = '1d';
    } else if (tf === 'long_term') {
      const longTerm = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      defaultDate = `${longTerm.getFullYear()}-${String(longTerm.getMonth() + 1).padStart(2, '0')}-${String(longTerm.getDate()).padStart(2, '0')}`;
      defaultMinutes = 600;
      defaultTime = '18:00';
      defaultLead = '1d';
    }

    setEditingGoalId(null);
    setTitle('');
    setDescription('');
    setTimeframe(tf);
    setCategory('study');
    setDeadlineDate(defaultDate);
    setDeadlineTime(defaultTime);
    setTargetMinutes(defaultMinutes);
    setReminderEnabled(true);
    setReminderLeadTime(defaultLead);
    setCustomReminderDateTime('');
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEditForm = (goal: GoalItem) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTimeframe(goal.timeframe);
    setCategory(goal.category || 'study');
    setDeadlineDate(goal.deadlineDate);
    setDeadlineTime(goal.deadlineTime);
    setTargetMinutes(goal.targetMinutes || 60);
    setReminderEnabled(goal.reminderEnabled);
    setReminderLeadTime(goal.reminderLeadTime);
    setCustomReminderDateTime(goal.customReminderDateTime || '');
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGoalId) {
      const existing = goals.find((g) => g.id === editingGoalId);
      if (existing) {
        onUpdateGoal({
          ...existing,
          title: title.trim(),
          description: description.trim(),
          timeframe,
          category,
          deadlineDate,
          deadlineTime,
          targetMinutes: Number(targetMinutes) || 0,
          reminderEnabled,
          reminderLeadTime,
          customReminderDateTime: reminderLeadTime === 'custom' ? customReminderDateTime : undefined,
          // Reset triggered if deadline was changed
          reminderTriggered: false,
        });
      }
    } else {
      onAddGoal({
        title: title.trim(),
        description: description.trim(),
        timeframe,
        category,
        deadlineDate,
        deadlineTime,
        targetMinutes: Number(targetMinutes) || 0,
        reminderEnabled,
        reminderLeadTime,
        customReminderDateTime: reminderLeadTime === 'custom' ? customReminderDateTime : undefined,
        reminderTriggered: false,
      });
    }

    setIsFormOpen(false);
  };

  // Quick preset deadline buttons
  const setQuickDeadline = (type: 'today_night' | 'tomorrow_night' | 'this_weekend' | 'end_month') => {
    const now = new Date();
    if (type === 'today_night') {
      const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setDeadlineDate(dStr);
      setDeadlineTime('21:00');
    } else if (type === 'tomorrow_night') {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      setDeadlineDate(dStr);
      setDeadlineTime('21:00');
    } else if (type === 'this_weekend') {
      const dayOfWeek = now.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
      const sunday = new Date(now.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
      const dStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
      setDeadlineDate(dStr);
      setDeadlineTime('22:00');
    } else if (type === 'end_month') {
      const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const dStr = `${endOfMonthDate.getFullYear()}-${String(endOfMonthDate.getMonth() + 1).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;
      setDeadlineDate(dStr);
      setDeadlineTime('23:59');
    }
  };

  // Helper for computing countdown and deadline status
  const getDeadlineStatus = (goal: GoalItem) => {
    if (goal.completed) {
      return {
        label: 'Goal Achieved',
        isOverdue: false,
        isSoon: false,
        badgeClass: isLight 
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      };
    }

    try {
      const [year, month, day] = goal.deadlineDate.split('-').map(Number);
      const [hours, minutes] = goal.deadlineTime.split(':').map(Number);
      const deadline = new Date(year, month - 1, day, hours || 0, minutes || 0);
      const now = new Date();
      const diffMs = deadline.getTime() - now.getTime();

      if (diffMs < 0) {
        const absMinutes = Math.abs(Math.floor(diffMs / 60000));
        const absHours = Math.floor(absMinutes / 60);
        const remM = absMinutes % 60;
        const text = absHours > 24 
          ? `Overdue by ${Math.floor(absHours / 24)}d` 
          : absHours > 0 
            ? `Overdue by ${absHours}h ${remM}m` 
            : `Overdue by ${absMinutes}m`;

        return {
          label: text,
          isOverdue: true,
          isSoon: false,
          badgeClass: isLight 
            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' 
            : 'bg-rose-950/70 text-rose-300 border-rose-500/40 animate-pulse',
        };
      }

      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 1) {
        return {
          label: `Due in ${diffDays} days`,
          isOverdue: false,
          isSoon: false,
          badgeClass: isLight 
            ? 'bg-cyan-50 text-cyan-800 border-cyan-300' 
            : 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30',
        };
      }

      if (diffDays === 1) {
        return {
          label: `Due tomorrow (${goal.deadlineTime})`,
          isOverdue: false,
          isSoon: true,
          badgeClass: isLight 
            ? 'bg-amber-100 text-amber-900 border-amber-300' 
            : 'bg-amber-950/60 text-amber-300 border-amber-500/40',
        };
      }

      // Less than 24 hours
      const remM = diffMinutes % 60;
      const text = diffHours > 0 ? `Due in ${diffHours}h ${remM}m` : `Due in ${diffMinutes}m`;
      return {
        label: text,
        isOverdue: false,
        isSoon: true,
        badgeClass: isLight 
          ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' 
          : 'bg-amber-950/70 text-amber-300 border-amber-500/40 font-semibold',
      };
    } catch {
      return {
        label: `Due ${goal.deadlineDate} ${goal.deadlineTime}`,
        isOverdue: false,
        isSoon: false,
        badgeClass: isLight 
          ? 'bg-slate-100 text-slate-700 border-slate-300' 
          : 'bg-slate-800 text-slate-300 border-slate-700',
      };
    }
  };

  // Helper for human-readable reminder text
  const getReminderLabel = (lead: ReminderLeadTime) => {
    switch (lead) {
      case 'at_deadline': return 'At exact deadline';
      case '15m': return '15 mins before';
      case '30m': return '30 mins before';
      case '1h': return '1 hour before';
      case '2h': return '2 hours before';
      case '1d': return '1 day before';
      case 'custom': return 'Custom scheduled time';
      default: return 'At deadline';
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const daily = goals.filter((g) => g.timeframe === 'daily');
    const dailyCompleted = daily.filter((g) => g.completed).length;

    const monthly = goals.filter((g) => g.timeframe === 'monthly');
    const monthlyCompleted = monthly.filter((g) => g.completed).length;

    const longTerm = goals.filter((g) => g.timeframe === 'long_term');
    const longTermCompleted = longTerm.filter((g) => g.completed).length;

    return {
      total,
      completed,
      active,
      percent,
      daily: { total: daily.length, completed: dailyCompleted },
      monthly: { total: monthly.length, completed: monthlyCompleted },
      longTerm: { total: longTerm.length, completed: longTermCompleted },
    };
  }, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (activeTimeframe !== 'all' && goal.timeframe !== activeTimeframe) return false;
      if (statusFilter === 'active' && goal.completed) return false;
      if (statusFilter === 'completed' && !goal.completed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(q);
        const matchesDesc = goal.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      // Completed goals sink to the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Sort by deadline chronological
      return `${a.deadlineDate} ${a.deadlineTime}`.localeCompare(`${b.deadlineDate} ${b.deadlineTime}`);
    });
  }, [goals, activeTimeframe, statusFilter, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header Banner with Primary Timeframe Controls */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col gap-4 ${
        isLight 
          ? 'bg-slate-50/90 border-slate-200 shadow-sm' 
          : 'bg-[#061022] border-sky-500/20 shadow-md'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-xl border ${
                isLight ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
              }`}>
                <Target className="w-5 h-5" />
              </span>
              <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Goals & Milestones Tracker
              </h2>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-sky-200/70'}`}>
              Organize daily, monthly, and long-term academic targets with deadline times and automated reminders.
            </p>
          </div>

          {/* Quick Action: New Goal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Goal</span>
            </button>
          </div>
        </div>

        {/* 2. Top-Level Timeframe Switcher Tabs */}
        <div className={`p-1 rounded-2xl border grid grid-cols-4 gap-1 sm:gap-1.5 text-xs font-bold ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#040c1c] border-sky-500/15'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTimeframe('all')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTimeframe === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTimeframe === 'all' ? 'bg-slate-950/20 text-slate-900' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTimeframe('daily')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTimeframe === 'daily'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span className="truncate">Daily</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTimeframe === 'daily' ? 'bg-slate-950/20 text-slate-900' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.daily.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTimeframe('monthly')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTimeframe === 'monthly'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">Monthly</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTimeframe === 'monthly' ? 'bg-slate-950/20 text-slate-900' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.monthly.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTimeframe('long_term')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTimeframe === 'long_term'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="truncate">Long-Term</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTimeframe === 'long_term' ? 'bg-slate-950/20 text-slate-900' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.longTerm.total}
            </span>
          </button>
        </div>

        {/* 3. 3-Card Timeframe Progress Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Daily Card */}
          <div className={`p-3 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#08152e] border-sky-500/15'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-bold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-sky-200'}`}>
                <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                Daily Target
              </span>
              <span className={`font-mono text-[11px] font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                {metrics.daily.completed}/{metrics.daily.total} done
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${metrics.daily.total > 0 ? (metrics.daily.completed / metrics.daily.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Monthly Card */}
          <div className={`p-3 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#08152e] border-sky-500/15'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-bold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-sky-200'}`}>
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Monthly Milestone
              </span>
              <span className={`font-mono text-[11px] font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                {metrics.monthly.completed}/{metrics.monthly.total} done
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${metrics.monthly.total > 0 ? (metrics.monthly.completed / metrics.monthly.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Long Term Card */}
          <div className={`p-3 rounded-2xl border transition ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#08152e] border-sky-500/15'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-bold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-sky-200'}`}>
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Long-Term Vision
              </span>
              <span className={`font-mono text-[11px] font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                {metrics.longTerm.completed}/{metrics.longTerm.total} done
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${metrics.longTerm.total > 0 ? (metrics.longTerm.completed / metrics.longTerm.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Pill Filters */}
        <div className={`p-0.5 rounded-xl border flex items-center text-xs font-semibold ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#061022] border-sky-500/15'
        }`}>
          {(['all', 'active', 'completed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                statusFilter === st
                  ? isLight ? 'bg-white text-slate-900 shadow-sm font-bold' : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals..."
            className={`w-full text-xs px-3 py-1.5 rounded-xl border focus:outline-none transition ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500' 
                : 'bg-[#061022] border-sky-500/20 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5. Goals Card List */}
      {filteredGoals.length === 0 ? (
        <div className={`text-center py-12 px-4 rounded-3xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#061022] border-sky-500/15 text-slate-400'
        }`}>
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              No goals found in this view
            </h3>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try adjusting your search query.' 
                : 'Set your first academic goal with a target deadline time and reminder.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddForm()}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow hover:brightness-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => {
            const status = getDeadlineStatus(goal);
            const timeframeBadge = 
              goal.timeframe === 'daily' 
                ? { label: 'Daily Goal', color: isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/30' }
                : goal.timeframe === 'monthly'
                  ? { label: 'Monthly Goal', color: isLight ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-purple-950/60 text-purple-300 border-purple-500/30' }
                  : { label: 'Long-Term', color: isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };

            return (
              <div
                key={goal.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group ${
                  goal.completed
                    ? isLight
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-[#061022]/70 border-sky-500/10 opacity-75'
                    : isLight
                      ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
                      : 'bg-[#08152e] border-sky-500/20 hover:border-cyan-400/40 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Mark as Done Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => onToggleGoalComplete(goal.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                      goal.completed
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : isLight
                          ? 'border-2 border-slate-300 hover:border-cyan-600 text-transparent hover:text-cyan-600'
                          : 'border-2 border-sky-500/40 hover:border-cyan-400 text-transparent hover:text-cyan-400'
                    }`}
                    title={goal.completed ? 'Mark goal as active' : 'Mark goal as completed'}
                  >
                    <CheckCheck className="w-3.5 h-3.5 stroke-[2.8]" />
                  </button>

                  {/* Goal Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Timeframe Pill */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${timeframeBadge.color}`}>
                        {timeframeBadge.label}
                      </span>

                      {/* Category Pill */}
                      {goal.category && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                          isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/80 text-sky-300'
                        }`}>
                          {goal.category}
                        </span>
                      )}

                      {/* Deadline Status Badge (Overdue / Due soon / Completed) */}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 ${status.badgeClass}`}>
                        <Clock className="w-3 h-3" />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-sm sm:text-base font-bold tracking-tight transition ${
                      goal.completed 
                        ? 'line-through text-slate-400 dark:text-slate-500' 
                        : isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {goal.title}
                    </h3>

                    {/* Description */}
                    {goal.description && (
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-slate-300/80'
                      }`}>
                        {goal.description}
                      </p>
                    )}

                    {/* Deadline Details & Reminders Row */}
                    <div className="mt-3 pt-2.5 border-t border-dashed flex flex-wrap items-center justify-between gap-2 text-xs border-slate-200 dark:border-slate-800">
                      
                      {/* Deadline and Target info */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Exact Deadline Date & Time */}
                        <div className={`flex items-center gap-1.5 font-medium ${
                          isLight ? 'text-slate-700' : 'text-sky-200/80'
                        }`}>
                          <CalendarDays className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Deadline: </span>
                          <span className="font-bold font-mono">
                            {goal.deadlineDate} at {goal.deadlineTime}
                          </span>
                        </div>

                        {/* Optional Target Study Minutes */}
                        {goal.targetMinutes ? (
                          <div className={`flex items-center gap-1 font-mono text-[11px] ${
                            isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            <span>🎯 Target:</span>
                            <span className="font-semibold">{goal.targetMinutes}m</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Reminder Indicator & Test Action */}
                      <div className="flex items-center gap-2">
                        {goal.reminderEnabled ? (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                            isLight 
                              ? 'bg-cyan-50 text-cyan-900 border-cyan-200' 
                              : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                          }`}>
                            <Bell className="w-3 h-3 text-cyan-400 animate-pulse" />
                            <span>Reminder: {getReminderLabel(goal.reminderLeadTime)}</span>
                            
                            {/* Test Reminder Trigger button */}
                            {onTriggerTestReminder && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTriggerTestReminder(goal);
                                }}
                                className="ml-1 text-cyan-500 hover:text-cyan-300 hover:underline cursor-pointer"
                                title="Test play reminder chime & notification"
                              >
                                Test
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1 text-[11px] ${
                            isLight ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <BellOff className="w-3 h-3" />
                            <span>Reminder Off</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                    {/* Focus With Timer button */}
                    {!goal.completed && onSelectGoalAsTask && (
                      <button
                        type="button"
                        onClick={() => onSelectGoalAsTask(goal.title, goal.targetMinutes)}
                        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                          isLight
                            ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-900'
                            : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                        }`}
                        title="Set this goal as active study task in the focus clock"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(goal)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
                      }`}
                      title="Edit Goal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete goal "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isLight 
                          ? 'text-rose-600 hover:bg-rose-50 border-rose-200' 
                          : 'text-rose-400 hover:bg-rose-950/40 border-rose-900/40'
                      }`}
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Add / Edit Goal Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl border shadow-2xl transition ${
            isLight 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-[#08152c] border-sky-500/30 text-slate-100'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-500" />
                <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {editingGoalId ? 'Edit Academic Goal' : 'Create New Academic Goal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className={`text-xs px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
              
              {/* Goal Title */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Calculus Series & Convergence"
                  className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border focus:outline-none transition ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500' 
                      : 'bg-[#050f21] border-sky-500/30 text-white focus:border-cyan-400'
                  }`}
                  autoFocus
                />
              </div>

              {/* Timeframe Selector (Daily, Monthly, Long Term) */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Goal Timeframe *
                </label>
                <div className={`p-1 rounded-xl border grid grid-cols-3 gap-1 ${
                  isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#050f21] border-sky-500/20'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeframe('daily');
                      setQuickDeadline('today_night');
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      timeframe === 'daily'
                        ? 'bg-cyan-500 text-slate-950 shadow font-black'
                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <SunMedium className="w-3.5 h-3.5" />
                    <span>Daily</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimeframe('monthly');
                      setQuickDeadline('end_month');
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      timeframe === 'monthly'
                        ? 'bg-cyan-500 text-slate-950 shadow font-black'
                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Monthly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeframe('long_term')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      timeframe === 'long_term'
                        ? 'bg-cyan-500 text-slate-950 shadow font-black'
                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Long-Term</span>
                  </button>
                </div>
              </div>

              {/* Deadline Date & Time Inputs */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#050f21] border-sky-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Deadline Date & Time *
                  </span>
                  
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('today_night')}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Tonight
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('tomorrow_night')}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('end_month')}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-sky-200'
                      }`}
                    >
                      Month End
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Deadline Date
                    </label>
                    <input
                      type="date"
                      required
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                        isLight 
                          ? 'bg-white border-slate-300 text-slate-900' 
                          : 'bg-[#08152c] border-sky-500/30 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Deadline Time (HH:mm)
                    </label>
                    <input
                      type="time"
                      required
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                        isLight 
                          ? 'bg-white border-slate-300 text-slate-900' 
                          : 'bg-[#08152c] border-sky-500/30 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Option Card (Requested!) */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-cyan-50/50 border-cyan-200' : 'bg-[#050f21] border-cyan-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className={`w-4 h-4 ${reminderEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Goal Reminders
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      reminderEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="space-y-2 pt-1">
                    <label className={`block text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      When should we remind you?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                      {([
                        { id: 'at_deadline', label: 'At deadline' },
                        { id: '15m', label: '15 mins before' },
                        { id: '30m', label: '30 mins before' },
                        { id: '1h', label: '1 hour before' },
                        { id: '2h', label: '2 hours before' },
                        { id: '1d', label: '1 day before' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReminderLeadTime(opt.id)}
                          className={`py-1.5 px-2 rounded-xl text-center border font-medium transition cursor-pointer ${
                            reminderLeadTime === opt.id
                              ? isLight 
                                ? 'bg-cyan-600 text-white border-cyan-600 font-bold' 
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                              : isLight 
                                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' 
                                : 'bg-[#08152c] border-sky-500/15 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-sky-200/60'}`}>
                      🔔 You'll receive audio chimes and in-app milestone alerts as the deadline approaches.
                    </p>
                  </div>
                )}
              </div>

              {/* Category and Target Minutes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900' 
                        : 'bg-[#050f21] border-sky-500/30 text-white'
                    }`}
                  >
                    <option value="study">Study</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="habit">Habit</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Target Study (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(Number(e.target.value))}
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900' 
                        : 'bg-[#050f21] border-sky-500/30 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key milestones, required textbook sections, or checklist notes..."
                  className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500' 
                      : 'bg-[#050f21] border-sky-500/30 text-white focus:border-cyan-400'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  {editingGoalId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
