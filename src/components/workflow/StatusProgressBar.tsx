"use client";

import { Check, Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusProgressBarProps {
  status: "DRAFTING" | "REVIEW_REQUESTED" | "APPROVED" | "REJECTED";
}

const STAGES = [
  { id: "DRAFTING", label: "작성 중", icon: Clock },
  { id: "REVIEW_REQUESTED", label: "검토 요청", icon: Eye },
  { id: "APPROVED", label: "최종 승인", icon: CheckCircle2 },
];

export default function StatusProgressBar({ status }: StatusProgressBarProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === status);
  const isRejected = status === "REJECTED";

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between">
        {/* 연결 선 */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-factory-800 -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-factory-500 -translate-y-1/2 transition-all duration-500 -z-0"
          style={{
            width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {/* 단계별 원형 아이콘 */}
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < currentIndex || status === "APPROVED";
          const isActive = idx === currentIndex && !isRejected;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-factory-600 border-factory-500 text-white"
                    : isActive
                    ? "bg-factory-900 border-factory-400 text-factory-200 shadow-factory-glow"
                    : "bg-factory-950 border-factory-800 text-factory-600"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={cn(
                  "mt-3 text-xs font-medium transition-colors",
                  isActive ? "text-factory-200" : isCompleted ? "text-factory-400" : "text-factory-600"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-6 p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center gap-3 animate-fade-in">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-sm font-semibold text-red-200">반려됨</div>
            <div className="text-xs text-red-400/80">시방서 내용 수정이 필요합니다. 리비전을 생성하여 다시 제출하세요.</div>
          </div>
        </div>
      )}
    </div>
  );
}
