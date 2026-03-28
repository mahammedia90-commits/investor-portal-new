import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { CreditCard, DollarSign, Calendar, Building, Check, Clock, ArrowDownRight, Banknote, ArrowUpRight, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";

const demoPayments = [
  { id: 1, merchantName: "Ahmed Al-Otaibi", merchantCompany: "Al-Asala Trading", amount: "180000.00", paymentMethod: "bank_transfer" as const, status: "received" as const, transactionRef: "TXN-2026-001", paidAt: new Date("2026-03-14"), createdAt: new Date("2026-03-14") },
  { id: 2, merchantName: "Fatima Al-Dosari", merchantCompany: "Luxury Flowers", amount: "95000.00", paymentMethod: "mada" as const, status: "received" as const, transactionRef: "TXN-2026-002", paidAt: new Date("2026-03-13"), createdAt: new Date("2026-03-13") },
  { id: 3, merchantName: "Khalid Al-Shammari", merchantCompany: "Advanced Tech", amount: "120000.00", paymentMethod: "credit_card" as const, status: "pending" as const, transactionRef: null, paidAt: null, createdAt: new Date("2026-03-12") },
  { id: 4, merchantName: "Sarah Al-Qahtani", merchantCompany: "Oriental Perfumes", amount: "45000.00", paymentMethod: "bank_transfer" as const, status: "received" as const, transactionRef: "TXN-2026-004", paidAt: new Date("2026-03-11"), createdAt: new Date("2026-03-11") },
  { id: 5, merchantName: "Noura Al-Harbi", merchantCompany: "Modern Fashion", amount: "65000.00", paymentMethod: "cash" as const, status: "pending" as const, transactionRef: null, paidAt: null, createdAt: new Date("2026-03-10") },
];

export default function Payments() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const methodLabels: Record<string, string> = { bank_transfer: t("dashboard.payments.bankTransfer"), credit_card: t("dashboard.payments.creditCard"), cash: t("dashboard.payments.cash"), mada: t("dashboard.payments.mada") };
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState("all");

  const paymentsQuery = trpc.payments.list.useQuery(undefined, { enabled: !!user });
  const payments = paymentsQuery.data?.length ? paymentsQuery.data : demoPayments;
  const filtered = filter === "all" ? payments : payments.filter((p: any) => p.status === filter);
  const totalReceived = payments.filter((p: any) => p.status === "received").reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
  const totalPending = payments.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.exhibitionInterior1} alt={t('payments.title')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8">
          <p className="text-[10px] font-bold tracking-[0.25em] inline-block">PAYMENTS CENTER</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('payments.imageAlt')}</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('payments.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CreditCard, label: t('payments.totalTransactions'), value: payments.length, color: '#FBBF24' },
          { icon: ArrowUpRight, label: t('payments.received'), value: `${(totalReceived / 1000).toFixed(0)}K`, color: '#4CAF50' },
          { icon: Clock, label: t('payments.pending'), value: `${(totalPending / 1000).toFixed(0)}K`, color: 'var(--gold)' },
          { icon: TrendingUp, label: t('payments.total'), value: `${((totalReceived + totalPending) / 1000).toFixed(0)}K`, color: '#A78BFA' },
        ].map((stat, i) => (
          <div key={i} className="stat-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}12` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#F5F5F5' }}>{stat.value}</p>
              <p className="text-[10px]" style={{ color: '#6b7280' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: "all", label: t('payments.filter.all') },
          { id: "received", label: t('payments.filter.received') },
          { id: "pending", label: t('payments.filter.pending') },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={{
              background: filter === f.id ? ('rgba(218, 175, 90, 0.15)') : 'transparent',
              color: filter === f.id ? ('var(--gold)') : ('#7a7a8e'),
              border: `1px solid ${filter === f.id ? ('rgba(218, 175, 90, 0.2)') : 'transparent'}`
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payment Cards */}
      <div className="space-y-3">
        {filtered.map((payment: any, i: number) => {
          const isReceived = payment.status === 'received';
          return (
            <div key={payment.id || i} className={`stat-card p-5${(i % 5) + 1}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: isReceived ? ('rgba(76, 175, 80, 0.08)') : ('rgba(218, 175, 90, 0.08)'),
                  border: `1px solid ${isReceived ? ('rgba(76, 175, 80, 0.12)') : ('rgba(218, 175, 90, 0.12)')}`
                }}>
                  {isReceived ? <ArrowUpRight className="w-5 h-5" style={{ color: '#4CAF50' }} /> : <Clock className="w-5 h-5" style={{ color: '#FBBF24' }} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{payment.merchantName}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{
                      background: isReceived ? ('rgba(76, 175, 80, 0.08)') : ('rgba(218, 175, 90, 0.1)'),
                      color: isReceived ? ('#4CAF50') : ('var(--gold)')
                    }}>
                      {isReceived ? t("dashboard.payments.received") : t("dashboard.payments.pending")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {payment.merchantCompany}</span>
                    <span>{methodLabels[payment.paymentMethod] || payment.paymentMethod}</span>
                    {payment.transactionRef && <span>{t("dashboard.payments.reference").replace("{ref}", payment.transactionRef || "")}</span>}
                    {payment.paidAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(payment.paidAt).toLocaleDateString('ar-SA')}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold" style={{ color: '#FBBF24' }}>
                    {Number(payment.amount || 0).toLocaleString('ar-SA')} <span className="text-xs">{t('payments.currency')}</span>
                  </p>
                  <button className="glass-btn-icon">
                    <Download className="w-4 h-4" />
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
