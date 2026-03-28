import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DASHBOARD_IMAGES, CDN_IMAGES } from "@/lib/images";
import {
  Building2, TrendingUp, ClipboardList, FileText, CreditCard,
  ArrowUpRight, ArrowDownRight, Sparkles, Zap, Activity, Eye,
  ChevronLeft, BarChart3, Briefcase, Target, Shield, Star, Clock,
  Globe, Users, MapPin, Calendar, ArrowRight, Layers, PieChart,
  Wallet, Brain, Award
} from "lucide-react";
import { useLocation } from "wouter";

/* ═══════════════════════════════════════════════════════════
   DESIGN SYSTEM — Unified Gold Palette
   All icons use gold tones for consistency.
   Cards have clear borders + shadows.
   Background is clean neutral (not cream).
   ═══════════════════════════════════════════════════════════ */

/* Colors from CSS variables */
const GOLD_WARM = 'var(--gold-light)';
const GOLD_DEEP = '#A67C00';

/* Card styling — Sovereign Glassmorphism (Dual Mode) */
/* Card styling uses .nour-card CSS class from index.css */
const cardStyle = (_isDark?: boolean): React.CSSProperties => ({});
/* Icon container — all gold tones (Dual Mode) */
const iconBox = (isDark?: boolean, variant: 'primary' | 'warm' | 'amber' | 'deep' = 'primary') => {
  const dark = isDark !== false;
  const colors = {
    primary: { bg: dark ? 'rgba(152,112,18,0.12)' : 'rgba(152,112,18,0.08)', color: 'var(--gold)', border: dark ? 'rgba(152,112,18,0.2)' : 'rgba(152,112,18,0.15)' },
    warm: { bg: dark ? 'rgba(152,112,18,0.12)' : 'rgba(152,112,18,0.08)', color: GOLD_WARM, border: dark ? 'rgba(152,112,18,0.2)' : 'rgba(152,112,18,0.15)' },
    amber: { bg: dark ? 'rgba(196,155,26,0.12)' : 'rgba(196,155,26,0.08)', color: 'var(--gold-light)', border: dark ? 'rgba(196,155,26,0.2)' : 'rgba(196,155,26,0.15)' },
    deep: { bg: dark ? 'rgba(166,124,0,0.12)' : 'rgba(166,124,0,0.08)', color: GOLD_DEEP, border: dark ? 'rgba(166,124,0,0.2)' : 'rgba(166,124,0,0.15)' },
  };
  return colors[variant];
};

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t, locale, isRTL } = useLanguage();

  const stats = trpc.dashboard.stats.useQuery(undefined, { enabled: !!user });
  const exhibitionsQuery = trpc.exhibitions.list.useQuery(undefined, { enabled: !!user });

  const data = stats.data;
  const activeExhibitions = data?.activeExhibitions ?? 0;
  const pendingBookings = data?.pendingBookings ?? 0;
  const activeContracts = data?.activeContracts ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;

  /* Text colors — Sovereign Dark Mode */
  const textPrimary = 'var(--text-primary)';
  const textSecondary = 'var(--text-secondary)';
  const textMuted = 'var(--text-muted)';

  const statCards = [
    {
      title: t('dashboard.activeExhibitions'),
      value: activeExhibitions,
      icon: Building2,
      change: "+12%",
      positive: true,
      variant: 'primary' as const,
      path: "/exhibitions"
    },
    {
      title: t('dashboard.pendingBookings'),
      value: pendingBookings,
      icon: ClipboardList,
      change: "+5",
      positive: true,
      variant: 'warm' as const,
      path: "/bookings"
    },
    {
      title: t('dashboard.activeContracts'),
      value: activeContracts,
      icon: FileText,
      change: "+3",
      positive: true,
      variant: 'amber' as const,
      path: "/contracts"
    },
    {
      title: t('dashboard.totalRevenue'),
      value: `${(totalRevenue / 1000).toFixed(0)}K`,
      suffix: t('dashboard.home.sar'),
      icon: CreditCard,
      change: "+18%",
      positive: true,
      variant: 'deep' as const,
      path: "/payments"
    },
  ];

  const quickActions = [
    { icon: TrendingUp, label: t('nav.marketplace'), desc: t('dashboard.exploreNewOpportunities'), path: "/marketplace", image: CDN_IMAGES.luxuryEventVenue },
    { icon: Briefcase, label: t('nav.portfolio'), desc: t('dashboard.manageInvestments'), path: "/portfolio", image: CDN_IMAGES.riyadhTowers },
    { icon: BarChart3, label: t('nav.analytics'), desc: t('dashboard.advancedReports'), path: "/analytics", image: CDN_IMAGES.premiumGala },
    { icon: Activity, label: t('nav.liveEconomy'), desc: t('dashboard.realTimeMarketData'), path: "/live-economy", image: CDN_IMAGES.futuristicHall },
  ];

  const investorMetrics = [
    { icon: Target, label: t('dashboard.dealSuccessRate'), value: "87%", variant: 'primary' as const },
    { icon: Shield, label: t('dashboard.investorRating'), value: "Platinum", variant: 'warm' as const },
    { icon: Star, label: t('dashboard.loyaltyPoints'), value: "2,450", variant: 'amber' as const },
    { icon: Clock, label: t('dashboard.avgPaybackPeriod'), value: t('dashboard.home.avgPayback'), variant: 'deep' as const },
  ];

  const EXHIBITION_IMAGES = [CDN_IMAGES.riyadhSeason1, CDN_IMAGES.expoHall1, CDN_IMAGES.luxuryHall1, CDN_IMAGES.premiumGala, CDN_IMAGES.futuristicHall];
  const realExhibitions = exhibitionsQuery.data || [];
  const featuredExhibitions = realExhibitions.length > 0 ? realExhibitions.slice(0, 3).map((exh: any, i: number) => ({
    name: exh.name || exh.title || `Exhibition #${exh.id}`,
    location: exh.city || exh.location || 'Riyadh',
    date: exh.startDate && exh.endDate ? `${new Date(exh.startDate).toLocaleDateString(locale, { month: 'long', year: 'numeric' })} - ${new Date(exh.endDate).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}` : '',
    occupancy: exh.totalBooths ? Math.round((exh.bookedBooths || 0) / exh.totalBooths * 100) : 70 + i * 10,
    image: EXHIBITION_IMAGES[i % EXHIBITION_IMAGES.length],
    path: '/exhibitions'
  })) : [
    { name: t('dashboard.home.boulevardWorld'), location: t('dashboard.home.riyadh'), date: t('dashboard.home.janJun2026'), occupancy: 82, image: CDN_IMAGES.riyadhSeason1, path: '/exhibitions' },
    { name: t('dashboard.home.kafdExhibition'), location: t('dashboard.home.riyadh'), date: t('dashboard.home.mar2026'), occupancy: 87, image: CDN_IMAGES.expoHall1, path: '/exhibitions' },
    { name: t('dashboard.home.onHisSteps'), location: t('dashboard.home.madinah'), date: t('dashboard.home.aprMay2026'), occupancy: 56, image: CDN_IMAGES.luxuryHall1, path: '/exhibitions' },
  ];

  const greetingTime = () => {
    const h = new Date().getHours();
    if (locale === 'ar-SA') {
      if (h < 12) return t('dashboard.home.goodMorning');
      return t('dashboard.home.goodEvening');
    }
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ═══════════ HERO BANNER — Dark overlay for both modes ═══════════ */}
      <div className="relative overflow-hidden rounded-2xl" style={{
        minHeight: '280px',
        ...cardStyle(isDark),
        border: 'none',
      }}>
        {/* Background Image — always dark overlay for text readability */}
        <div className="absolute inset-0">
          <img
            src={CDN_IMAGES.riyadhSkylineNight}
            alt={t("dashboard.home.mahamExpo")}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Strong dark overlay in BOTH modes — solves the washed-out problem */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(8,8,12,0.88) 0%, rgba(8,8,12,0.55) 50%, rgba(8,8,12,0.85) 100%)'
          }} />
          {/* Gold accent glow */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 80%, rgba(152,112,18,0.08) 0%, transparent 60%)'
          }} />
        </div>

        {/* Content — always white text on dark overlay */}
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={CDN_IMAGES.mahamExpoLogoDark}
                alt="Maham Expo"
                className="h-9 w-auto object-contain"
              />
              <div className="h-px flex-1 max-w-[60px]" style={{ background: 'rgba(152,112,18,0.25)' }} />
              <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--gold)' }}>COMMAND CENTER</p>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
              {greetingTime()}{t('dashboard.home.comma')} <span style={{ color: 'var(--gold)' }}>{user?.name?.split(' ')[0] || (t('dashboard.home.investor'))}</span>
            </h1>
            <p className="text-base max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('dashboard.commandCenterDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{
              background: 'rgba(152,112,18,0.12)',
              border: '1px solid rgba(152,112,18,0.25)',
              color: 'var(--gold)'
            }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
              <span>{t('common.live')}</span>
            </div>
            <button
              onClick={() => setLocation('/marketplace')}
              className="glass-btn-gold glass-btn-ripple flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {t('dashboard.exploreOpportunities')}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ STAT CARDS — Clear borders + shadows ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const ic = iconBox(isDark, card.variant);
          return (
            <button
              key={i}
              onClick={() => setLocation(card.path)}
              className="relative p-5 text-right rounded-xl transition-all duration-200 hover:-translate-y-1 group nour-card"
            >
              {/* Top accent line on hover */}
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{
                background: `linear-gradient(90deg, transparent, ${ic.color}, transparent)`
              }} />

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: ic.bg,
                  border: `1px solid ${ic.border}`
                }}>
                  <card.icon className="w-5 h-5" style={{ color: ic.color }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md" style={{
                  color: card.positive ? '#16A34A' : '#DC2626',
                  background: card.positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.06)'
                }}>
                  {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: textPrimary }}>
                {card.value} {card.suffix && <span className="text-sm font-normal" style={{ color: textMuted }}>{card.suffix}</span>}
              </p>
              <p className="text-xs font-medium" style={{ color: textSecondary }}>{card.title}</p>
            </button>
          );
        })}
      </div>

      {/* ═══════════ FEATURED EXHIBITIONS ═══════════ */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: iconBox(isDark, 'primary').bg,
              border: `1px solid ${iconBox(isDark, 'primary').border}`
            }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: textPrimary }}>{t('dashboard.featuredExhibitions')}</h3>
              <p className="text-[11px]" style={{ color: textMuted }}>{t('dashboard.topInvestmentOpportunities')}</p>
            </div>
          </div>
          <button
            onClick={() => setLocation('/exhibitions')}
            className="glass-btn-cta glass-btn-sm flex items-center gap-2"
          >
            {t('common.viewAll')}
            {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredExhibitions.map((exh, i) => (
            <button
              key={i}
              onClick={() => setLocation(exh.path)}
              className="overflow-hidden rounded-xl group text-right transition-all duration-200 hover:-translate-y-1 nour-card"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={exh.image}
                  alt={exh.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Occupancy badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold text-white" style={{
                  background: exh.occupancy > 75 ? 'var(--gold)' : 'var(--gold-light)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {locale === 'ar-SA' ? `${t("dashboard.home.occupancy").replace("{percent}", String(exh.occupancy))}` : `${exh.occupancy}% Occ.`}
                </div>
                {/* Title on image */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h4 className="text-sm font-bold text-white drop-shadow-lg">{exh.name}</h4>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: textSecondary }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exh.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {String(exh.date || '')}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{
                    border: `1px solid ${'rgba(152,112,18,0.15)'}`,
                    background: 'rgba(152,112,18,0.05)'
                  }}>
                    <ArrowRight className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{
                  background: 'rgba(255,255,255,0.06)'
                }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${exh.occupancy}%`,
                    background: `linear-gradient(90deg, ${'var(--gold-light)'}, var(--gold))`
                  }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ QUICK ACTIONS ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: iconBox(isDark, 'warm').bg,
            border: `1px solid ${iconBox(isDark, 'warm').border}`
          }}>
            <Zap className="w-5 h-5" style={{ color: GOLD_WARM }} />
          </div>
          <div>
              <h3 className="text-lg font-bold" style={{ color: textPrimary }}>{t('dashboard.quickActions')}</h3>
              <p className="text-[11px]" style={{ color: textMuted }}>{t('dashboard.quickAccessToSections')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setLocation(action.path)}
              className="relative overflow-hidden rounded-xl group text-right transition-all duration-200 hover:-translate-y-1 nour-card" style={{
                border: 'none',
                minHeight: '180px'
              }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img src={action.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.15) 100%)'
                }} />
              </div>
              <div className="relative p-4 flex flex-col justify-end h-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{
                  background: 'rgba(152,112,18,0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(152,112,18,0.3)'
                }}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-0.5 drop-shadow-lg">{action.label}</p>
                <p className="text-[10px] text-white/70">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ INVESTOR METRICS + AI INSIGHT ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Investor Metrics */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: iconBox(isDark, 'amber').bg,
              border: `1px solid ${iconBox(isDark, 'amber').border}`
            }}>
              <Award className="w-5 h-5" style={{ color: 'var(--gold-light)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: textPrimary }}>{t('dashboard.investorMetrics')}</h3>
              <p className="text-[11px]" style={{ color: textMuted }}>{t('dashboard.liveInvestmentPerformance')}</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{
              background: `linear-gradient(135deg, var(--gold), ${'var(--gold-light)'})`,
              color: 'var(--background)'
            }}>LIVE</span>
          </div>
          <div className="space-y-2.5">
            {investorMetrics.map((metric, i) => {
              const ic = iconBox(isDark, metric.variant);
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 nour-card">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{
                    background: ic.bg,
                    border: `1px solid ${ic.border}`
                  }}>
                    <metric.icon className="w-5 h-5" style={{ color: ic.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium mb-0.5" style={{ color: textSecondary }}>{metric.label}</p>
                    <p className="text-xl font-bold" style={{ color: textPrimary }}>{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="relative overflow-hidden rounded-xl nour-card">
          {/* Subtle background pattern */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 80% 20%, rgba(152,112,18,0.04) 0%, transparent 50%)'
          }} />

          <div className="relative p-7 flex flex-col gap-5 h-full justify-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{
                background: iconBox(isDark, 'primary').bg,
                border: `1px solid ${iconBox(isDark, 'primary').border}`
              }}>
                <Brain className="w-7 h-7" style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold" style={{ color: textPrimary }}>{t('dashboard.aiAdvisorRecommendation')}</h3>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{
                    background: `linear-gradient(135deg, var(--gold), ${'var(--gold-light)'})`,
                    color: 'var(--background)'
                  }}>{t('common.new')}</span>
                </div>
                <p className="text-[11px]" style={{ color: textMuted }}>{t('dashboard.aiSmartAnalysis')}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
              {t('dashboard.aiRecommendationText')}
            </p>
            <button
              onClick={() => setLocation('/ai-advisor')}
              className="glass-btn-cta glass-btn-ripple flex items-center gap-2 w-fit"
            >
              <Eye className="w-4 h-4" />
              {t('common.viewDetails')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
