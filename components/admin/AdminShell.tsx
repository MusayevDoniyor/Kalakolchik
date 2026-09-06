"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BellRing,
  Image as ImageIcon,
  Send,
  Activity,
  LogOut,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";

interface AdminShellProps {
  children: React.ReactNode;
  adminEmail?: string;
}

export default function AdminShell({ children, adminEmail = "otabekabduvaliyev1910@gmail.com" }: AdminShellProps) {
  const pathname = usePathname();

  // If on the login page, render full-screen content without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reminders", label: "Reminders & Cycles", icon: BellRing },
    { href: "/admin/memories", label: "Memories & Media", icon: ImageIcon },
    { href: "/admin/broadcast", label: "Broadcast Message", icon: Send },
    { href: "/admin/system", label: "System Health", icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 antialiased overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800/80 bg-[#0c1017]/90 flex flex-col justify-between backdrop-blur-xl shadow-2xl z-20">
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0c1017]" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  MindSnap
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Admin
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">MindSnap Bot</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Management
            </p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer & User Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-[#090d14]/80">
          <div className="flex items-center justify-between gap-3 px-2 py-2 mb-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{adminEmail}</p>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Super Admin
                </p>
              </div>
            </div>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] to-[#06080e] p-8 md:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
