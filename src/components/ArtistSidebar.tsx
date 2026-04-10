"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Music2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  BarChart3,
  Wallet,
  Newspaper,
  MessageCircle,
  ChevronLeft,
  LayoutDashboard,
  Music,
  FileText,
  Wrench,
  Calendar,
  Mail,
  CirclePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User as UserType } from "@/hooks/useUser";

interface ArtistSidebarProps {
  user: UserType;
  onRefresh: () => void;
}

export function ArtistSidebar({ user, onRefresh }: ArtistSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTheme = user?.theme || 'light';
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "Музыка": true,
    "Инструменты": true,
    "Поддержка": true
  });
  const [totalReleases, setTotalReleases] = useState(0);

  useEffect(() => {
    if (pathname.startsWith("/artist/tools")) {
      setOpenSubmenus(prev => ({ ...prev, "Инструменты": true }));
    }
    if (pathname.startsWith("/artist/support") || pathname === "/artist/chat" || pathname === "/artist/faq") {
      setOpenSubmenus(prev => ({ ...prev, "Поддержка": true }));
    }
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const fetchReleasesCount = async () => {
      try {
        const response = await fetch("/api/releases");
        const data = await response.json();
        setTotalReleases(data.releases?.length || 0);
      } catch (error) {
        console.error("Error fetching releases count:", error);
      }
    };
    fetchReleasesCount();
  }, []);

  const toggleSubmenu = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const menuItems = [
    {
      label: "Новый релиз",
      href: "/artist/upload",
      icon: (active: boolean) => (
        <div className="text-[#4FD1C5]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="16" height="16" rx="4" />
            <path d="M7 13V7l4-1v5" />
            <circle cx="6.5" cy="13" r="1" />
            <circle cx="10.5" cy="12" r="1" />
            <g transform="translate(14, 14)">
               <circle cx="4" cy="4" r="4" fill="#4FD1C5" stroke="none" />
               <path d="M4 2v4M2 4h4" stroke="white" strokeWidth="1" />
            </g>
          </svg>
        </div>
      ),
      active: pathname === "/artist/upload",
      isPrimary: true
    },
    {
      label: "Музыка",
      href: "/artist/releases",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      ),
      active: pathname.startsWith("/artist/releases") || pathname === "/artist/moderation" || pathname === "/artist/corrections",
      hasSubmenu: true,
      subItems: [
        { label: "Все релизы", href: "/artist/releases" },
        { label: "Черновики", href: "/artist/releases?status=draft" },
        { label: "Модерация", href: "/artist/moderation" },
        { label: "Требуются изменения", href: "/artist/corrections" },
      ]
    },
    {
      label: "Аналитика",
      href: "/artist/analytics",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <path d="M8 15v-4" />
            <path d="M12 15V8" />
            <path d="M16 15v-6" />
          </svg>
        </div>
      ),
      active: pathname === "/artist/analytics"
    },
    {
      label: "Финансы",
      href: "/artist/wallet",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <ellipse cx="16" cy="17" rx="3" ry="1.5" />
            <ellipse cx="16" cy="20" rx="3" ry="1.5" />
            <path d="M13 17v3M19 17v3" />
          </svg>
        </div>
      ),
      active: pathname === "/artist/wallet"
    },
    {
      label: "Инструменты",
      href: "/artist/tools/lyrics",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
      ),
      active: pathname.startsWith("/artist/tools"),
      hasSubmenu: true,
      subItems: [
        { label: "Загрузка текста", href: "/artist/tools/lyrics" },
      ]
    },
    {
      label: "Новости",
      href: "/artist/dashboard",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4" />
            <path d="M4 10h16" />
            <path d="M8 14h8M8 17h5" />
          </svg>
        </div>
      ),
      active: pathname === "/artist/dashboard"
    },
    {
      label: "Поддержка",
      href: "/artist/support",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            <path d="M22 8l-10 7L2 8" />
            <circle cx="19" cy="7" r="3" fill={active ? "#4FD1C5" : "#6B7280"} stroke="none" />
          </svg>
        </div>
      ),
      active: pathname.startsWith("/artist/support") || pathname === "/artist/chat" || pathname === "/artist/faq",
      hasSubmenu: true,
      subItems: [
        { label: "Тикеты", href: "/artist/support" },
        { label: "Чат", href: "/artist/chat" },
        { label: "FAQ", href: "/artist/faq" },
      ]
    },
    {
      label: "Маркетинг",
      href: "/artist/marketing/pitching",
      icon: (active: boolean) => (
        <div className={cn(active ? "text-[#4FD1C5]" : "text-neutral-500")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      ),
      active: pathname.startsWith("/artist/marketing"),
      hasSubmenu: true,
      subItems: [
        { label: "Питчинг", href: "/artist/marketing/pitching" },
      ]
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 260,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0)
        }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-[#121212] border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-300 font-[Manrope,sans-serif]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header/Logo */}
        <div className={cn(
          "p-6 flex items-center gap-3",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-10 h-10 flex-shrink-0 relative">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/175b7615-9aa8-4afa-a42b-d4602f227d92-1766680751038.png?width=8000&height=8000&resize=contain"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white leading-tight">NIGHTVOLT</h2>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Artist Portal</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <div key={item.label} className="space-y-1">
              {item.hasSubmenu && !isCollapsed ? (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => toggleSubmenu(e, item.label)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                      item.active 
                        ? "text-[#4FD1C5] bg-[#4FD1C5]/5" 
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon(item.active)}
                      <span className="font-medium text-[15px]">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openSubmenus[item.label] && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openSubmenus[item.label] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 py-1 space-y-1">
                          {item.subItems?.map((sub) => {
                             const isSubActive = pathname === sub.href || (sub.href.includes("?") && pathname === sub.href.split("?")[0]);
                             return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={cn(
                                    "block py-2 text-[13px] transition-colors",
                                    isSubActive 
                                      ? "text-[#4FD1C5]" 
                                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                                  )}
                                >
                                  {sub.label}
                                </Link>
                             );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    item.active 
                      ? "text-[#4FD1C5] bg-[#4FD1C5]/5" 
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <div className="flex-shrink-0">
                    {item.icon(item.active)}
                  </div>
                  {!isCollapsed && (
                    <span className={cn(
                      "font-medium text-[15px]",
                      item.isPrimary && "text-[#4FD1C5]"
                    )}>
                      {item.label}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-900 dark:text-white">
                {user.name?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 transition-all duration-200",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Выйти</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${mounted && currentTheme === 'dark' ? '#262626' : '#e5e5e5'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${mounted && currentTheme === 'dark' ? '#404040' : '#d4d4d4'};
        }
      `}</style>
    </>
  );
}
