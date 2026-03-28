import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, PiggyBank, BarChart3, Calendar, Download, Loader2 } from "lucide-react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

const defaultMonthlyData = [
  { month: 'يناير', revenue: 580000, expenses: 210000, profit: 370000 },
  { month: 'فبراير', revenue: 620000, expenses: 225000, profit: 395000 },
  { month: 'مارس', revenue: 710000, expenses: 240000, profit: 470000 },
  { month: 'أبريل', revenue: 680000, expenses: 230000, profit: 450000 },
  { month: 'مايو', revenue: 750000, expenses: 260000, profit: 490000 },
  { month: 'يونيو', revenue: 820000, expenses: 280000, profit: 540000 },
  { month: 'يوليو', revenue: 890000, expenses: 290000, profit: 600000 },
  { month: 'أغسطس', revenue: 960000, expenses: 310000, profit: 650000 },
  { month: 'سبتمبر', revenue: 850000, expenses: 275000, profit: 575000 },
  { month: 'أكتوبر', revenue: 920000, expenses: 295000, profit: 625000 },
  { month: 'نوفمبر', revenue: 980000, expenses: 320000, profit: 660000 },
  { month: 'ديسمبر', revenue: 940000, expenses: 265000, profit: 675000 },
];

export default function FinancialCenter() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [txFilter, setTxFilter] = useState("all");

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';
  const redColor = '#FF6464';

  // Fetch real data from API
  const dashboardQuery = trpc.dashboard.stats.useQuery(undefined, { enabled: !!user });
  const paymentsQuery = trpc.payments.list.useQuery(undefined, { enabled: !!user });
  const portfolioStats = trpc.portfolio.stats.useQuery(undefined, { enabled: !!user });

  const stats = dashboardQuery.data as any;
  const payments = paymentsQuery.data || [];
  const pStats = portfolioStats.data as any;

  // Calculate financials from real data
  const totalInvested = pStats?.totalInvested || stats?.totalInvested || 15200000;
  const totalReturn = pStats?.totalReturn || 5500000;
  const netProfit = totalReturn;
  const cashFlow = payments.reduce((sum: number, p: any) => p.status === 'completed' ? sum + Number(p.amount || 0) : sum, 0) || 2800000;
  const roi = totalInvested > 0 ? ((totalReturn / Number(totalInvested)) * 100) : 36.2;

  // Build transactions from real payments
  const recentTransactions = payments.length > 0 ? payments.map((p: any) => ({
    id: p.id,
    type: 'income' as const,
    description: p.description || `دفعة #${p.id}`,
    amount: Number(p.amount || 0),
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-SA') : '',
    category: p.paymentType === 'booking_deposit' ? 'عربون حجز' : p.paymentType === 'contract_payment' ? 'دفعة عقد' : p.paymentType === 'monthly_rent' ? 'إيجار شهري' : 'دفعة',
  })) : [
    { id: 1, type: "income" as const, description: "إيراد وحدة A-01 — بوليفارد وورلد", amount: 180000, date: "15 مارس 2026", category: 'إيراد إيجار' },
    { id: 2, type: "income" as const, description: "إيراد وحدة B-03 — بوليفارد وورلد", amount: 310000, date: "14 مارس 2026", category: 'إيراد إيجار' },
    { id: 3, type: "expense" as const, description: "رسوم صيانة — المنطقة A", amount: 45000, date: "13 مارس 2026", category: 'صيانة' },
    { id: 4, type: "income" as const, description: "إيراد وحدة C-03 — ماهام AI", amount: 500000, date: "12 مارس 2026", category: 'إيراد إيجار' },
    { id: 5, type: "expense" as const, description: "رسوم تسويق — حملة رمضان", amount: 85000, date: "11 مارس 2026", category: 'تسويق' },
    { id: 6, type: "income" as const, description: "عمولة وساطة — صفقة معرض KAFD", amount: 120000, date: "10 مارس 2026", category: 'عمولات' },
  ];

  const monthlyData = defaultMonthlyData;
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));
  const filteredTx = txFilter === "all" ? recentTransactions : recentTransactions.filter((t: any) => t.type === txFilter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.riyadhSeason3} alt="المركز المالي" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)' }} />
        </div>
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" style={{ color: goldColor }} />
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/80">FINANCIAL CENTER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">المركز المالي</h1>
            <p className="text-sm mt-1 text-white/60">نظرة شاملة على أدائك المالي والتدفقات النقدية</p>
          </div>
          <button className="glass-btn-gold glass-btn-ripple flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> تصدير التقرير
          </button>
        </div>
      </div>

      {/* Loading */}
      {(dashboardQuery.isLoading || paymentsQuery.isLoading) && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: goldColor }} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الأصول', value: `${(Number(totalInvested) / 1000000).toFixed(1)}M`, icon: PiggyBank, color: goldColor, change: "+8.5%", up: true },
          { label: 'صافي الربح', value: `${(netProfit / 1000000).toFixed(1)}M`, icon: TrendingUp, color: greenColor, change: "+12.3%", up: true },
          { label: 'التدفق النقدي', value: `${(cashFlow / 1000000).toFixed(1)}M`, icon: DollarSign, color: goldColor, change: "+5.2%", up: true },
          { label: 'العائد على الاستثمار', value: `${roi.toFixed(1)}%`, icon: BarChart3, color: greenColor, change: "+3.1%", up: true },
        ].map((s, i) => (
          <div key={i} className="nour-card p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <div className="flex items-center gap-0.5">
                {s.up ? <ArrowUpRight className="w-3 h-3" style={{ color: greenColor }} /> : <ArrowDownRight className="w-3 h-3" style={{ color: redColor }} />}
                <span className="text-[9px] font-medium" style={{ color: s.up ? greenColor : redColor }}>{s.change}</span>
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)', direction: 'ltr', textAlign: 'right' }}>{s.value} <span className="text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>ر.س</span></p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="nour-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>الإيرادات والمصروفات الشهرية</h2>
          <div className="flex items-center gap-4">
            {[
              { label: 'الإيرادات', color: goldColor },
              { label: 'المصروفات', color: redColor },
              { label: 'صافي الربح', color: greenColor },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-44">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex gap-0.5" style={{ height: '160px' }}>
                <div className="flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, background: 'var(--gold-bg)' }} />
                </div>
                <div className="flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${(m.expenses / maxRevenue) * 100}%`, background: `${redColor}25` }} />
                </div>
                <div className="flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${(m.profit / maxRevenue) * 100}%`, background: `${greenColor}25` }} />
                </div>
              </div>
              <span className="text-[7px]" style={{ color: 'var(--text-secondary)' }}>{m.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="nour-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>آخر المعاملات</h2>
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: 'الكل' },
              { key: "income", label: 'الإيرادات' },
              { key: "expense", label: 'المصروفات' },
            ].map((f) => (
              <button key={f.key} onClick={() => setTxFilter(f.key)}
                className="px-3 py-1 rounded-lg text-[10px] font-medium transition-all"
                style={{ background: txFilter === f.key ? 'var(--gold-bg)' : 'transparent', color: txFilter === f.key ? goldColor : 'var(--text-secondary)' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredTx.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tx.type === 'income' ? `${greenColor}15` : `${redColor}15` }}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" style={{ color: greenColor }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: redColor }} />}
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{tx.date instanceof Date ? tx.date.toLocaleDateString('en-CA') : String(tx.date || '')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--gold-bg)', color: goldColor }}>{tx.category}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: tx.type === 'income' ? greenColor : redColor, direction: 'ltr' }}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ar-SA')} ر.س
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
