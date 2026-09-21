import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Plus, Trash2, Globe, ExternalLink, Sparkles, History, Clock } from 'lucide-react';
import { BlockedWebsite, DistractionLogItem } from '../types';

interface WebsiteBlockerProps {
  blockedSites: BlockedWebsite[];
  onToggleSite: (id: string) => void;
  onAddSite: (domain: string, name: string) => void;
  onRemoveSite: (id: string) => void;
  isTimerRunning: boolean;
  onSimulateBlock: (domain: string) => void;
  distractionCount: number;
  distractionLog?: DistractionLogItem[];
  onClearDistractionLog?: () => void;
  isLight?: boolean;
}

export const WebsiteBlocker: React.FC<WebsiteBlockerProps> = ({
  blockedSites,
  onToggleSite,
  onAddSite,
  onRemoveSite,
  isTimerRunning,
  onSimulateBlock,
  distractionCount,
  distractionLog = [],
  onClearDistractionLog,
  isLight = false,
}) => {
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanName = newName.trim() || cleanDomain.split('.')[0].toUpperCase();
    onAddSite(cleanDomain, cleanName);
    setNewDomain('');
    setNewName('');
  };

  const activeCount = blockedSites.filter((s) => s.enabled).length;

  const copyHostsScript = () => {
    const list = blockedSites.filter((s) => s.enabled).map((s) => `127.0.0.1 ${s.domain}\n127.0.0.1 www.${s.domain}`).join('\n');
    navigator.clipboard.writeText(`# Focus Time Blocklist\n${list}`);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className={`space-y-4 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* Blocker Status Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isTimerRunning 
          ? isLight
            ? 'bg-cyan-50 border-cyan-400 shadow-sm'
            : 'bg-gradient-to-br from-[#0c2448] to-[#08152c] border-cyan-500/40 shadow-[0_0_20px_rgba(0,180,255,0.15)]' 
          : isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#09152b]/90 border-sky-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isTimerRunning
                ? 'bg-cyan-500/20 text-cyan-500'
                : isLight
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
            }`}>
              {isTimerRunning ? <ShieldCheck className="w-5 h-5 animate-pulse" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Student Focus Shield
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isTimerRunning
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : isLight
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {isTimerRunning ? 'ACTIVE SHIELD' : 'STANDBY'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                {isTimerRunning 
                  ? `Intercepting ${activeCount} distracting domains`
                  : 'Activates automatically when you start your focus timer'}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <div className={`text-lg font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>{distractionCount}</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500 font-medium' : 'text-sky-300/60'}`}>Interceptions</div>
            </div>
            {distractionLog.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                title="View visited & intercepted sites log"
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-800 border-sky-500/30 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden sm:inline">Log</span>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Simulator Quick Action */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
      }`}>
        <div className={`text-xs ${isLight ? 'text-slate-800' : 'text-sky-200'}`}>
          <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            Test Shield Interceptor
          </span>
          <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-sky-300/60'}`}>
            See what happens when a student tries to open a blocked website
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSimulateBlock('youtube.com')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isLight
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
              : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Test Block
        </button>
      </div>

      {/* Add Custom Site Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. reddit.com or twitch.tv"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 ${
            isLight
              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
              : 'bg-[#071328] border border-sky-500/20 text-white placeholder-slate-500'
          }`}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Site
        </button>
      </form>

      {/* Blocked Websites List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {blockedSites.map((site) => (
          <div
            key={site.id}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
              isLight
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-[#08152e]/80 border-sky-500/10 hover:border-sky-500/25'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className={`w-4 h-4 shrink-0 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <div className="truncate">
                <span className={`text-xs font-semibold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {site.name}
                </span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {site.domain}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSimulateBlock(site.domain)}
                title="Test block interception for this site"
                className={`p-1 rounded transition text-xs ${
                  isLight
                    ? 'text-slate-500 hover:text-cyan-700 hover:bg-cyan-50'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-sky-500/10'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggleSite(site.id)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  site.enabled ? 'bg-cyan-500' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    site.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onRemoveSite(site.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Hosts file export button */}
      <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
        isLight ? 'border-slate-200 text-slate-500' : 'border-sky-500/10 text-slate-400'
      }`}>
        <span>Desktop DNS / Hosts Integration</span>
        <button
          type="button"
          onClick={copyHostsScript}
          className={`cursor-pointer font-semibold hover:underline ${
            isLight ? 'text-cyan-700' : 'text-cyan-400'
          }`}
        >
          {copiedScript ? '✓ Copied /etc/hosts rules!' : 'Copy Hosts File Rules'}
        </button>
      </div>

      {/* Visited & Intercepted Sites Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 rounded-3xl border shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#08152c] border-sky-500/30 text-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Visited & Intercepted Sites Log
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className={`text-xs px-2 py-1 rounded-lg border font-semibold cursor-pointer ${
                  isLight ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Here is the real-time log of all distracting websites encountered or attempted during focus sessions:
              </p>

              {distractionLog.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  No distraction attempts logged yet. Clean focus session!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {distractionLog.map((item) => (
                    <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
                        <div className="truncate">
                          <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.domain}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shrink-0">
                        {item.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {distractionLog.length > 0 && onClearDistractionLog && (
              <div className="mt-4 pt-3 border-t border-sky-500/25 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClearDistractionLog();
                    setShowLogModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition"
                >
                  Clear History Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

