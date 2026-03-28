import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { ClipboardList, Search, Check, X, Clock, Phone, Mail, Building } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";

const demoBookings = [
  { id: 1, merchantName: "Ahmed Al-Otaibi", merchantCompany: "Al-Asala Trading", merchantPhone: "0535551234", merchantEmail: "ahmed@asala.sa", activityType: "E-Commerce", requestedAmount: "180000.00", status: "pending" as const, notes: "Prefers corner unit", createdAt: new Date("2026-03-14") },
  { id: 2, merchantName: "Fatima Al-Dosari", merchantCompany: "Luxury Flowers", merchantPhone: "0535559876", merchantEmail: "fatima@flowers.sa", activityType: "Flowers & Plants", requestedAmount: "95000.00", status: "approved" as const, notes: "", createdAt: new Date("2026-03-13") },
  { id: 3, merchantName: "Khalid Al-Shammari", merchantCompany: "Advanced Tech", merchantPhone: "0535554567", merchantEmail: "khalid@advtech.sa", activityType: "IT", requestedAmount: "120000.00", status: "pending" as const, notes: "Needs extra electricity", createdAt: new Date("2026-03-12") },
  { id: 4, merchantName: "Sarah Al-Qahtani", merchantCompany: "Oriental Perfumes", merchantPhone: "0535558901", merchantEmail: "sara@perfume.sa", activityType: "Perfumes & Cosmetics", requestedAmount: "45000.00", status: "approved" as const, notes: "", createdAt: new Date("2026-03-11") },
  { id: 5, merchantName: "Mohammed Al-Ghamdi", merchantCompany: "Fine Taste Co.", merchantPhone: "0535552345", merchantEmail: "mohammed@taste.sa", activityType: "F&B", requestedAmount: "75000.00", status: "rejected" as const, notes: "Does not match exhibition type", createdAt: new Date("2026-03-10") },
];

export default function Bookings() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const bookingsQuery = trpc.bookings.list.useQuery(undefined, { enabled: !!user });
  const updateStatus = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => { bookingsQuery.refetch(); toast.success(t('bookings.statusUpdateSuccess')); },
  });

  const bookings = bookingsQuery.data?.length ? bookingsQuery.data : demoBookings;
  const filtered = bookings.filter((b: any) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !b.merchantName.includes(search) && !b.merchantCompany?.includes(search)) return false;
    return true;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    approved: bookings.filter((b: any) => b.status === "approved").length,
    rejected: bookings.filter((b: any) => b.status === "rejected").length,
  };

  const statusConfig: any = {
    pending: { label: t("dashboard.bookings.pendingReview"), bg: 'rgba(218, 175, 90, 0.1)', text: 'var(--gold)', icon: Clock },
    approved: { label: t("dashboard.bookings.approved"), bg: 'rgba(76, 175, 80, 0.08)', text: '#4CAF50', icon: Check },
    rejected: { label: t("dashboard.bookings.rejected"), bg: 'rgba(255, 60, 60, 0.08)', text: '#FF3C3C', icon: X },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with background image */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.boothDesign2} alt={t('bookings.headerAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8">
          <p className="text-[10px] font-bold tracking-[0.25em] inline-block">BOOKING REQUESTS</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('bookings.headerTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('bookings.headerDescription')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('bookings.statsTotal'), value: counts.all, color: '#FBBF24' },
          { label: t('bookings.statusPending'), value: counts.pending, color: 'var(--gold)' },
          { label: t('bookings.statsApproved'), value: counts.approved, color: '#4CAF50' },
          { label: t('bookings.statsRejected'), value: counts.rejected, color: '#FF3C3C' },
        ].map((stat, i) => (
          <div key={i} className="stat-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('bookings.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(152,112,18,0.1)',
              color: 'var(--text-primary)',
              border: `1px solid ${'rgba(152,112,18,0.3)'}`
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: t('bookings.filterAll') },
            { key: "pending", label: t('bookings.statsPending') },
            { key: "approved", label: t('bookings.statusApproved') },
            { key: "rejected", label: t('bookings.statusRejected') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300"
              style={{
                background: filter === tab.key ? ('rgba(218, 175, 90, 0.15)') : 'transparent',
                color: filter === tab.key ? ('var(--gold)') : ('#7a7a8e'),
                border: `1px solid ${filter === tab.key ? ('rgba(218, 175, 90, 0.2)') : 'transparent'}`
              }}
            >
              {tab.label} ({counts[tab.key as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Booking Cards */}
      <div className="space-y-3">
        {filtered.map((booking: any, i: number) => {
          const st = statusConfig[booking.status] || statusConfig.pending;
          const StatusIcon = st.icon;
          return (
            <div key={booking.id || i} className={`stat-card p-5${(i % 5) + 1}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0" style={{
                  background: 'rgba(218, 175, 90, 0.08)',
                  color: '#FBBF24',
                  border: `1px solid ${'rgba(218, 175, 90, 0.12)'}`
                }}>
                  {booking.merchantName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{booking.merchantName}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1" style={{ background: st.bg, color: st.text }}>
                      <StatusIcon className="w-3 h-3" /> {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {booking.merchantCompany && <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {booking.merchantCompany}</span>}
                    {booking.merchantPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.merchantPhone}</span>}
                    {booking.merchantEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {booking.merchantEmail}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {booking.activityType && <span>{t("dashboard.bookings.activity").replace("{type}", booking.activityType || "")}</span>}
                      {booking.notes && <span>{t("dashboard.bookings.notes").replace("{text}", booking.notes || "")}</span>}
                    </div>
                    <span className="text-base font-bold" style={{ color: '#FBBF24' }}>
                      {Number(booking.requestedAmount || "0" || 0).toLocaleString('ar-SA')} ${t("dashboard.bookings.sar")}
                    </span>
                  </div>
                  {booking.status === "pending" && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "approved" })}
                        className="glass-btn-cta glass-btn-sm flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> {t("dashboard.bookings.approve")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "rejected" })}
                        className="glass-btn-danger glass-btn-sm flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> {t("dashboard.bookings.reject")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
