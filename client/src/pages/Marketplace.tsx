import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { OPPORTUNITY_IMAGES, CDN_IMAGES } from "@/lib/images";
import { useState } from "react";
import { TrendingUp, MapPin, Clock, Shield, Zap, Star, ArrowUpRight, Filter, Search, Eye, Bookmark, DollarSign, Users, BarChart3, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const demoOpportunities = [
  { id: 1, title: 'marketplace.demo.retailTitle', titleEn: "Premium Retail Space — Boulevard World", category: "retail", eventName: 'marketplace.demo.retailEvent', location: 'marketplace.demo.retailLocation', city: 'marketplace.demo.riyadh', requiredInvestment: "2500000.00", expectedRevenue: "4200000.00", projectedROI: "68.00", duration: 'marketplace.demo.sixMonths', riskLevel: "low", opportunityScore: 92, status: "open", operatorName: "Al-Riyadah Trading Co.", visitorTraffic: 45000, description: 'marketplace.demo.retailDescription', businessModel: 'marketplace.demo.directOperationModel', image: CDN_IMAGES.riyadhSeason2 },
  { id: 2, title: 'marketplace.demo.restaurantTitle', titleEn: "Restaurant & Cafe — Main F&B Zone", category: "food_beverage", eventName: 'marketplace.demo.kafdExpo', location: 'marketplace.demo.restaurantLocation', city: "Riyadh", requiredInvestment: "1800000.00", expectedRevenue: "3100000.00", projectedROI: "72.20", duration: 'marketplace.demo.fourMonths', riskLevel: "low", opportunityScore: 88, status: "open", operatorName: "Gourmet Group", visitorTraffic: 32000, description: 'marketplace.demo.restaurantDescription', businessModel: 'marketplace.demo.rentAndSalesShare', image: CDN_IMAGES.foodExpo1 },
  { id: 3, title: 'marketplace.demo.pavilionTitle', titleEn: "Brand Experience Pavilion", category: "brand_experience", eventName: "Riyadh Season 2026", location: 'marketplace.demo.pavilionLocation', city: "Riyadh", requiredInvestment: "3500000.00", expectedRevenue: "5800000.00", projectedROI: "65.70", duration: 'marketplace.demo.eightMonths', riskLevel: "medium", opportunityScore: 85, status: "open", operatorName: "Saudi Creative Agency", visitorTraffic: 60000, description: 'marketplace.demo.pavilionDescription', businessModel: 'marketplace.demo.sponsorshipAndTickets', image: CDN_IMAGES.expoHall1 },
  { id: 4, title: 'marketplace.demo.popupTitle', titleEn: "Fashion & Fragrance Pop-up Store", category: "popup", eventName: "Boulevard World — Riyadh Season 2026", location: 'marketplace.demo.popupLocation', city: "Riyadh", requiredInvestment: "850000.00", expectedRevenue: "1400000.00", projectedROI: "64.70", duration: 'marketplace.demo.threeMonths', riskLevel: "low", opportunityScore: 82, status: "open", operatorName: "Modern Fashion House", visitorTraffic: 28000, description: 'marketplace.demo.popupDescription', businessModel: 'marketplace.demo.fixedMonthlyRent', image: CDN_IMAGES.boothDesign1 },
  { id: 5, title: 'marketplace.demo.aiPlatformTitle', titleEn: "Technology Partnership — AI Platform", category: "technology", eventName: "KAFD Tech & Innovation 2026", location: 'marketplace.demo.aiPlatformLocation', city: "Riyadh", requiredInvestment: "5000000.00", expectedRevenue: "9500000.00", projectedROI: "90.00", duration: 'marketplace.demo.twelveMonths', riskLevel: "high", opportunityScore: 95, status: "open", operatorName: "Maham AI", visitorTraffic: 15000, description: 'marketplace.demo.aiPlatformDescription', businessModel: 'marketplace.demo.equityAndDividends', image: CDN_IMAGES.conferenceRoom1 },
  { id: 6, title: 'marketplace.demo.sponsorshipTitle', titleEn: "Event Partnership — Gold Sponsorship", category: "event_partnership", eventName: 'marketplace.demo.onHisStepsEvent', location: 'marketplace.demo.madinah', city: "Madinah", requiredInvestment: "1200000.00", expectedRevenue: "2000000.00", projectedROI: "66.70", duration: 'marketplace.demo.twoMonths', riskLevel: "medium", opportunityScore: 78, status: "open", operatorName: "On His Steps Foundation", visitorTraffic: 50000, description: 'marketplace.demo.sponsorshipDescription', businessModel: 'marketplace.demo.sponsorshipAndMarketing', image: CDN_IMAGES.luxuryHall1 },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  retail: { label: 'marketplace.categories.retail', color: "#987012" },
  food_beverage: { label: 'marketplace.categories.foodAndBeverage', color: "#4CAF50" },
  popup: { label: 'marketplace.categories.popupStore', color: "#6464FF" },
  brand_experience: { label: 'marketplace.categories.brandExperience', color: "#FF6464" },
  event_partnership: { label: 'marketplace.categories.eventPartnership', color: "#64D4FF" },
  technology: { label: 'marketplace.categories.technology', color: "#FF64FF" },
};

const riskLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'marketplace.risks.low', color: "#4CAF50" },
  medium: { label: 'marketplace.risks.medium', color: "#987012" },
  high: { label: 'marketplace.risks.high', color: "#FF6464" },
};

