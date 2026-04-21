"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FilePlus2, FileDown, Search } from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import { specService, type Specification } from "@/lib/supabase/specService";

export default function ApprovedPage() {
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const all = await specService.getSpecs();
        setSpecs(all.filter((s) => s.status === "APPROVED"));
      } catch (err) {
        console.error("Failed to load approved specs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = specs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.doc_number.toLowerCase().includes(q) || (s.product_name || "").toLowerCase().includes(q);
  });

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-factory-100 uppercase tracking-tight">승인 완료 시방서</h1>
            <p className="text-sm text-factory-400 mt-1">총 {specs.length}건의 문서가 최종 승인되었습니다.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-factory-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="문서 번호, 제품명 검색..."
              className="factory-input pl-10 h-10 text-xs"
            />
          </div>
        </div>
        <section className="factory-card overflow-hidden">
          {specs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-factory-600" />
              <p className="text-factory-500 text-sm">승인 완료된 시방서가 없습니다.</p>
              <Link href="/spec/new" className="btn-primary text-sm">
                <FilePlus2 className="w-4 h-4" />새 시방서 작성
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>문서 번호</th><th>제품명</th><th>형상</th><th>소재/규격</th>
                    <th>Rev.</th><th>작성자</th><th>승인일</th><th className="text-right">출력</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((spec, i) => (
                    <tr key={spec.id || i} className="hover:bg-factory-800/10 cursor-pointer">
                      <td><span className="font-mono text-xs text-factory-300">{spec.doc_number}</span></td>
                      <td className="font-medium text-factory-100">{spec.product_name || "-"}</td>
                      <td className="text-factory-400">{spec.form_data.shape || "-"}</td>
                      <td className="text-factory-400 text-xs">{spec.form_data.material?.replace(/_/g, " ") || "-"}</td>
                      <td><span className="font-mono text-xs text-factory-400">Rev.{spec.current_revision}</span></td>
                      <td className="text-factory-400 text-xs">{spec.created_by}</td>
                      <td className="text-factory-500 text-xs">
                        {spec.created_at ? new Date(spec.created_at).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td className="text-right">
                        <a 
                          href={`/api/pdf/${spec.id}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-factory-300 hover:text-factory-100 transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
