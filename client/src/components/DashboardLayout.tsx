import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CDN_IMAGES } from "@/lib/images";
import {
  LayoutDashboard, Building2, ClipboardList, FileText, CreditCard,
  Map, Calculator, BarChart3, Bell, LogOut, ChevronRight, ChevronLeft, Menu, X,
  TrendingUp, Briefcase, FolderLock, User, MessageSquare, Activity, Brain, Zap, Globe,
  Handshake, Wallet, Sun, Moon, Sparkles, Search, Link2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  badge?: boolean;
  notifBadge?: boolean;
  msgBadge?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

function useMenuSections(t: (key: string) => string): MenuSection[] {
  return [
    {
      title: t('nav.home'),
      items: [
        { icon: LayoutDashboard, label: t('nav.commandCenter'), path: "/dashboard" },
        { icon: TrendingUp, label: t('nav.marketplace'), path: "/marketplace" },
        { icon: Briefcase, label: t('nav.portfolio'), path: "/portfolio" },
        { icon: Handshake, label: t('nav.dealRoom'), path: "/deal-room" },
      ],
    },
    {
      title: t('nav.exhibitionManagement'),
      items: [
        { icon: Building2, label: t('nav.exhibitions'), path: "/exhibitions" },
        { icon: ClipboardList, label: t('nav.bookings'), path: "/bookings", badge: true },
        { icon: FileText, label: t('nav.contracts'), path: "/contracts" },
        { icon: CreditCard, label: t('nav.payments'), path: "/payments" },
      ],
    },
    {
      title: t('nav.analyticsAndAI'),
      items: [
        { icon: Globe, label: t('nav.digitalTwin'), path: "/digital-twin" },
        { icon: BarChart3, label: t('nav.analytics'), path: "/analytics" },
        { icon: Activity, label: t('nav.liveEconomy'), path: "/live-economy" },
        { icon: Brain, label: t('nav.aiAdvisor'), path: "/ai-advisor" },
        { icon: Calculator, label: t('nav.roiCalculator'), path: "/roi-calculator" },
      ],
    },
    {
      title: t('nav.crmIntegration'),
      items: [
        { icon: Link2, label: t('nav.crmDashboard'), path: "/crm" },
      ],
    },
    {
      title: t('common.profile'),
      items: [
        { icon: Wallet, label: t('nav.financialCenter'), path: "/financial-center" },
        { icon: FolderLock, label: t('nav.documentVault'), path: "/documents" },
        { icon: MessageSquare, label: t('common.messages'), path: "/communications", msgBadge: true },
        { icon: Map, label: t('nav.exhibitionMap'), path: "/map" },
        { icon: Bell, label: t('common.notifications'), path: "/notifications", notifBadge: true },
        { icon: User, label: t('common.profile'), path: "/profile" },
      ],
    },
  ];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { t, toggleLanguage, isRTL, locale, direction } = useLanguage();
  const menuSections = useMenuSections(t);

  const notifCount = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });

  const bookingCount = trpc.dashboard.stats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });

  const msgCount = trpc.messages.unreadCount.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 p-10 max-w-md w-full rounded-xl bg-card border border-border shadow-lg">
          <img
            src={CDN_IMAGES.mahamExpoLogoDark}
            alt="Maham Expo"
            className="h-20 w-auto object-contain"
          />
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('common.appName')}
            </h1>
            <p className="text-xs font-bold tracking-[0.2em]" style={{ color: 'var(--gold)' }}>
              {t('common.appSubtitle')}
            </p>
          </div>
          <p className="text-sm text-center leading-relaxed max-w-xs text-muted-foreground">
            {t("dashboard.layout.platformDescription")}
          </p>
          <Button
            onClick={() => { setLocation("/investor-login"); }}
            size="lg"
            className="w-full text-base font-bold py-6 rounded-xl btn-gold"
          >
            <Sparkles className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.login')}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            {t('dashboard.layout.companyFooter')}
          </p>
        </div>
      </div>
    );
  }

  const pendingBookings = bookingCount.data?.pendingBookings ?? 0;
  const unreadNotifs = (typeof notifCount.data === 'number' ? notifCount.data : 0);
  const unreadMsgs = (typeof msgCount.data === 'number' ? msgCount.data : 0);

  return (
    <div className="min-h-screen flex bg-background" style={{ direction }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ═══════════ SIDEBAR — Always Dark ═══════════ */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen z-50 transition-all duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: collapsed ? '72px' : '260px',
          background: 'var(--sidebar)',
          borderLeft: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4" style={{
          borderBottom: '1px solid var(--sidebar-border)'
        }}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img
                src={CDN_IMAGES.mahamExpoLogoDark}
                alt="Maham Expo"
                className="h-9 w-auto object-contain"
              />
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--sidebar-primary-foreground)', WebkitTextFillColor: '#F1F2F6' }}>{t('common.appName')}</p>
                <p className="text-[9px] font-bold tracking-[0.15em]" style={{ color: 'var(--gold, #D4A843)' }}>{t('common.appSubtitle')}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <img
              src={CDN_IMAGES.mahamExpoLogoDark}
              alt="Maham Expo"
              className="h-8 w-auto object-contain mx-auto"
            />
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg" style={{ color: 'var(--sidebar-foreground)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {menuSections.map((section, si) => (
            <div key={si} className="mb-1">
              {!collapsed && (
                <p className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase" style={{
                  color: 'color-mix(in srgb, var(--sidebar-foreground) 50%, transparent)'
                }}>
                  {section.title}
                </p>
              )}
              {collapsed && si > 0 && (
                <div className="mx-3 my-2 h-px" style={{ background: 'var(--sidebar-border)' }} />
              )}
              {section.items.map((item) => {
                const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                const badgeCount = item.badge ? pendingBookings : item.notifBadge ? unreadNotifs : item.msgBadge ? unreadMsgs : 0;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`w-full flex items-center gap-3 rounded-lg mb-0.5 transition-all duration-150 relative ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                    } ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator — gold bar */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full" style={{
                        background: 'var(--gold, #D4A843)',
                      }} />
                    )}

                    <item.icon
                      className="w-[18px] h-[18px] shrink-0"
                      style={{
                        color: isActive ? 'var(--gold, #D4A843)' : 'inherit'
                      }}
                    />
                    {!collapsed && (
                      <>
                        <span className="text-[13px] font-medium flex-1 text-right">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                            background: 'var(--gold, #D4A843)',
                            color: '#111'
                          }}>
                            {badgeCount}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badgeCount > 0 && (
                      <span className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ background: 'var(--gold, #D4A843)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 rounded-lg py-2 mb-0.5 transition-colors hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            {isDark ? <Sun className="w-4 h-4" style={{ color: 'var(--gold)' }} /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span className="text-xs font-medium">{isDark ? t('common.lightMode') : t('common.darkMode')}</span>}
          </button>

          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-2 rounded-lg py-2 mb-0.5 transition-colors hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            <Languages className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            {!collapsed && <span className="text-xs font-medium">{locale === 'ar-SA' ? 'English' : t('dashboard.layout.arabic')}</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex w-full items-center gap-2 rounded-lg py-2 transition-colors hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {!collapsed && <span className="text-xs font-medium">{t('nav.collapseMenu')}</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{
              background: 'oklch(0.72 0.12 75 / 0.15)',
              color: 'var(--gold)',
              border: '1.5px solid oklch(0.72 0.12 75 / 0.3)'
            }}>
              {user.name?.charAt(0) || t('dashboard.layout.m')}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#F1F2F6' }}>{user.name || (locale === 'ar-SA' ? t('dashboard.layout.investor') : 'Investor')}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-foreground)' }}>{user.email || ''}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="p-1.5 rounded-lg transition-colors hover:bg-destructive/15 hover:text-destructive" style={{
                color: 'var(--sidebar-foreground)'
              }}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 h-14 bg-background/90 backdrop-blur-md border-b border-border">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-muted border border-border" style={{ width: '260px' }}>
              <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Center: Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <img
              src={CDN_IMAGES.mahamExpoLogoDark}
              alt="Maham Expo"
              className="h-7 w-auto object-contain"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-0.5">
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors hover:bg-muted" style={{ color: 'var(--gold)' }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground"
              title={locale === 'ar-SA' ? 'Switch to English' : t('dashboard.layout.switchToArabic')}
            >
              <span className="text-xs font-bold">
                {locale === 'ar-SA' ? 'EN' : t('dashboard.layout.ar')}
              </span>
            </button>
            <button onClick={() => setLocation('/communications')} className="relative p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              {unreadMsgs > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center" style={{
                  background: 'var(--gold)',
                  color: '#111'
                }}>
                  {unreadMsgs}
                </span>
              )}
            </button>
            <button onClick={() => setLocation('/notifications')} className="relative p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground">
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center" style={{
                  background: 'var(--gold)',
                  color: '#111'
                }}>
                  {unreadNotifs}
                </span>
              )}
            </button>
            <div className="hidden lg:flex items-center gap-2 mr-2 pr-3 border-r border-border">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{
                background: 'oklch(0.72 0.12 75 / 0.1)',
                color: 'var(--gold)',
                border: '1.5px solid oklch(0.72 0.12 75 / 0.2)'
              }}>
                {user.name?.charAt(0) || t('dashboard.layout.m')}
              </div>
              <span className="text-sm font-semibold text-foreground">{user.name?.split(' ')[0] || (locale === 'ar-SA' ? t('dashboard.layout.investor') : 'Investor')}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-3 px-4 text-center border-t border-border">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t('dashboard.layout.companyFooter')}
          </p>
        </footer>
      </div>
    </div>
  );
}
