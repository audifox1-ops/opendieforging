"use client";

import { History, User, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Revision {
  revision: number;
  changed_by: string;
  change_summary: string;
  created_at: string;
}

interface RevisionHistoryProps {
  revisions: Revision[];
}

export default function RevisionHistory({ revisions }: RevisionHistoryProps) {
  if (!revisions || revisions.length === 0) return null;

  return (
    <section className="factory-card p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-factory-800/50 pb-4">
        <History className="w-5 h-5 text-factory-400" />
        <h3 className="text-lg font-semibold text-factory-100">문서 리비전 이력</h3>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-factory-700 before:via-factory-800 before:to-transparent">
        {revisions.map((rev, idx) => (
          <div key={idx} className="relative flex items-start group">
            {/* 타임라인 마커 */}
            <div className="absolute left-5 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full bg-factory-900 border-2 border-factory-600 group-hover:border-factory-400 transition-colors z-10" />
            
            <div className="flex-1 ml-12">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-factory-200">Rev.{rev.revision}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-factory-800 text-factory-400">
                    {rev.change_summary}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-factory-500">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(rev.created_at), "yyyy-MM-dd HH:mm", { locale: ko })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-factory-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {rev.changed_by}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  스냅샷 저장됨
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
