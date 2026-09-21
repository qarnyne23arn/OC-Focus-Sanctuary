import React from 'react';
import { FocusProtocol } from '../types';
import { FOCUS_PROTOCOLS } from '../utils/storage';
import { Flame, Target, Clock, Zap, Check, ArrowRight } from 'lucide-react';

interface FocusProtocolsCardProps {
  currentFocusMinutes: number;
  onSelectProtocol: (protocol: FocusProtocol) => void;
  isLight?: boolean;
}

export const FocusProtocolsCard: React.FC<FocusProtocolsCardProps> = ({
  currentFocusMinutes,
  onSelectProtocol,
  isLight = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-4 h-4 text-cyan-500" />;
      case 'target':
        return <Target className="w-4 h-4 text-cyan-400" />;
      case 'clock':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border space-y-3 ${
      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/20'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-extrabold flex items-center gap-1.5 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Target className="w-4 h-4 text-cyan-500" />
            Science-Backed Focus Protocols
          </h3>
          <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
            1-click presets calibrating both focus endurance and neural recovery intervals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {FOCUS_PROTOCOLS.map((proto) => {
          const isActive = currentFocusMinutes === proto.focusMinutes;
          return (
            <div
              key={proto.id}
              onClick={() => onSelectProtocol(proto)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? isLight
                    ? 'bg-cyan-50/90 border-cyan-500 shadow-sm'
                    : 'bg-gradient-to-b from-cyan-950/60 to-[#061022] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-cyan-400 hover:bg-slate-50'
                    : 'bg-[#040c1a] border-sky-500/15 hover:border-cyan-500/40 hover:bg-[#071329]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl border ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700/60'
                    }`}>
                      {getIcon(proto.iconName)}
                    </div>
                    <div>
                      <h4 className={`text-xs font-black transition ${
                        isLight
                          ? 'text-slate-900 group-hover:text-cyan-700'
                          : 'text-white group-hover:text-cyan-300'
                      }`}>
                        {proto.name}
                      </h4>
                      <span className={`text-[10px] font-mono font-bold ${
                        isLight ? 'text-cyan-700' : 'text-cyan-400'
                      }`}>
                        {proto.tagline}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  ) : (
                    <span className={`text-[10px] transition flex items-center gap-0.5 ${
                      isLight ? 'text-slate-500 group-hover:text-cyan-700' : 'text-slate-500 group-hover:text-cyan-300'
                    }`}>
                      Apply <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <p className={`text-[11px] leading-relaxed mt-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {proto.description}
                </p>
              </div>

              <div className={`mt-2.5 pt-2 border-t text-[10px] flex items-center justify-between ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}>
                <span className="truncate max-w-[190px]">
                  Best for: {proto.recommendedFor}
                </span>
                <span className={`font-mono font-bold shrink-0 ${
                  isLight ? 'text-cyan-800' : 'text-cyan-300'
                }`}>
                  {proto.focusMinutes}m / {proto.breakMinutes}m
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
