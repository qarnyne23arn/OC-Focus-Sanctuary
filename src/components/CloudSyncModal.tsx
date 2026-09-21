import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Smartphone, Laptop, Tablet, CheckCircle, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { CloudSyncState } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: CloudSyncState;
  onTriggerSync: () => Promise<void>;
  onUpdateSyncCode: (newCode: string) => void;
  offlineQueueCount: number;
  isLight?: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
  onUpdateSyncCode,
  offlineQueueCount,
  isLight = false,
}) => {
  const [inputCode, setInputCode] = useState(syncState.syncCode);
  const [copied, setCopied] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onUpdateSyncCode(inputCode.trim().toUpperCase());
    setPairingSuccess(true);
    setTimeout(() => setPairingSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
        isLight
          ? 'bg-[#edf5f7] border-slate-300 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
          : 'bg-[#08152c] border-sky-500/25 text-slate-200'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-300' : 'border-sky-500/15'
        }`}>
          <div className={`flex items-center gap-2 font-bold text-base ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Cloud className={`w-5 h-5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            Cross-Device Cloud Sync
          </div>
          <button
            onClick={onClose}
            className={`text-xs px-2 py-1 rounded-lg transition cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-[#dce9ed]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Network & Sync Status Banner */}
        <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between ${
          isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061022] border-sky-500/20'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              syncState.isOnline
                ? isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                : isLight ? 'bg-slate-300 text-slate-700' : 'bg-slate-800 text-slate-400'
            }`}>
              {syncState.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {syncState.isOnline ? 'Network Connected' : 'Offline Mode Active'}
                </span>
                <span className={`w-2 h-2 rounded-full ${syncState.isOnline ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
                {syncState.lastSyncedAt
                  ? `Cloud synced: ${new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Syncing to secure cloud store'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={syncState.isSyncing}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-300 hover:text-white'
            }`}
            title="Force Cloud Sync"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Offline Queue Notification if offline */}
        {offlineQueueCount > 0 && (
          <div className={`mt-2.5 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
            isLight
              ? 'bg-cyan-100 border-cyan-300 text-cyan-900'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
          }`}>
            <span>{offlineQueueCount} session(s) pending cloud upload</span>
            <span className={`text-[10px] font-medium ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>Will auto-sync on reconnect</span>
          </div>
        )}

        {/* Sync Code Pairing */}
        <div className={`mt-4 p-4 rounded-2xl border ${
          isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061022] border-sky-500/20'
        }`}>
          <span className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Device Pairing Sync Code
          </span>
          <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
            Use this code to link your phone, tablet, and laptop so your study time, goals, and blocked sites remain synchronized everywhere.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <div className={`flex-1 px-3 py-2 rounded-xl border font-mono font-bold text-center tracking-widest text-sm ${
              isLight
                ? 'bg-[#edf5f7] border-cyan-400 text-cyan-900'
                : 'bg-[#0a1b38] border-cyan-500/40 text-cyan-300'
            }`}>
              {syncState.syncCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
              }`}
              title="Copy Sync Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Join existing code */}
          <form onSubmit={handleApplyCode} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code from other device"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                isLight
                  ? 'bg-[#edf5f7] border-slate-300 text-slate-900 placeholder-slate-500'
                  : 'bg-[#08152c] border-sky-500/20 text-white placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition cursor-pointer"
            >
              Pair Device
            </button>
          </form>

          {pairingSuccess && (
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected to cloud workspace successfully!
            </div>
          )}
        </div>

        {/* Connected Devices List */}
        <div className="mt-4">
          <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            Active Devices in Workspace
          </span>
          <div className="space-y-1.5">
            <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061022] border-sky-500/15'
            }`}>
              <div className="flex items-center gap-2">
                <Laptop className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Desktop / Laptop</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isLight ? 'bg-cyan-200 text-cyan-900' : 'text-cyan-300 bg-cyan-500/20'
                }`}>This Device</span>
              </div>
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Active Now</span>
            </div>

            <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061022] border-sky-500/15'
            }`}>
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-sky-400'}`} />
                <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>iPhone / Mobile</span>
              </div>
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Synced 10m ago</span>
            </div>

            <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061022] border-sky-500/15'
            }`}>
              <div className="flex items-center gap-2">
                <Tablet className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-sky-400'}`} />
                <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>Tablet / iPad</span>
              </div>
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Synced 1h ago</span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className={`text-xs px-4 py-2 rounded-xl cursor-pointer ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-[#dce9ed]' : 'text-sky-300/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
