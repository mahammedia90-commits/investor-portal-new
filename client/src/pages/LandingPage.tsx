import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { CDN_IMAGES } from "@/lib/images";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2, TrendingUp, Shield, Brain, Globe, Users,
  ChevronLeft, ChevronDown, Sparkles, ArrowLeft,
  LayoutGrid, FileText, BarChart3, Map, Zap, Headphones,
  CheckCircle2, Star, Phone, Mail, Sun, Moon, Menu, X,
  Play, Target, Layers, Award, Lock, Clock, ArrowUpRight,
  ChevronRight, Minus, Plus
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   DESIGN SYSTEM — Premium Institutional
   ═══════════════════════════════════════════════════════ */
/* Colors now come from CSS variables in index.css */

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════ */
function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let raf: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return count;
}

/* ═══════════════════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
   ═══════════════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════
   SECTION LABEL COMPONENT
   ═══════════════════════════════════════════════════════ */
function SectionLabel({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 max-w-[40px]" style={{ background: 'var(--gold)' }} />
      <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--gold)' }}>
        {children}
      </span>
      <div className="h-px flex-1 max-w-[40px]" style={{ background: 'var(--gold)' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, tArray, locale, isRTL, toggleLanguage } = useLanguage();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const isLoggedIn = !!meQuery.data;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = useCallback(() => {
    if (isLoggedIn) {
      setLocation("/dashboard");
    } else {
      setLocation("/investor-login");
    }
  }, [isLoggedIn, setLocation]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  }, []);

  // Clean Design System — Uses CSS variables
  const colors = {
    bg: 'var(--background)',
    bgAlt: 'var(--card)',
    card: 'var(--card)',
    cardHover: 'var(--card)',
    border: 'var(--border)',
    borderHover: 'var(--gold)',
    text: 'var(--text-primary)',
    textSub: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    navBg: isDark ? 'rgba(15, 17, 23, 0.9)' : 'rgba(250, 250, 248, 0.9)',
  };

  const navLinks = [
    { label: t('landingPage.nav.whyMahamExpo'), id: "why" },
    { label: t('landingPage.nav.howItWorks'), id: "how" },
    { label: t('landingPage.nav.platform'), id: "features" },
    { label: t('landingPage.nav.faq'), id: "faq" },
  ];

  return (
    <div style={{ background: colors.bg, direction: isRTL ? 'rtl' : 'ltr', fontFamily: isRTL ? "'Cairo', 'Inter', sans-serif" : "'Inter', 'Poppins', sans-serif" }} className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? colors.navBg : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: scrolled ? `1px solid ${colors.border}` : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img
                src={CDN_IMAGES.mahamExpoLogoDark}
                alt="Maham Expo"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-px h-5" style={{ background: 'rgba(152,112,18,0.2)' }} />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: colors.textMuted }}>
                  INVESTOR PORTAL
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: colors.textSub }}
                >
                  {link.label}
                </button>
              ))}
              <div className="w-px h-5 mx-3" style={{ background: colors.border }} />
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: colors.textMuted }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogin}
                className="glass-btn-gold glass-btn-sm mr-2"
              >
                <span className="flex items-center gap-2">
                  {isLoggedIn ? t('landing.enterPlatform') : t('landing.enterPlatformGuest')}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 rounded-lg text-[12px] font-bold transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: colors.textMuted, border: `1px solid ${colors.border}` }}
              >
                {t('landing.switchLanguage')}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <button onClick={toggleTheme} className="p-2" style={{ color: colors.textMuted }}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2" style={{ color: colors.text }}>
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden border-t" style={{ background: colors.navBg, backdropFilter: 'blur(24px)', borderColor: colors.border }}>
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block w-full text-right text-sm py-3 px-3 rounded-lg transition-colors"
                  style={{ color: colors.textSub }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleLogin}
                className="glass-btn-gold w-full mt-3"
              >
                {isLoggedIn ? t('landing.enterPlatform') : t('landing.enterPlatformGuest')}
              </button>
              <button
                onClick={toggleLanguage}
                className="w-full py-3 rounded-lg text-sm font-medium mt-2"
                style={{ color: colors.textSub, border: `1px solid ${colors.border}` }}
              >
                {t('landing.switchLanguage')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO — Split layout with strong hierarchy
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={CDN_IMAGES.heroMegaVenue}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.15) saturate(0.6)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.85) 100%)'
          }} />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(152,112,18,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(152,112,18,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, var(--gold), transparent)` }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Content — 7 columns */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
                style={{
                  background: 'rgba(152,112,18,0.08)',
                  border: '1px solid rgba(152,112,18,0.15)',
                }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--gold)' }}>
                  {t('landing.heroTag')}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-black leading-[1.1] mb-6 tracking-tight"
                style={{ color: colors.text }}>
                {t('landing.heroTitleLine1')}
                <br />
                <span className="relative inline-block">
                  <span style={{ color: 'var(--gold)' }}>{t('landing.heroTitleHighlight')}</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, var(--gold), transparent)` }} />
                </span>
                {' '}{t('landing.heroTitleLine2')}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg leading-relaxed mb-4 max-w-2xl"
                style={{ color: colors.textSub }}>
                {t('landing.heroSubtitle')}
              </p>

              <p className="text-sm mb-10 max-w-xl" style={{ color: colors.textMuted }}>
                {t('landing.heroDescription')}
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-14">
                <button
                  onClick={handleLogin}
                  className="glass-btn-gold glass-btn-lg glass-btn-pulse glass-btn-ripple group w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoggedIn ? t('landing.enterPlatform') : t('landing.enterPlatformGuest')}
                    {isRTL ? <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> : <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                  </span>
                </button>
                <button
                  onClick={() => scrollTo("why")}
                  className="glass-btn-secondary glass-btn-lg w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t('landing.discoverPlatform')}
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
              </div>

              {/* Trust Numbers */}
              <div className="flex items-center gap-8 sm:gap-12">
                {[
                  { value: "+250M", label: t('landing.projectVolume') },
                  { value: "+35", label: t('landing.activeProjects') },
                  { value: "+12K", label: t('landing.commercialUnits') },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--gold)' }}>{item.value}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual — 5 columns */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Main image card */}
                <div className="rounded-2xl overflow-hidden shadow-2xl" style={{
                  border: `1px solid ${colors.border}`,
                }}>
                  <img
                    src={CDN_IMAGES.luxuryEventVenue}
                    alt={t('landing.luxuryEventAlt')}
                    className="w-full h-[420px] object-cover"
                    data-no-filter
                  />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-6 -right-6 p-4 rounded-xl shadow-xl glass-card" style={{
                  border: `1px solid ${colors.border}`,
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `rgba(152,112,18,0.1)` }}>
                      <TrendingUp className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: colors.text }}>{t('landing.occupancyRate')}</div>
                      <div className="text-lg font-black" style={{ color: 'var(--gold)' }}>96%</div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -left-4 px-4 py-2 rounded-lg shadow-lg glass-card" style={{
                  border: `1px solid ${colors.border}`,
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold" style={{ color: colors.text }}>+48K {t('landing.activeTraders')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{
          background: `linear-gradient(to top, ${colors.bg}, transparent)`
        }} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          WHO IS THIS FOR
          ═══════════════════════════════════════════════════════ */}
      <WhoSection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          WHY MAHAM EXPO
          ═══════════════════════════════════════════════════════ */}
      <WhySection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <HowSection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════ */}
      <StatsSection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════════════ */}
      <FeaturesSection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <TestimonialsSection isDark={isDark} colors={colors} />

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <FaqSection isDark={isDark} colors={colors} openFaq={openFaq} setOpenFaq={setOpenFaq} />

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: colors.bgAlt }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(152,112,18,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <SectionLabel isDark={isDark}>{t('landing.cta.sectionTitle')}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-5" style={{ color: colors.text }}>
            {t('landing.cta.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.cta.titleHighlight')}</span>
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: colors.textSub }}>
            {t('landing.cta.description')}
          </p>
          <button
            onClick={handleLogin}
            className="glass-btn-gold glass-btn-lg glass-btn-pulse glass-btn-ripple group"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoggedIn ? t('landing.enterPlatform') : t('landing.cta.enterPlatformNow')}
              {isRTL ? <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> : <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="py-12 border-t" style={{ background: colors.bg, borderColor: colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <img
                src={CDN_IMAGES.mahamExpoLogoDark}
                alt="Maham Expo"
                className="h-10 w-auto object-contain mb-4"
              />
              <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                {t('landing.footer.companyDescription')}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.text }}>{t('landing.footer.quickLinks')}</h4>
              <div className="space-y-2.5">
                {[t('landing.footer.aboutUs'), t('landing.footer.privacyPolicy'), t('landing.footer.termsAndConditions'), t('landing.footer.usageAgreement')].map((link, i) => (
                  <button key={i} className="block text-sm transition-colors hover:underline" style={{ color: colors.textMuted }}>
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.text }}>{t('landing.footer.contact')}</h4>
              <div className="space-y-3">
                {[
                  { icon: Phone, text: "+966 53 555 5900", dir: 'ltr' as const },
                  { icon: Phone, text: "+966 53 477 8899", dir: 'ltr' as const },
                  { icon: Mail, text: "info@mahamexpo.sa" },
                  { icon: Mail, text: "rent@mahamexpo.sa" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                    <span className="text-sm" style={{ color: colors.textMuted, direction: item.dir || 'rtl' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: colors.border }}>
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {t('landing.footer.allRightsReserved')} &copy; {new Date().getFullYear()} — {t('landing.footer.companyName')}
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
              Maham Expo — Investor Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WHO SECTION
   ═══════════════════════════════════════════════════════ */
function WhoSection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { t, tArray } = useLanguage();
  const { ref, visible } = useReveal();
  const icons = [Building2, Shield, Globe, Users];
  const audienceData = tArray('landing.who.audiences');
  const audiences = audienceData.map((a: any, i: number) => ({
    icon: icons[i] || Building2,
    title: a.title,
    desc: a.desc,
    tag: a.tag,
  }));

  return (
    <section className="py-20 sm:py-28" style={{ background: colors.bg }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.who.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.who.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.who.titleHighlight')}</span>
          </h2>
          <p className="text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textSub }}>
            {t('landing.who.description')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {audiences.map((item, i) => (
            <div
              key={i}
              className="group p-6 sm:p-7 rounded-2xl transition-all duration-500"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 100}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(152,112,18,0.25)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(152,112,18,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl shrink-0 transition-colors duration-300" style={{
                  background: 'rgba(152,112,18,0.06)',
                }}>
                  <item.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold mb-1.5" style={{ color: colors.text }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: colors.textSub }}>{item.desc}</p>
                  <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-md" style={{
                    background: 'rgba(152,112,18,0.06)',
                    color: 'var(--gold)',
                  }}>
                    {item.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   WHY SECTION
   ═══════════════════════════════════════════════════════ */
function WhySection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { t, tArray } = useLanguage();
  const { ref, visible } = useReveal();
  const whyIcons = [LayoutGrid, TrendingUp, Target, Layers, Brain, Lock];
  const valuesData = tArray('landing.why.values');
  const values = valuesData.map((v: any, i: number) => ({
    icon: whyIcons[i] || LayoutGrid,
    title: v.title,
    desc: v.desc,
  }));

  return (
    <section id="why" className="py-20 sm:py-28" style={{ background: colors.bgAlt }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.why.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.why.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.why.titleHighlight')}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {values.map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl transition-all duration-500 relative overflow-hidden"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(152,112,18,0.25)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, var(--gold), transparent)` }} />
              <div className="p-2.5 rounded-xl inline-block mb-4" style={{ background: 'rgba(152,112,18,0.06)' }}>
                <item.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
              <h3 className="text-[15px] font-bold mb-2" style={{ color: colors.text }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW SECTION
   ═══════════════════════════════════════════════════════ */
function HowSection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { t, tArray } = useLanguage();
  const { ref, visible } = useReveal();
  const howIcons = [Building2, LayoutGrid, Users, BarChart3];
  const stepsData = tArray('landing.how.steps');
  const steps = stepsData.map((s: any, i: number) => ({
    num: s.num,
    title: s.title,
    desc: s.desc,
    icon: howIcons[i] || Building2,
  }));

  return (
    <section id="how" className="py-20 sm:py-28" style={{ background: colors.bg }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.how.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.how.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.how.titleHighlight')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden" style={{
            border: `1px solid ${colors.border}`,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            <img
              src={CDN_IMAGES.venueOperations}
              alt={t('landing.how.spaceManagementAlt')}
              className="w-full h-auto object-cover"
              data-no-filter
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group flex gap-4 p-5 rounded-xl transition-all duration-500"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(30px)',
                  transitionDelay: `${i * 150}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(152,112,18,0.25)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-sm font-black"
                  style={{ background: `linear-gradient(135deg, var(--gold), var(--gold-light))`, color: '#FFFFFF' }}>
                  {step.num}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold mb-1" style={{ color: colors.text }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STATS SECTION
   ═══════════════════════════════════════════════════════ */
function StatsSection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { ref, visible } = useReveal();
  const { t, tArray } = useLanguage();
  const statIcons = [TrendingUp, Building2, LayoutGrid, Users, Target, Zap];
  const statNums = [{ end: 250, suffix: 'M+' }, { end: 35, suffix: '+' }, { end: 12, suffix: 'K+' }, { end: 48, suffix: 'K+' }, { end: 96, suffix: '%' }, { end: 99, suffix: '.97%', fixed: true }];
  const statsLabels = tArray('landing.stats.items');
  const stats = statNums.map((s, i) => ({
    ...s,
    label: statsLabels[i]?.label || '',
    icon: statIcons[i] || TrendingUp,
  }));

  return (
    <section className="py-20 sm:py-28" style={{ background: colors.bgAlt }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.stats.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.stats.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.stats.titleHighlight')}</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} visible={visible} isDark={isDark} colors={colors} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, visible, isDark, colors, delay }: any) {
  const animatedCount = useCountUp(stat.end, 2000, visible);
  const displayValue = stat.fixed ? stat.end : animatedCount;
  return (
    <div
      className="group p-5 sm:p-6 rounded-2xl text-center transition-all duration-500 relative overflow-hidden"
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(152,112,18,0.25)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top line accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, var(--gold), transparent)` }} />
      <stat.icon className="w-5 h-5 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
      <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--gold)' }}>
        {displayValue}{stat.suffix}
      </div>
      <div className="text-xs sm:text-sm mt-1.5" style={{ color: colors.textSub }}>{stat.label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════════════════════ */
function FeaturesSection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { ref, visible } = useReveal();
  const { t, tArray } = useLanguage();
  const featureIcons = [Map, LayoutGrid, FileText, BarChart3, Brain, Headphones];
  const featuresData = tArray('landing.features.items');
  const features = featuresData.map((f: any, i: number) => ({
    icon: featureIcons[i] || Map,
    title: f.title,
    desc: f.desc,
  }));

  return (
    <section id="features" className="py-20 sm:py-28" style={{ background: colors.bg }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.features.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.features.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.features.titleHighlight')}</span> {t('landing.features.titleSuffix')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl transition-all duration-500 relative overflow-hidden"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(152,112,18,0.25)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, var(--gold), transparent)` }} />
              <div className="p-2.5 rounded-xl inline-block mb-4" style={{ background: 'rgba(152,112,18,0.06)' }}>
                <item.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
              <h3 className="text-[15px] font-bold mb-2" style={{ color: colors.text }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════ */
function TestimonialsSection({ isDark, colors }: { isDark: boolean; colors: any }) {
  const { ref, visible } = useReveal();
  const { t, tArray } = useLanguage();
  const testimonials = tArray('landing.testimonials.items');

  return (
    <section className="py-20 sm:py-28" style={{ background: colors.bgAlt }}>
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.testimonials.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.testimonials.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.testimonials.titleHighlight')}</span> {t('landing.testimonials.titleSuffix')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((item: any, i: number) => (
            <div
              key={i}
              className="p-6 sm:p-7 rounded-2xl transition-all duration-500 flex flex-col"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 150}ms`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--gold)' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: colors.textSub }}>
                "{item.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  background: 'rgba(152,112,18,0.1)',
                  color: 'var(--gold)',
                }}>
                  {item.initials}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: colors.text }}>{item.name}</div>
                  <div className="text-[11px]" style={{ color: colors.textMuted }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ SECTION
   ═══════════════════════════════════════════════════════ */
function FaqSection({ isDark, colors, openFaq, setOpenFaq }: { isDark: boolean; colors: any; openFaq: number | null; setOpenFaq: (v: number | null) => void }) {
  const { ref, visible } = useReveal();
  const { t, tArray } = useLanguage();
  const faqs = tArray('landing.faq.items');

  return (
    <section id="faq" className="py-20 sm:py-28" style={{ background: colors.bg }}>
      <div ref={ref} className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <SectionLabel isDark={isDark}>{t('landing.faq.sectionTitle')}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: colors.text }}>
            {t('landing.faq.title')} <span style={{ color: 'var(--gold)' }}>{t('landing.faq.titleHighlight')}</span>
          </h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  background: colors.card,
                  border: `1px solid ${isOpen ? ('rgba(152,112,18,0.25)') : colors.border}`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(10px)',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-right"
                >
                  <span className="text-sm font-bold" style={{ color: isOpen ? 'var(--gold)' : colors.text }}>{faq.q}</span>
                  <div className="shrink-0 mr-4 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300" style={{
                    background: isOpen ? ('rgba(152,112,18,0.1)') : 'transparent',
                  }}>
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                    ) : (
                      <Plus className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
                    )}
                  </div>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{
                  maxHeight: isOpen ? '300px' : '0',
                  opacity: isOpen ? 1 : 0,
                }}>
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: colors.textSub }}>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
