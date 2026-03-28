import { useTheme } from "@/contexts/ThemeContext";
import { Calculator, TrendingUp, DollarSign, BarChart3, Clock, Percent, Building2, Users, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function ROICalculator() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const portfolioQuery = trpc.portfolio.stats.useQuery(undefined, { enabled: !!user });
  const isDark = theme === 'dark';

  const [investment, setInvestment] = useState(500000);
  const [units, setUnits] = useState(10);
  const [unitPrice, setUnitPrice] = useState(80000);
  const [occupancy, setOccupancy] = useState(75);
  const [operatingCosts, setOperatingCosts] = useState(150000);

  const results = useMemo(() => {
    const totalRevenue = units * unitPrice * (occupancy / 100);
    const netProfit = totalRevenue - operatingCosts;
    const roi = investment > 0 ? ((netProfit / investment) * 100) : 0;
    const paybackPeriod = netProfit > 0 ? (investment / netProfit) : 0;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
    return { totalRevenue, netProfit, roi, paybackPeriod, profitMargin };
  }, [investment, units, unitPrice, occupancy, operatingCosts]);

  const inputs = [
    { label: t('roiCalculator.investmentAmount'), icon: DollarSign, value: investment, setter: setInvestment, min: 0, max: 50000000, step: 50000, unit: t('roiCalculator.currency') },
    { label: t('roiCalculator.numberOfUnits'), icon: Building2, value: units, setter: setUnits, min: 1, max: 500, step: 1, unit: t('roiCalculator.unit') },
    { label: t('roiCalculator.unitPrice'), icon: DollarSign, value: unitPrice, setter: setUnitPrice, min: 0, max: 1000000, step: 5000, unit: t("dashboard.roiCalculator.sar") },
    { label: t('roiCalculator.occupancyRate'), icon: Users, value: occupancy, setter: setOccupancy, min: 0, max: 100, step: 5, unit: "%" },
    { label: t('roiCalculator.operatingCosts'), icon: BarChart3, value: operatingCosts, setter: setOperatingCosts, min: 0, max: 10000000, step: 10000, unit: t("dashboard.roiCalculator.sar") },
  ];

  const outputCards = [
    { label: t('roiCalculator.totalRevenue'), value: `${(results.totalRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: '#FBBF24' },
    { label: t('roiCalculator.netProfit'), value: `${(results.netProfit / 1000).toFixed(0)}K`, icon: DollarSign, color: results.netProfit >= 0 ? ('#4CAF50') : '#FF3C3C' },
    { label: t('roiCalculator.returnOnInvestment'), value: `${results.roi.toFixed(1)}%`, icon: Zap, color: results.roi >= 0 ? ('#4CAF50') : '#FF3C3C' },
    { label: t('roiCalculator.paybackPeriod'), value: results.paybackPeriod > 0 ? `${results.paybackPeriod.toFixed(1)} ${t("dashboard.roiCalculator.years")}` : '—', icon: Clock, color: '#A78BFA' },
    { label: t('roiCalculator.profitMargin'), value: `${results.profitMargin.toFixed(1)}%`, icon: Percent, color: results.profitMargin >= 0 ? ('#4CAF50') : '#FF3C3C' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '150px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.eventVenue1} alt={t('roiCalculator.roiCalculatorAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8">
          <p className="text-[10px] font-bold tracking-[0.25em] inline-block">ROI CALCULATOR</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('roiCalculator.pageTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('roiCalculator.pageDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="nour-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5" style={{ color: '#FBBF24' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t('roiCalculator.inputs')}</h2>
          </div>
          <div className="space-y-5">
            {inputs.map((input, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <input.icon className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
                    {input.label}
                  </label>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {input.unit === "%" ? `${input.value}%` : `${input.value.toLocaleString('ar-SA')} ${input.unit}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={input.value}
                  onChange={(e) => input.setter(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to left, ${'var(--gold)'} ${((input.value - input.min) / (input.max - input.min)) * 100}%, ${'rgba(152,112,18,0.3)'} ${((input.value - input.min) / (input.max - input.min)) * 100}%)`,
                    accentColor: 'var(--gold)',
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{input.min.toLocaleString('ar-SA')}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{input.max.toLocaleString('ar-SA')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="nour-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5" style={{ color: '#4CAF50' }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t('roiCalculator.results')}</h2>
            </div>
            <div className="space-y-3">
              {outputCards.map((card, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)'
                }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${card.color}15` }}>
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                    <p className="text-lg font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Gauge */}
          <div className="nour-card p-5 text-center">
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{t('roiCalculator.roiIndicator')}</p>
            <div className="relative w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke='var(--border)' strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={results.roi >= 0 ? ('#4CAF50') : '#FF3C3C'}
                  strokeWidth="8"
                  strokeDasharray={`${Math.min(Math.abs(results.roi), 100) * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: results.roi >= 0 ? ('#4CAF50') : '#FF3C3C' }}>{results.roi.toFixed(0)}%</span>
                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>ROI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
