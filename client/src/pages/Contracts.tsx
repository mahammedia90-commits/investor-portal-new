import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { FileText, PenTool, Calendar, DollarSign, User, Building, Check, Clock, AlertCircle, Download, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";

const demoContracts = [
  { id: 1, contractNumber: "2026-042", merchantName: "Ahmed Al-Otaibi", merchantCompany: "Al-Asala Trading", unitCode: "A-12", amount: "180000.00", startDate: new Date("2026-04-15"), endDate: new Date("2026-04-20"), status: "active" as const, signedAt: new Date("2026-03-10") },
  { id: 2, contractNumber: "2026-043", merchantName: "Fatima Al-Dosari", merchantCompany: "Luxury Flowers", unitCode: "B-05", amount: "95000.00", startDate: new Date("2026-05-01"), endDate: new Date("2026-06-30"), status: "active" as const, signedAt: new Date("2026-03-12") },
  { id: 3, contractNumber: "2026-044", merchantName: "Khalid Al-Shammari", merchantCompany: "Advanced Tech", unitCode: "A-08", amount: "120000.00", startDate: new Date("2026-04-15"), endDate: new Date("2026-04-20"), status: "pending_signature" as const, signedAt: null },
  { id: 4, contractNumber: "2026-045", merchantName: "Noura Al-Harbi", merchantCompany: "Modern Fashion", unitCode: "C-15", amount: "65000.00", startDate: new Date("2026-05-01"), endDate: new Date("2026-06-30"), status: "pending_signature" as const, signedAt: null },
  { id: 5, contractNumber: "2026-046", merchantName: "Sarah Al-Qahtani", merchantCompany: "Oriental Perfumes", unitCode: "D-03", amount: "45000.00", startDate: new Date("2026-06-15"), endDate: new Date("2026-07-15"), status: "pending_signature" as const, signedAt: null },
];

export default function Contracts() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState("all");

  const contractsQuery = trpc.contracts.list.useQuery(undefined, { enabled: !!user });
  const signMutation = trpc.contracts.sign.useMutation({
    onSuccess: () => { contractsQuery.refetch(); toast.success(t('contracts.toast.signedSuccess')); },
  });

  const contracts = contractsQuery.data?.length ? contractsQuery.data : demoContracts;
  const filtered = filter === "all" ? contracts : contracts.filter((c: any) => c.status === filter);
  const totalAmount = contracts.reduce((s: number, c: any) => s + Number(c.amount || "0" || 0), 0);

  const statusConfig: any = {
    active: { label: t("dashboard.contracts.active"), bg: 'rgba(76, 175, 80, 0.08)', text: '#4CAF50', icon: Check },
    pending_signature: { label: t("dashboard.contracts.pendingSignature"), bg: 'rgba(218, 175, 90, 0.1)', text: 'var(--gold)', icon: Clock },
    expired: { label: t("dashboard.contracts.expired"), bg: 'rgba(100, 100, 120, 0.08)', text: '#9a9aae', icon: AlertCircle },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.tradeShow1} alt={t('contracts.header.imageAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8">
          <p className="text-[10px] font-bold tracking-[0.25em] inline-block">CONTRACTS MANAGEMENT</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('contracts.header.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('contracts.header.description')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('contracts.stats.totalContracts'), value: contracts.length, color: '#FBBF24' },
          { label: t('contracts.stats.activeContracts'), value: contracts.filter((c: any) => c.status === 'active').length, color: '#4CAF50' },
          { label: t('contracts.status.pendingSignature'), value: contracts.filter((c: any) => c.status === 'pending_signature').length, color: 'var(--gold)' },
          { label: t('contracts.stats.contractsValue'), value: `${(totalAmount / 1000).toFixed(0)}K`, color: '#A78BFA' },
        ].map((stat, i) => (
          <div key={i} className="stat-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: "all", label: t('contracts.filters.all') },
          { id: "active", label: t("dashboard.contracts.activeFilter") },
          { id: "pending_signature", label: t('contracts.stats.pendingContracts') },
          { id: "expired", label: t('contracts.status.expired') },
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

      {/* Contract Cards */}
      <div className="space-y-3">
        {filtered.map((contract: any, i: number) => {
          const st = statusConfig[contract.status] || statusConfig.active;
          const StatusIcon = st.icon;
          return (
            <div key={contract.id || i} className={`stat-card p-5${(i % 5) + 1}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: 'rgba(218, 175, 90, 0.08)',
                  border: `1px solid ${'rgba(218, 175, 90, 0.12)'}`
                }}>
                  <FileText className="w-5 h-5" style={{ color: '#FBBF24' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t("dashboard.contracts.contractNumber").replace("{num}", contract.contractNumber)}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: st.bg, color: st.text }}>
                      <StatusIcon className="w-3 h-3" /> {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {contract.merchantName}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {contract.merchantCompany}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {contract.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : '-'}</span>
                    <span className="flex items-center gap-1" style={{ color: '#FBBF24' }}><DollarSign className="w-3 h-3" /> {Number(contract.amount || 0).toLocaleString('ar-SA')} ${t("dashboard.contracts.sar")}</span>
                  </div>
                  {contract.signedAt && (
                    <p className="text-[10px]" style={{ color: '#4CAF50' }}>{t("dashboard.contracts.signedAt").replace("{date}", new Date(contract.signedAt).toLocaleDateString('ar-SA'))}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {contract.status === "pending_signature" && (
                    <button
                      onClick={() => signMutation.mutate({ id: contract.id })}
                      className="glass-btn-cta glass-btn-sm glass-btn-ripple flex items-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" /> {t("dashboard.contracts.sign")}
                    </button>
                  )}
                  <button className="glass-btn-icon">
                    <Eye className="w-4 h-4" />
                  </button>
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
