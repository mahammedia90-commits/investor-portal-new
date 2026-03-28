import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { CDN_IMAGES, OPPORTUNITY_IMAGES } from "@/lib/images";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Eye } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const portfolioImages: Record<string, string> = {
  retail: CDN_IMAGES.riyadhSeason2,
  food_beverage: CDN_IMAGES.foodExpo1,
  popup: CDN_IMAGES.boothDesign1,
  technology: CDN_IMAGES.conferenceRoom1,
  brand_experience: CDN_IMAGES.expoHall1,
  event_partnership: CDN_IMAGES.luxuryHall1,
};

const demoPortfolio = [
  { id: 1, opportunityTitle: "Luxury Retail — Boulevard World", investedAmount: "2500000.00", currentValue: "3150000.00", returnPercentage: "26.00", status: "active", eventName: "Boulevard World — Riyadh Season 2026", category: "retail", startDate: "2026-01-15", endDate: "2026-07-15", monthlyRevenue: "420000.00" },
  { id: 2, opportunityTitle: "Restaurant & Cafe — Food Zone", investedAmount: "1800000.00", currentValue: "2250000.00", returnPercentage: "25.00", status: "active", eventName: "KAFD Tech Exhibition 2026", category: "food_beverage", startDate: "2026-02-01", endDate: "2026-06-01", monthlyRevenue: "310000.00" },
  { id: 3, opportunityTitle: "Fashion Pop-up Store", investedAmount: "850000.00", currentValue: "920000.00", returnPercentage: "8.24", status: "active", eventName: "Boulevard World — Riyadh Season 2026", category: "popup", startDate: "2026-03-01", endDate: "2026-06-01", monthlyRevenue: "140000.00" },
  { id: 4, opportunityTitle: "Tech Pavilion — Previous Exhibition", investedAmount: "1200000.00", currentValue: "1680000.00", returnPercentage: "40.00", status: "completed", eventName: "GITEX Saudi 2025", category: "technology", startDate: "2025-09-01", endDate: "2025-12-01", monthlyRevenue: "0" },
];

const demoStats = { totalInvested: 6350000, currentValue: 8000000, totalReturn: 1650000, returnPercentage: 25.98, activeInvestments: 3, completedInvestments: 1, monthlyRevenue: 870000 };

const categoryColors: Record<string, string> = { retail: "#987012", food_beverage: "#4CAF50", popup: "#6464FF", technology: "#FF64FF", brand_experience: "#FF6464", event_partnership: "#64D4FF" };
const categoryLabels: Record<string, string> = { retail: 'portfolio.category.retail', food_beverage: 'portfolio.category.food_beverage', popup: 'portfolio.category.popup', technology: 'portfolio.category.technology', brand_experience: 'portfolio.category.brand_experience', event_partnership: 'portfolio.category.event_partnership' };

