import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapaValidationResult } from "@/lib/capaValidator";

interface CapaWarningBadgeProps {
  results: CapaValidationResult[];
  className?: string;
}

export default function CapaWarningBadge({ results, className }: CapaWarningBadgeProps) {
  const failures = results.filter((r) => !r.result.passed);
  const allPassed = failures.length === 0 && results.length > 0;

  if (results.length === 0) return null;

  if (allPassed) {
    return (
      <div className={cn("capa-ok-banner", className)}>
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-300">CAPA 검증 통과</p>
          <p className="text-xs text-green-500 mt-0.5">
            15,000T 프레스 물리적 제약 범위 내 — 단조 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {failures.map((item, idx) => (
        <div key={idx} className="capa-error-banner">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-red-300">
                ⛔ CAPA 초과 — {item.rule}
              </p>
              {item.result.errorCode && (
                <span className="text-xs font-mono bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded border border-red-700/40">
                  {item.result.errorCode}
                </span>
              )}
            </div>
            <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
              {item.result.message}
            </p>
            {item.result.limit && (
              <div className="flex items-center gap-1.5 mt-2">
                <Info className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-500 font-mono">{item.result.limit}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
