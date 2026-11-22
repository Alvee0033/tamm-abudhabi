"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { 
  LogOut, 
  LayoutDashboard, 
  FileCheck2, 
  ExternalLink,
  ShieldCheck,
  Search,
  PlusCircle,
  Menu,
  X,
  Settings
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get("admin_token");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (token) {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  if (!isClient) return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    Cookies.remove("admin_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col md:flex-row antialiased">
      {/* ─── Mobile Sticky Top Header ─── */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base leading-none block">TAMM</span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">Admin Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ─── Mobile Drawer Menu ─── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-5 flex flex-col justify-between z-50 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">TAMM Verification</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-1.5">
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    pathname === "/admin"
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Licenses List
                </Link>
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    pathname === "/admin/settings"
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings & Profile
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Public Verification Tool
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link href="/admin/settings" className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 transition rounded-xl">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                  AD
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 truncate">Admin Account</p>
                  <p className="text-[10px] text-slate-400 truncate">Settings & Password</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-slate-200/80 flex-col justify-between shrink-0 h-screen sticky top-0 shadow-2xs">
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none block">TAMM</span>
              <span className="text-[11px] text-slate-400 font-medium">License Verification</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="p-4 space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                pathname === "/admin"
                  ? "bg-teal-50 text-teal-700 font-semibold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Licenses Management</span>
            </Link>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                pathname === "/admin/settings"
                  ? "bg-teal-50 text-teal-700 font-semibold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Public Verify Page</span>
            </Link>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link href="/admin/settings" className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100 transition rounded-xl">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">Account Settings</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-6 pt-3 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* ─── Mobile Bottom Floating Dock ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-6 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition ${
            pathname === "/admin" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Licenses</span>
        </Link>

        {/* Center action button */}
        <button
          onClick={() => {
            if (pathname !== "/admin") {
              router.push("/admin");
            } else {
              const btn = document.getElementById("mobile-quick-add-btn");
              if (btn) btn.click();
            }
          }}
          className="flex flex-col items-center justify-center w-12 h-12 -mt-5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/40 active:scale-95 transition cursor-pointer"
          aria-label="Add License"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <Link
          href="/admin/settings"
          className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition ${
            pathname === "/admin/settings" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
