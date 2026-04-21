"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Factory, AlertTriangle, Search, ArrowRight,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { SPEC_STATUSES } from "@/constants/pressLimits";
import { safeStorage } from "@/lib/storage";
import { specService, type Specification } from "@/lib/supabase/specService";

const STATUS_DISPLAY: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  DRAFTING:         { label: "작성 중",   cls: "drafting",  icon: <Clock className="w-3.5 h-3.5" /> },
  REVIEW_REQUESTED: { label: "검토 요청", cls: "review",    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  APPROVED:         { label: "승인 완료", cls: "approved",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED:         { label: "반려됨",   cls: "rejected",  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

export default function DashboardPage() {
  const [specs, setSpecs]   = useState<Specification[]>([]);
  const [operator, setOp]   = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 측에서만 실행
    const name  = safeStorage.get("session", "tw_operator_name") ?? "";
    setOp(name);
    
    async function loadData() {
      try {
        const data = await specService.getSpecs();
        setSpecs(data);
      } catch (err) {
        console.error("Failed to load specs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const counts = {
    total:    specs.length,
    drafting: specs.filter((s) => s.status === "DRAFTING").length,
    review:   specs.filter((s) => s.status === "REVIEW_REQUESTED").length,
    approved: specs.filter((s) => s.status === "APPROVED").length,
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* 환영 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-6 bg-factory-900/40 p-6 rounded-2xl border border-factory-800/50 shadow-sm backdrop-blur-sm">
          <div className="flex-1 min-w-[300px] space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                반갑습니다, <span className="text-factory-300">{operator || "작업자"}</span>님 👋
              </h1>
              <p className="text-factory-400 text-sm mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-green-500/50 shadow-sm" />
                태웅 15,000T 시방서 관리 시스템 접속 중 · {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="relative group max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-factory-500 group-focus-within:text-factory-300 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="문서 번호, 제품명으로 즉시 검색..."
                className="w-full bg-factory-950/80 border border-factory-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-factory-100 placeholder:text-factory-600 focus:outline-none focus:ring-2 focus:ring-factory-500/30 focus:border-factory-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link id="btn-new-spec-hero" href="/spec/new" className="btn-primary px-8 py-3 dark-glow">
              <FilePlus2 className="w-5 h-5" />
              신규 시방서 작성
            </Link>
            <div className="flex items-center gap-4 px-2 text-[10px] text-factory-600 uppercase tracking-widest font-bold">
               TAEWOONG OPEN-DIE PRESS V1.0
            </div>
          </div>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="kpi-total"
            icon={<BarChart3 className="w-5 h-5" />}
            label="전체 시방서"
            value={counts.total}
            color="blue"
          />
          <KpiCard
            id="kpi-drafting"
            icon={<Clock className="w-5 h-5" />}
            label="작성 중"
            value={counts.drafting}
            color="slate"
          />
          <KpiCard
            id="kpi-review"
            icon={<AlertTriangle className="w-5 h-5" />}
            label="검토 요청"
            value={counts.review}
            color="amber"
          />
          <KpiCard
            id="kpi-approved"
            icon={<ClipboardCheck className="w-5 h-5" />}
            label="승인 완료"
            value={counts.approved}
            color="green"
          />
        </div>

        {/* 프레스 상태 배너 */}
        <div className="factory-card p-5">
          <div className="section-header mb-4">
            <Factory className="w-4 h-4 text-factory-400" />
            15,000T 프레스 CAPA 기준
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "프레스 용량",       value: "15,000 T",    unit: "" },
              { label: "M.P-Die 최대 거리", value: "3,500",       unit: "mm" },
              { label: "SHELL 최대 중량",   value: "100,000",     unit: "kg" },
              { label: "SHELL 최대 OD/L",   value: "4,000",       unit: "mm" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-4 rounded-lg bg-factory-900/60 border border-factory-800/40"
              >
                <div className="text-lg font-bold font-mono text-factory-200">
                  {item.value}
                  {item.unit && <span className="text-sm text-factory-400 ml-1">{item.unit}</span>}
                </div>
                <div className="text-xs text-factory-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 시방서 목록 */}
        <section className="factory-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-factory-800/50 bg-factory-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-factory-600/20 border border-factory-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-factory-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-factory-100 uppercase tracking-tight">최근 활동 내역</h3>
                <p className="text-[10px] text-factory-500 mt-0.5">가장 최근에 업데이트된 시방서 10개</p>
              </div>
            </div>
            <Link id="btn-view-all" href="/spec/list" className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-factory-800/40 text-xs text-factory-400 hover:text-factory-200 transition-all font-medium">
              전체 보기 
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {specs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-factory-900/60 border border-factory-800/50 flex items-center justify-center">
                <FilePlus2 className="w-6 h-6 text-factory-600" />
              </div>
              <p className="text-factory-400 text-sm">등록된 시방서가 없습니다.</p>
              <Link id="btn-create-first" href="/spec/new" className="btn-primary text-sm">
                <FilePlus2 className="w-4 h-4" />
                첫 시방서 작성하기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>문서 번호</th>
                    <th>제품명</th>
                    <th>형상</th>
                    <th>소재</th>
                    <th>Rev.</th>
                    <th>상태</th>
                    <th>작성자</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                    {specs
                      .filter(s => {
                        const q = searchQuery.toLowerCase();
                        return s.doc_number.toLowerCase().includes(q) || (s.product_name || "").toLowerCase().includes(q);
                      })
                      .slice(0, 10).map((spec, i) => {
                    const st = STATUS_DISPLAY[spec.status] ?? STATUS_DISPLAY.DRAFTING;
                    return (
                      <tr key={spec.id || i} className="cursor-pointer hover:bg-factory-800/10 transition-colors" onClick={() => {}}>
                        <td>
                          <span className="font-mono text-xs text-factory-300">{spec.doc_number}</span>
                        </td>
                        <td className="font-medium text-factory-100 max-w-[200px] truncate">
                          {spec.product_name || "-"}
                        </td>
                        <td className="text-factory-400">{spec.form_data.shape || "-"}</td>
                        <td className="text-factory-400 max-w-[140px] truncate text-xs">
                          {spec.form_data.material?.replace(/_/g, " ") || "-"}
                        </td>
                        <td>
                          <span className="font-mono text-xs text-factory-400">
                            Rev.{spec.current_revision}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${st.cls}`}>
                            {st.icon}
                            {st.label}
                          </span>
                        </td>
                        <td className="text-factory-400 text-xs">{spec.created_by}</td>
                        <td className="text-factory-500 text-xs">
                          {spec.created_at ? new Date(spec.created_at).toLocaleDateString("ko-KR") : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function KpiCard({
  id, icon, label, value, color,
}: { id: string; icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue:  "text-factory-300 bg-factory-700/20 border-factory-600/30",
    slate: "text-slate-300 bg-slate-800/20 border-slate-700/30",
    amber: "text-amber-300 bg-amber-900/20 border-amber-700/30",
    green: "text-green-300 bg-green-900/20 border-green-700/30",
  };
  return (
    <div id={id} className="factory-card p-5">
      <div className={`inline-flex p-2 rounded-lg border mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-factory-100 font-mono">{value}</div>
      <div className="text-xs text-factory-500 mt-1">{label}</div>
    </div>
  );
}
