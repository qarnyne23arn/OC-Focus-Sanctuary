import React, { useRef } from 'react';
import { BarChart3, Download, X } from 'lucide-react';
import { StudySession, BlockedWebsite, DistractionLogItem } from '../types';
import { UnifiedReportDocument } from './UnifiedReportDocument';
import { handleExportReport } from '../utils/pdfExport';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  goalMinutes: number;
  distractionCount: number;
  blockedSites?: BlockedWebsite[];
  distractionLog?: DistractionLogItem[];
  isLight?: boolean;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  goalMinutes,
  distractionCount,
  blockedSites = [],
  distractionLog = [],
  isLight = false,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const month = now.getMonth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/15 flex items-center justify-between shrink-0 bg-[#1a1d24]">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <BarChart3 className="w-5 h-5 text-[#6b9b37] shrink-0" />
            <span className="truncate">Match Report & Season Review</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-1.5 text-[11px] text-cyan-300 text-center sm:hidden flex items-center justify-center gap-1.5">
          <span>💡 Tip: Swipe horizontally or pinch to view the full report document</span>
        </div>

        {/* Modal Body / Scrollable Preview */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 flex justify-start sm:justify-center bg-[#0b0d10]">
          <div className="shadow-2xl min-w-[760px] sm:min-w-0">
            <UnifiedReportDocument
              ref={reportRef}
              sessions={sessions}
              blockedSites={blockedSites}
              distractionCount={distractionCount}
              distractionLog={distractionLog}
              dateStr={dateStr}
              year={year}
              month={month}
              goalMinutes={goalMinutes}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/15 flex items-center justify-between shrink-0 bg-[#1a1d24]">
          <button
            type="button"
            onClick={() => handleExportReport(reportRef, "daily-and-season", dateStr)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6b9b37] hover:bg-[#7ca943] text-white font-semibold text-xs transition cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
