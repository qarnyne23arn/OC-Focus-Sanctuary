import React, { useState } from 'react';
import { TaskItem } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Check, BookOpen, Sparkles, ArrowUpDown } from 'lucide-react';

interface TaskManagerProps {
  tasks: TaskItem[];
  activeTaskName: string;
  onSelectActiveTask: (name: string) => void;
  onUpdateActiveTaskName: (newName: string) => void;
  onAddTask: (name: string, targetPomodoros?: number, priority?: 'low' | 'medium' | 'high') => void;
  onToggleTaskComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isLight?: boolean;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  activeTaskName,
  onSelectActiveTask,
  onUpdateActiveTaskName,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  isLight = false,
}) => {
  const [isEditingActiveName, setIsEditingActiveName] = useState(false);
  const [tempName, setTempName] = useState(activeTaskName);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'status'>('priority');

  const handleSaveActiveName = () => {
    if (tempName.trim()) {
      onUpdateActiveTaskName(tempName.trim());
    }
    setIsEditingActiveName(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    onAddTask(newTaskInput.trim(), 4, newPriority);
    setNewTaskInput('');
    setNewPriority('medium');
  };

  const sortedTasks = React.useMemo(() => {
    const list = [...tasks];
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return list.sort((a, b) => {
      if (sortBy === 'priority') {
        const wA = priorityWeight[a.priority || 'medium'];
        const wB = priorityWeight[b.priority || 'medium'];
        if (wA !== wB) return wB - wA;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'status') {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      }
      return 0;
    });
  }, [tasks, sortBy]);

  const getPriorityBadgeStyle = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return isLight
          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)]';
      case 'medium':
        return isLight
          ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'low':
      default:
        return isLight
          ? 'bg-slate-200 text-slate-700 border-slate-300'
          : 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`w-full space-y-3.5 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
      <div className={`p-4 rounded-2xl border shadow-sm ${
        isLight
          ? 'bg-[#dce9ed] border-slate-300'
          : 'bg-gradient-to-r from-[#091a38] to-[#071328] border-cyan-500/30'
      }`}>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className={`flex items-center gap-1.5 font-bold uppercase tracking-wider ${
            isLight ? 'text-cyan-800' : 'text-cyan-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            Active Focus Task
          </span>
          <span className={`text-[10px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Click to edit</span>
        </div>

        {isEditingActiveName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveActiveName();
                if (e.key === 'Escape') setIsEditingActiveName(false);
              }}
              placeholder="Enter task name..."
              className={`flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold focus:outline-none ${
                isLight
                  ? 'bg-[#edf5f7] border border-slate-300 text-slate-900 placeholder-slate-500'
                  : 'bg-[#061022] border border-cyan-400 text-white placeholder-slate-500'
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveActiveName}
              className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition shadow-sm"
              title="Save Task Name"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => {
              setTempName(activeTaskName);
              setIsEditingActiveName(true);
            }}
            className={`flex items-center justify-between group cursor-pointer p-1 -m-1 rounded-lg transition ${
              isLight ? 'hover:bg-[#cfe0e6]' : 'hover:bg-sky-500/10'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`} />
              <span className={`font-bold text-base truncate tracking-tight ${
                activeTaskName 
                  ? isLight ? 'text-slate-900' : 'text-white'
                  : isLight ? 'text-slate-500 italic' : 'text-slate-400 italic'
              }`}>
                {activeTaskName || 'Enter Task'}
              </span>
            </div>
            <button
              type="button"
              className={`opacity-70 group-hover:opacity-100 p-1 rounded transition cursor-pointer ${
                isLight ? 'text-cyan-800 hover:bg-[#b8d4de]' : 'text-cyan-300 hover:bg-cyan-500/20'
              }`}
              title="Edit Task Name"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className={`flex items-center justify-between text-xs font-semibold px-1 ${
          isLight ? 'text-slate-900 font-bold' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>Focus Tasks</span>
            <span className={`text-[11px] font-normal ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-500'}`}>
              ({tasks.filter((t) => t.completed).length}/{tasks.length} done)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-cyan-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer focus:outline-none ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-[#091a38] border-cyan-500/30 text-cyan-300'
              }`}
            >
              <option value="priority">Sort: Priority</option>
              <option value="status">Sort: Status</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {sortedTasks.length === 0 ? (
            <div className={`p-4 rounded-xl border text-center text-xs ${
              isLight
                ? 'bg-[#edf5f7] border-slate-300 text-slate-700'
                : 'bg-[#08152c]/50 border-sky-500/10 text-slate-400'
            }`}>
              No tasks added yet. Enter your task below to get started.
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isActive = activeTaskName && task.name.toLowerCase() === activeTaskName.toLowerCase();
              const priority = task.priority || 'medium';
              return (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? isLight
                        ? 'bg-[#dce9ed] border-cyan-500 shadow-sm'
                        : 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                      : isLight
                        ? 'bg-[#edf5f7] border-slate-300 hover:border-slate-400'
                        : 'bg-[#08152c]/70 border-sky-500/10 hover:border-sky-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="text-slate-400 hover:text-cyan-500 transition cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div 
                      onClick={() => onSelectActiveTask(task.name)}
                      className="truncate cursor-pointer flex-1"
                      title="Click to set as current focus task"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs truncate ${
                          task.completed 
                            ? 'line-through text-slate-400' 
                            : isLight ? 'text-slate-900 font-bold' : 'text-slate-200 font-medium'
                        }`}>
                          {task.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase tracking-wider ${getPriorityBadgeStyle(priority)}`}>
                          {priority}
                        </span>
                      </div>
                      {task.subject && (
                        <span className={`text-[10px] font-normal block ${
                          isLight ? 'text-sky-800 font-semibold' : 'text-sky-400/70'
                        }`}>
                          {task.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isActive ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-cyan-100 text-cyan-900 border-cyan-400 font-bold'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectActiveTask(task.name)}
                        className={`text-[10px] hover:underline cursor-pointer px-1 py-0.5 ${
                          isLight ? 'text-cyan-800 font-semibold' : 'text-slate-400 hover:text-cyan-300'
                        }`}
                      >
                        Focus
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            placeholder="Add new task, writing, or coding goal..."
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 ${
              isLight
                ? 'bg-[#edf5f7] border border-slate-300 text-slate-900 placeholder-slate-500'
                : 'bg-[#061022] border border-sky-500/20 text-white placeholder-slate-500'
            }`}
          />
          <div className="flex items-center gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className={`text-xs px-2.5 py-2 rounded-xl border font-bold cursor-pointer focus:outline-none ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-[#061022] border-sky-500/30 text-cyan-300'
              }`}
              title="Select task priority"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
