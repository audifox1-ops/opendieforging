"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Factory,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  CheckSquare,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  User,
  Menu,
  X,
} from "lucide-react";
import { safeStorage } from "@/lib/storage";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", href: "/dashboard", label: "대시보드",     icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "new",       href: "/spec/new",  label: "신규 시방서",  icon: <FilePlus2 className="w-4 h-4" /> },
  { id: "list",      href: "/spec/list", label: "시방서 목록",  icon: <ClipboardList className="w-4 h-4" /> },
  { id: "approved",  href: "/spec/approved", label: "승인 완료", icon: <CheckSquare className="w-4 h-4" /> },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const [operatorName, setOperatorName] = useState("");
  const [loginTime, setLoginTime]       = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  useEffect(() => {
    const name = safeStorage.get("session", "tw_operator_name");
    const time = safeStorage.get("session", "tw_login_time");
    if (!name) {
      router.replace("/");
      return;
    }
    setOperatorName(name);
    if (time) {
      const d = new Date(time);
      setLoginTime(
        d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      );
    }
  }, [router]);

  function handleLogout() {
    safeStorage.remove("session", "tw_operator_name");
    safeStorage.remove("session", "tw_login_time");
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* ── 모바일 오버레이 ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── 사이드바 ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-factory-950/95 border-r border-factory-800/50 backdrop-blur-md
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* 로고 헤더 */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-factory-800/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-factory-600/30 border border-factory-500/30">
            <Factory className="w-5 h-5 text-factory-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-factory-300 leading-tight">TAEWOONG</div>
            <div className="text-xs text-factory-500 leading-tight">15,000T Press Ed.</div>
          </div>
          <button
            id="sidebar-close-btn"
            className="ml-auto lg:hidden text-factory-400 hover:text-factory-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="section-header px-2 pt-1 pb-2">메뉴</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.id}
                href={item.href}
                id={`nav-${item.id}`}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs bg-factory-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-factory-400" />}
              </Link>
            );
          })}
        </nav>

        {/* 하단 유저 섹션 */}
        <div className="px-3 py-4 border-t border-factory-800/50 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-factory-900/60 border border-factory-800/40">
            <div className="w-8 h-8 rounded-full bg-factory-600/40 border border-factory-500/40 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-factory-300" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-factory-100 truncate">{operatorName}</div>
              <div className="text-xs text-factory-500">접속: {loginTime}</div>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="sidebar-item w-full text-red-400/80 hover:text-red-300 hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>접속 종료</span>
          </button>
        </div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-5 py-3.5 bg-factory-950/80 border-b border-factory-800/50 backdrop-blur-md">
          {/* 모바일 햄버거 */}
          <button
            id="sidebar-open-btn"
            className="lg:hidden text-factory-400 hover:text-factory-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* 브레드크럼 */}
          <div className="flex items-center gap-2 text-sm text-factory-400 min-w-0">
            <Factory className="w-4 h-4 text-factory-500 flex-shrink-0" />
            <ChevronRight className="w-3.5 h-3.5 text-factory-700 flex-shrink-0" />
            <span className="text-factory-200 font-medium truncate">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "대시보드"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* 프레스 상태 인디케이터 */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-950/40 border border-green-700/30 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              15,000T 온라인
            </div>

            {/* 알림 */}
            <button id="notification-btn" className="relative p-2 rounded-lg hover:bg-factory-800/60 text-factory-400 hover:text-factory-200 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            {/* 사용자 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-factory-900/60 border border-factory-800/40">
              <User className="w-3.5 h-3.5 text-factory-400" />
              <span className="text-xs font-medium text-factory-200">{operatorName}</span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 p-5 lg:p-7 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
