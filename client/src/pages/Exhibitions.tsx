import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { EXHIBITION_IMAGES, CDN_IMAGES } from "@/lib/images";
import { Building2, MapPin, Clock, Star, Users, Plus, TrendingUp, Eye, Settings, Calendar, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const demoExhibitions = [
  { id: 1, name: 'exhibitions.demo.boulevardWorld.name', nameEn: "Boulevard World - Riyadh Season 2026", location: 'exhibitions.demo.boulevardWorld.location', city: 'exhibitions.demo.boulevardWorld.city', startDate: "2026-01-15", endDate: "2026-06-30", totalUnits: 120, bookedUnits: 98, revenue: 4500000, status: "active" as const, rating: "4.8", description: 'exhibitions.demo.boulevardWorld.description', sector: 'exhibitions.demo.boulevardWorld.sector', image: CDN_IMAGES.riyadhSeason1 },
  { id: 2, name: 'exhibitions.demo.kafdTech.name', nameEn: "KAFD Tech & Innovation 2026", location: 'exhibitions.demo.kafdTech.location', city: 'exhibitions.demo.kafdTech.city', startDate: "2026-03-01", endDate: "2026-03-15", totalUnits: 60, bookedUnits: 52, revenue: 2800000, status: "active" as const, rating: "4.6", description: 'exhibitions.demo.kafdTech.description', sector: 'exhibitions.demo.kafdTech.sector', image: CDN_IMAGES.conferenceRoom1 },
  { id: 3, name: 'exhibitions.demo.onHisSteps.name', nameEn: "On His Steps - Islamic Exhibition", location: 'exhibitions.demo.onHisSteps.location', city: 'exhibitions.demo.onHisSteps.city', startDate: "2026-04-10", endDate: "2026-05-10", totalUnits: 80, bookedUnits: 45, revenue: 1200000, status: "upcoming" as const, rating: "4.9", description: 'exhibitions.demo.onHisSteps.description', sector: 'exhibitions.demo.onHisSteps.sector', image: CDN_IMAGES.luxuryHall1 },
  { id: 4, name: 'exhibitions.demo.jeddahFood.name', nameEn: "Jeddah F&B Exhibition", location: 'exhibitions.demo.jeddahFood.location', city: 'exhibitions.demo.jeddahFood.city', startDate: "2026-05-20", endDate: "2026-05-25", totalUnits: 40, bookedUnits: 12, revenue: 350000, status: "upcoming" as const, rating: "0.0", description: 'exhibitions.demo.jeddahFood.description', sector: 'exhibitions.demo.jeddahFood.sector', image: CDN_IMAGES.foodExpo1 },
];

export default function Exhibitions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState("all");

  const exhQuery = trpc.exhibitions.list.useQuery(undefined, { enabled: !!user });
  const exhibitions = exhQuery.data?.length ? exhQuery.data.map((e: any, i: number) => ({
    ...e,
    image: EXHIBITION_IMAGES[e.id] || Object.values(CDN_IMAGES)[i % Object.values(CDN_IMAGES).length]
  })) : demoExhibitions;
  const filtered = filter === "all" ? exhibitions : exhibitions.filter((e: any) => e.status === filter);

  const totalRevenue = exhibitions.reduce((s: number, e: any) => s + (e.revenue || 0), 0);
  const totalUnits = exhibitions.reduce((s: number, e: any) => s + (e.totalUnits || 0), 0);
  const totalBooked = exhibitions.reduce((s: number, e: any) => s + (e.bookedUnits || 0), 0);

  const filters = [
    { id: "all", label: t('exhibitions.filters.all') },
    { id: "active", label: t('exhibitions.filters.active') },
    { id: "upcoming", label: t('exhibitions.filters.upcoming') },
    { id: "completed", label: t('exhibitions.filters.completed') },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header with background image */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.expoHall1} alt={t('exhibitions.header.imageAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.93) 0%, rgba(12, 12, 24, 0.78) 100%)'
          }} />
        </div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] mb-2">EXHIBITIONS MANAGEMENT</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#F5F5F5' }}>{t('exhibitions.header.title')}</h1>
            <p className="text-sm" style={{ color: '#9ca3af' }}>{t('exhibitions.header.description')}</p>
          </div>
          <button
            onClick={() => toast.info(t('exhibitions.header.addNewToast'))}
            className="glass-btn-gold glass-btn-ripple flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("dashboard.exhibitions.addExhibition")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: t('exhibitions.stats.totalExhibitions'), value: exhibitions.length, color: '#FBBF24' },
          { icon: Users, label: t('exhibitions.stats.bookedUnits'), value: `${totalBooked}/${totalUnits}`, color: '#4CAF50' },
          { icon: TrendingUp, label: t('exhibitions.stats.occupancyRate'), value: `${totalUnits ? Math.round((totalBooked / totalUnits) * 100) : 0}%`, color: '#60A5FA' },
          { icon: TrendingUp, label: t('exhibitions.stats.totalRevenue'), value: `${(totalRevenue / 1000000).toFixed(1)}M`, color: '#A78BFA' },
        ].map((stat, i) => (
          <div key={i} className="stat-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}12` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={{
              background: filter === f.id ? ('rgba(218, 175, 90, 0.15)') : ('rgba(255,255,255,0.03)'),
              color: filter === f.id ? ('var(--gold)') : ('#7a7a8e'),
              border: `1px solid ${filter === f.id ? ('rgba(218, 175, 90, 0.2)') : 'transparent'}`
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Exhibition Cards with Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((exh: any, i: number) => {
          const occupancy = exh.totalUnits ? Math.round(((exh.bookedUnits || 0) / exh.totalUnits) * 100) : 0;
          const statusColors: any = {
            active: { bg: 'rgba(76, 175, 80, 0.08)', text: '#4CAF50', label: t("dashboard.exhibitions.active") },
            upcoming: { bg: 'rgba(96, 165, 250, 0.08)', text: '#60A5FA', label: t("dashboard.exhibitions.upcoming") },
            completed: { bg: 'rgba(167, 139, 250, 0.08)', text: '#A78BFA', label: t("dashboard.exhibitions.completed") },
          };
          const st = statusColors[exh.status] || statusColors.active;
          const imgSrc = exh.image || EXHIBITION_IMAGES[exh.id] || CDN_IMAGES.expoHall1;

          return (
            <div key={exh.id || i} className={`stat-card overflow-hidden group${(i % 4) + 1}`}>
              {/* Image Header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={exh.name}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(10, 10, 20, 0.95) 0%, rgba(10, 10, 20, 0.3) 50%, rgba(10, 10, 20, 0.1) 100%)'
                }} />
                {/* Status & Rating badges */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg glass" style={{ color: st.text }}>{st.label}</span>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg glass text-green-600">{exh.sector || t('dashboard.exhibitions.general')}</span>
                </div>
                {parseFloat(exh.rating || "0") > 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg glass">
                    <Star className="w-3 h-3 fill-current" style={{ color: '#FBBF24' }} />
                    <span className="text-xs font-bold" style={{ color: '#FBBF24' }}>{exh.rating}</span>
                  </div>
                )}
                {/* Title overlay */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{exh.name}</h3>
                  {exh.nameEn && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)', direction: 'ltr', textAlign: 'right' }}>{exh.nameEn}</p>}
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{exh.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exh.city} — {exh.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exh.startDate instanceof Date ? exh.startDate.toLocaleDateString('en-CA') : String(exh.startDate || '')} → {exh.endDate instanceof Date ? exh.endDate.toLocaleDateString('en-CA') : String(exh.endDate || '')}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('exhibitions.card.units')}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{exh.bookedUnits}/{exh.totalUnits}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('exhibitions.card.revenue')}</p>
                    <p className="text-sm font-bold" style={{ color: '#FBBF24' }}>{((exh.revenue || 0) / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('exhibitions.card.occupancy')}</p>
                    <p className="text-sm font-bold neon-text">{occupancy}%</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar mb-3">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${occupancy}%` }} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${'rgba(152,112,18,0.1)'}` }}>
                  <button className="glass-btn-cta glass-btn-sm flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {t("dashboard.exhibitions.viewDetails")}
                  </button>
                  <button className="glass-btn-ghost glass-btn-sm flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    {t("dashboard.exhibitions.settings")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