export default function Portfolio() {
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const portfolioQuery = trpc.portfolio.list.useQuery(undefined, { enabled: !!user });
  const statsQuery = trpc.portfolio.stats.useQuery(undefined, { enabled: !!user });

  const rawPortfolio = portfolioQuery.data?.length ? portfolioQuery.data.map((item: any) => ({
    ...item,
    opportunityTitle: item.title || item.opportunityTitle || '',
    investedAmount: item.investmentAmount || item.investedAmount || '0',
    currentValue: item.currentRevenue || item.currentValue || '0',
    returnPercentage: item.ownershipPercentage || item.returnPercentage || '0',
    monthlyRevenue: item.profitDistributed || item.monthlyRevenue || '0',
    eventName: item.operatorName || item.eventName || '',
    category: item.category || 'retail',
  })) : demoPortfolio;
  const portfolio = rawPortfolio;
  const rawStats = statsQuery.data as any;
  const stats = rawStats ? {
    totalInvested: Number(rawStats.totalInvested || 0),
    currentValue: Number(rawStats.totalRevenue || 0),
    totalReturn: Number(rawStats.totalProfit || 0),
    returnPercentage: Number(rawStats.totalInvested) > 0 ? ((Number(rawStats.totalProfit || 0) / Number(rawStats.totalInvested || 1)) * 100) : 0,
    activeInvestments: Number(rawStats.activeCount || 0),
    completedInvestments: 0,
    monthlyRevenue: Number(rawStats.totalProfit || 0) / 6,
  } : demoStats;
  const filtered = filter === "all" ? portfolio : portfolio.filter((p: any) => p.status === filter);

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header with background */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.eventVenue1} alt="Portfolio" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5" style={{ color: goldColor }} />
              <span className="text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full glass">INVESTMENT PORTFOLIO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('portfolio.header.title')}</h1>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('portfolio.header.description')}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] mb-1" style={{ color: '#9ca3af' }}>{t('portfolio.header.totalValue')}</p>
            <p className="text-2xl font-bold" style={{ color: greenColor }}>{(stats.currentValue || 0).toLocaleString('ar-SA')} ${t("dashboard.portfolio.sar")}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('portfolio.stats.totalInvested'), value: `${((stats.totalInvested || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: goldColor, sub: t('portfolio.misc.currency') },
          { label: t('portfolio.stats.currentValue'), value: `${((stats.currentValue || 0) / 1000000).toFixed(1)}M`, icon: TrendingUp, color: greenColor, sub: t("dashboard.portfolio.sar") },
          { label: t('portfolio.stats.totalReturn'), value: `${(stats.returnPercentage || 0).toFixed(1)}%`, icon: BarChart3, color: goldColor, sub: `+${((stats.totalReturn || 0) / 1000).toFixed(0)}K ${t("dashboard.portfolio.sar")}` },
          { label: t('portfolio.stats.monthlyRevenue'), value: `${((stats.monthlyRevenue || 0) / 1000).toFixed(0)}K`, icon: Activity, color: greenColor, sub: t('portfolio.misc.currencyPerMonth') },
        ].map((s, i) => (
          <div key={i} className="stat-card p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{s.sub}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {[{ key: "all", label: t('portfolio.filter.all') }, { key: "active", label: t('portfolio.filter.active') }, { key: "completed", label: t('portfolio.filter.completed') }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={{
              background: filter === f.key ? `${goldColor}12` : 'transparent',
              color: filter === f.key ? goldColor : ('#7a7a8e'),
              border: `1px solid ${filter === f.key ? `${goldColor}20` : 'transparent'}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Portfolio Items with Images */}
      <div className="space-y-4">
        {filtered.map((item: any) => {
          const isPositive = Number(item.returnPercentage || 0) >= 0;
          const catColor = categoryColors[item.category] || goldColor;
          const imgSrc = portfolioImages[item.category] || CDN_IMAGES.expoHall1;
          return (
            <div key={item.id} className="stat-card overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-48 h-32 md:h-auto overflow-hidden shrink-0">
                  <img src={imgSrc} alt={item.opportunityTitle} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to left, rgba(10, 10, 20, 0.95) 0%, rgba(10, 10, 20, 0.5) 100%)'
                  }} />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-lg font-medium glass" style={{ color: catColor }}>{categoryLabels[item.category] || item.category}</span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-medium glass" style={{
                      color: item.status === 'active' ? greenColor : goldColor,
                    }}>
                      {item.status === 'active' ? t('dashboard.portfolio.active') : t('dashboard.portfolio.completed')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.opportunityTitle}</h3>
                      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.eventName}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{
                      background: isPositive ? `${greenColor}08` : 'rgba(255, 100, 100, 0.08)',
                    }}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" style={{ color: greenColor }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: '#FF6464' }} />}
                      <span className="text-xs font-bold" style={{ color: isPositive ? greenColor : '#FF6464' }}>{item.returnPercentage}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.item.investedAmount')}</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{Number(item.investedAmount || 0).toLocaleString('ar-SA')} ${t("dashboard.portfolio.sar")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.item.currentValue')}</p>
                      <p className="text-xs font-bold" style={{ color: goldColor }}>{Number(item.currentValue || 0).toLocaleString('ar-SA')} ${t("dashboard.portfolio.sar")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.item.monthlyRevenue')}</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{Number(item.monthlyRevenue || 0).toLocaleString('ar-SA')} ${t("dashboard.portfolio.sar")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.item.period')}</p>
                      <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{item.startDate instanceof Date ? item.startDate.toLocaleDateString('en-CA') : String(item.startDate)} → {item.endDate instanceof Date ? item.endDate.toLocaleDateString('en-CA') : String(item.endDate)}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${'rgba(152,112,18,0.1)'}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{t('portfolio.item.progress')}</span>
                      <span className="text-[9px] font-medium" style={{ color: goldColor }}>{item.status === 'completed' ? '100%' : '60%'}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-green-500" style={{
                        width: item.status === 'completed' ? '100%' : '60%',
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
