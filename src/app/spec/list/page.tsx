"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, Clock, AlertTriangle, CheckCircle2, Search, Copy } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { specService, type Specification } from "@/lib/supabase/specService";

const STATUS_DISPLAY: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  DRAFTING:         { label: "작성 중",   cls: "drafting",  icon: <Clock className="w-3.5 h-3.5" /> },
  REVIEW_REQUESTED: { label: "검토 요청", cls: "review",    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  APPROVED:         { label: "승인 완료", cls: "approved",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED:         { label: "반려됨",   cls: "rejected",  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

export default function SpecListPage() {
  const [specs, setSpecs]  = useState<Specification[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const filtered = specs
    .filter((s) => filter === "ALL" || s.status === filter)
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.doc_number.toLowerCase().includes(q) ||
        (s.product_name || "").toLowerCase().includes(q) ||
        (s.form_data.material || "").toLowerCase().includes(q) ||
        (s.form_data.shape || "").toLowerCase().includes(q)
      );
    });

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-factory-100">시방서 목록</h1>
            <p className="text-sm text-factory-400 mt-1">전체 {specs.length}건</p>
          </div>
          <Link id="btn-new-spec" href="/spec/new" className="btn-primary">
            <FilePlus2 className="w-4 h-4" />
            신규 작성
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-factory-900/40 p-4 rounded-xl border border-factory-800/50">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "ALL",              label: `전체 (${specs.length})` },
              { key: "DRAFTING",         label: "작성 중" },
              { key: "REVIEW_REQUESTED", label: "검토 요청" },
              { key: "APPROVED",         label: "승인 완료" },
            ].map((f) => (
              <button
                key={f.key}
                id={`filter-${f.key}`}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === f.key 
                    ? "bg-factory-500 text-white shadow-factory-glow" 
                    : "bg-factory-950/50 text-factory-400 hover:text-factory-200 border border-factory-800/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-factory-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="문서 번호, 제품명, 소재 검색..."
              className="factory-input pl-10 h-10 text-xs"
            />
          </div>
        </div>

        <section className="factory-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <FilePlus2 className="w-8 h-8 text-factory-600" />
              <p className="text-factory-500 text-sm">해당 조건의 시방서가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                    <tr>
                      <th>문서 번호</th><th>제품명</th><th>형상</th><th>소재/규격</th>
                      <th>Rev.</th><th>상태</th><th>작성일</th><th className="text-right">관리</th>
                    </tr>
                </thead>
                <tbody>
                  {filtered.map((spec, i) => {
                    const st = STATUS_DISPLAY[spec.status] ?? STATUS_DISPLAY.DRAFTING;
                    return (
                      <tr key={spec.id || i} className="hover:bg-factory-800/10 transition-colors">
                        <td><span className="font-mono text-xs text-factory-300">{spec.doc_number}</span></td>
                        <td className="font-medium text-factory-100 max-w-[180px] truncate">{spec.product_name || "-"}</td>
                        <td className="text-factory-400">{spec.form_data.shape || "-"}</td>
                        <td className="text-factory-400 text-xs">{spec.form_data.material?.replace(/_/g, " ") || "-"}</td>
                        <td><span className="font-mono text-xs text-factory-400">Rev.{spec.current_revision}</span></td>
                        <td><span className={`status-badge ${st.cls}`}>{st.icon}{st.label}</span></td>
                        <td className="text-factory-500 text-xs">
                          {spec.created_at ? new Date(spec.created_at).toLocaleDateString("ko-KR") : "-"}
                        </td>
                        <td className="text-right">
                          <Link 
                            href={`/spec/new?cloneFrom=${spec.id}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-factory-800 hover:bg-factory-700 text-xs text-factory-300 transition-colors"
                            title="복사하여 새로 작성"
                          >
                            <Copy className="w-3 h-3" />
                            <span>복제</span>
                          </Link>
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