export default function Marketplace() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpp, setSelectedOpp] = useState<typeof demoOpportunities[0] | null>(null);

  const oppQuery = trpc.opportunities.list.useQuery(undefined, { enabled: !!user });
  const opportunities = oppQuery.data?.length ? oppQuery.data.map((o: any, i: number) => ({
    ...o,
    image: OPPORTUNITY_IMAGES[o.id] || Object.values(CDN_IMAGES)[i % Object.values(CDN_IMAGES).length]
  })) : demoOpportunities;

  const filtered = opportunities.filter((opp: any) => {
    if (selectedCategory !== "all" && opp.category !== selectedCategory) return false;
    if (selectedRisk !== "all" && opp.riskLevel !== selectedRisk) return false;
    if (searchQuery && !opp.title.includes(searchQuery) && !(opp.eventName || "").includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header with background image */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '200px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.saudiExpo1} alt={t('marketplace.header.altText')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 50%, rgba(12, 12, 24, 0.88) 100%)'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.06]" style={{ background: 'radial-gradient(circle, #987012, transparent 70%)' }} />
        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" style={{ color: '#FBBF24' }} />
            <span className="text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full glass">INVESTMENT MARKETPLACE</span>
          </div>
          <h1 className="text-xl lg:text-3xl font-bold mb-2" style={{ color: '#F5F5F5' }}>{t('marketplace.header.title')}</h1>
          <p className="text-sm max-w-xl" style={{ color: '#9ca3af' }}>{t('marketplace.header.description')}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('marketplace.stats.availableOpportunities'), value: filtered.length, icon: Zap, color: "#987012" },
          { label: t('marketplace.stats.totalInvestment'), value: `${(filtered.reduce((s: number, o: any) => s + Number(o.requiredInvestment || "0" || 0), 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: "#4CAF50" },
          { label: t('marketplace.stats.averageRoi'), value: `${(filtered.reduce((s: number, o: any) => s + Number(o.projectedROI || "0" || 0), 0) / (filtered.length || 1)).toFixed(0)}%`, icon: TrendingUp, color: "#987012" },
          { label: t('marketplace.stats.totalVisitors'), value: `${(filtered.reduce((s: number, o: any) => s + (o.visitorTraffic || 0), 0) / 1000).toFixed(0)}K`, icon: Users, color: "#4CAF50" },
        ].map((s, i) => (
          <div key={i} className="stat-card p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)', direction: 'ltr', textAlign: 'right' }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('marketplace.filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm placeholder:text-[#4a4a5e]"
            style={{ background: 'var(--card)', border: `1px solid ${'oklch(0.72 0.12 75 / 0.1)'}`, color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--card)', border: `1px solid ${'oklch(0.72 0.12 75 / 0.1)'}`, color: 'var(--text-primary)' }}
        >
          <option value="all">{t('marketplace.filters.allCategories')}</option>
          {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--card)', border: `1px solid ${'oklch(0.72 0.12 75 / 0.1)'}`, color: 'var(--text-primary)' }}
        >
          <option value="all">{t('marketplace.filters.allRisks')}</option>
          <option value="low">{t("marketplace.lowRisk")}</option>
          <option value="medium">{t("marketplace.mediumRisk")}</option>
          <option value="high">{t("marketplace.highRisk")}</option>
        </select>
      </div>

      {/* Opportunities Grid with Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((opp: any) => {
          const cat = categoryLabels[opp.category] || categoryLabels.retail;
          const risk = riskLabels[opp.riskLevel] || riskLabels.medium;
          const score = opp.opportunityScore || 0;
          const imgSrc = opp.image || OPPORTUNITY_IMAGES[opp.id] || CDN_IMAGES.expoHall1;
          return (
            <div
              key={opp.id}
              className="rounded-xl overflow-hidden transition-all cursor-pointer group stat-card"
              onClick={() => setSelectedOpp(opp)}
            >
              {/* Image Header */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={opp.title}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(10, 10, 20, 0.95) 0%, rgba(10, 10, 20, 0.4) 50%, rgba(10, 10, 20, 0.15) 100%)'
                }} />
                {/* Score Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass text-[10px] font-bold" style={{
                  color: score >= 85 ? '#4CAF50' : score >= 70 ? 'var(--gold)' : '#FF6464'
                }}>
                  <Star className="w-3 h-3 inline mr-1" />
                  {score}/100
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-lg font-medium glass" style={{ color: cat.color }}>{cat.label}</span>
                </div>
                {/* Title overlay */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{opp.title}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{opp.eventName}</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="h-1 w-full" style={{ background: 'var(--border)' }}>
                <div className="h-full transition-all" style={{ width: `${score}%`, background: score >= 85 ? '#4CAF50' : score >= 70 ? 'var(--gold)' : '#FF6464' }} />
              </div>

              <div className="p-5">
                {/* Risk Level */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3" style={{ color: risk.color }} />
                    <span className="text-[10px]" style={{ color: risk.color }}>{t("dashboard.marketplace.riskLabel").replace("{level}", risk.label)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{(opp.visitorTraffic || 0).toLocaleString('ar-SA')} visitors/day</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-xl p-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('marketplace.modal.requiredInvestment')}</p>
                    <p className="text-xs font-bold" style={{ color: '#FBBF24', direction: 'ltr', textAlign: 'right' }}>{Number(opp.requiredInvestment || 0).toLocaleString('ar-SA')} SAR</p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('marketplace.card.expectedRoi')}</p>
                    <p className="text-xs font-bold neon-text">{opp.projectedROI}%</p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('marketplace.modal.expectedRevenue')}</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', direction: 'ltr', textAlign: 'right' }}>{Number(opp.expectedRevenue || 0).toLocaleString('ar-SA')} SAR</p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-[9px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{t('marketplace.card.duration')}</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{opp.duration}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${'rgba(255,255,255,0.05)'}` }}>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{opp.city}</span>
                  </div>
                  <button className="glass-btn-cta glass-btn-sm flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {t('dashboard.marketplace.viewDetails')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Room Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedOpp(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl scrollbar-thin"
            style={{ background: 'rgba(15, 15, 25, 0.98)', border: `1px solid ${'rgba(218, 175, 90, 0.2)'}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img src={selectedOpp.image || CDN_IMAGES.expoHall1} alt={selectedOpp.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(15, 15, 25, 1) 0%, rgba(15, 15, 25, 0.5) 50%, rgba(15, 15, 25, 0.2) 100%)'
              }} />
              <button onClick={() => setSelectedOpp(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full glass flex items-center justify-center text-lg" style={{ color: 'var(--text-primary)' }}>&times;</button>
              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center glass">
                    <Briefcase className="w-4 h-4" style={{ color: '#FBBF24' }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-green-600">{t('marketplace.modal.dealRoom')}</span>
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedOpp.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{selectedOpp.eventName} — {selectedOpp.location}</p>
              </div>
            </div>

            <div className="p-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: t('marketplace.card.requiredInvestment'), value: `${Number(selectedOpp.requiredInvestment || 0).toLocaleString('ar-SA')} SAR`, color: "#987012" },
                  { label: t('marketplace.card.expectedRevenue'), value: `${Number(selectedOpp.expectedRevenue || 0).toLocaleString('ar-SA')} SAR`, color: "#4CAF50" },
                  { label: t('marketplace.modal.roi'), value: `${selectedOpp.projectedROI}%`, color: "#987012" },
                  { label: t('marketplace.modal.visitorTraffic'), value: `${(selectedOpp.visitorTraffic || 0).toLocaleString('ar-SA')} / day`, color: "#4CAF50" },
                ].map((m, i) => (
                  <div key={i} className="stat-card p-3">
                    <p className="text-[9px] mb-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                    <p className="text-sm font-bold" style={{ color: m.color, direction: 'ltr', textAlign: 'right' }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('marketplace.modal.opportunityDescription')}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedOpp.description}</p>
              </div>

              {/* Business Model */}
              <div className="mb-5">
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('marketplace.modal.businessModel')}</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedOpp.businessModel}</p>
              </div>

              {/* Operator */}
              <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(22, 22, 38, 0.8)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('marketplace.modal.operator')}</h3>
                <p className="text-xs" style={{ color: '#FBBF24' }}>{selectedOpp.operatorName}</p>
              </div>

              {/* AI Score */}
              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(76, 175, 80, 0.05)', border: `1px solid ${'rgba(76, 175, 80, 0.1)'}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" style={{ color: '#4CAF50' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('marketplace.modal.aiAssessment')}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold neon-text">{selectedOpp.opportunityScore}/100</div>
                  <div className="flex-1 progress-bar">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${selectedOpp.opportunityScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { toast.success(t('marketplace.toast.bookedSuccessfully')); setSelectedOpp(null); }}
                  className="glass-btn-gold glass-btn-ripple flex-1 py-3 text-sm"
                >
                  {t("dashboard.marketplace.commitInvestment")}
                </button>
                <button
                  onClick={() => toast.info(t('marketplace.toast.savedToFavorites'))}
                  className="glass-btn-secondary px-4 py-3 text-sm"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
