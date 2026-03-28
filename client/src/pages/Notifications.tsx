import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, ClipboardList, FileText, CreditCard, Settings, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";

const demoNotifications = [
  { id: 1, title: 'notifications.newBookingRequest', message: 'notifications.bookingRequestDetails', type: "booking" as const, isRead: 0, createdAt: new Date("2026-03-15T14:30:00") },
  { id: 2, title: 'notifications.contractPendingSignature', message: 'notifications.contractReadyForSignature', type: "contract" as const, isRead: 0, createdAt: new Date("2026-03-15T12:00:00") },
  { id: 3, title: 'notifications.paymentReceived', message: 'notifications.paymentReceivedDetailsMada', type: "payment" as const, isRead: 0, createdAt: new Date("2026-03-15T10:15:00") },
  { id: 4, title: "dashboard.notifications.newBookingRequest", message: 'notifications.bookingRequestDetailsNoura', type: "booking" as const, isRead: 1, createdAt: new Date("2026-03-14T16:45:00") },
  { id: 5, title: 'notifications.systemUpdate', message: 'notifications.systemUpdateDetails', type: "system" as const, isRead: 1, createdAt: new Date("2026-03-14T09:00:00") },
  { id: 6, title: 'notifications.contractSigned', message: 'notifications.contractSignedSuccessfully', type: "contract" as const, isRead: 1, createdAt: new Date("2026-03-13T15:30:00") },
  { id: 7, title: "dashboard.notifications.paymentReceived", message: 'notifications.paymentReceivedDetailsBank', type: "payment" as const, isRead: 1, createdAt: new Date("2026-03-13T11:00:00") },
  { id: 8, title: 'notifications.bookingRequestRejected', message: 'notifications.bookingRequestRejectedDetails', type: "booking" as const, isRead: 1, createdAt: new Date("2026-03-12T14:00:00") },
];

const typeConfig: Record<string, { icon: any; label: string }> = {
  booking: { icon: ClipboardList, label: 'notifications.booking' },
  contract: { icon: FileText, label: 'notifications.contract' },
  payment: { icon: CreditCard, label: 'notifications.payment' },
  system: { icon: Settings, label: 'notifications.system' },
};

export default function Notifications() {
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return t("dashboard.notifications.minutesAgo").replace("{minutes}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("dashboard.notifications.hoursAgo").replace("{hours}", String(hours));
  const days = Math.floor(hours / 24);
  return t("dashboard.notifications.daysAgo").replace("{days}", String(days));
}
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");

  const notifsQuery = trpc.notifications.list.useQuery(undefined, { enabled: !!user });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => notifsQuery.refetch() });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { notifsQuery.refetch(); toast.success(t('notifications.allNotificationsMarkedAsRead')); },
  });

  const notifications = notifsQuery.data?.length ? notifsQuery.data : demoNotifications;
  const filtered = filter === "all" ? notifications : filter === "unread" ? notifications.filter(n => !n.isRead) : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '150px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.tradeShow1} alt={t('notifications.title')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] inline-block">NOTIFICATIONS</p>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t("dashboard.notifications.title")}</h1>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
              {unreadCount > 0 ? t("dashboard.notifications.unreadCount").replace("{count}", String(unreadCount)) : t("dashboard.notifications.allRead")}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={() => markAllRead.mutate()} className="glass-btn-gold glass-btn-sm glass-btn-ripple flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4" /> {t("dashboard.notifications.markAllRead")}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: t('notifications.filterAll') },
          { key: "unread", label: t('notifications.filterUnread') },
          { key: "booking", label: t('notifications.filterBookings') },
          { key: "contract", label: t('notifications.filterContracts') },
          { key: "payment", label: t('notifications.filterPayments') },
          { key: "system", label: t("dashboard.notifications.system") },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={{
              background: filter === f.key ? `${goldColor}12` : 'transparent',
              color: filter === f.key ? goldColor : ('#7a7a8e'),
              border: `1px solid ${filter === f.key ? `${goldColor}20` : 'transparent'}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="stat-card p-12 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: '#2a2a3a' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const tc = typeConfig[notif.type] || typeConfig.system;
            const Icon = tc.icon;
            const isUnread = !notif.isRead;
            return (
              <button key={notif.id} onClick={() => { if (isUnread) markRead.mutate({ id: notif.id }); }}
                className="w-full text-right stat-card p-4 transition-all duration-300"
                style={{ opacity: isUnread ? 1 : 0.6 }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${goldColor}10` }}>
                    <Icon className="w-4 h-4" style={{ color: goldColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{notif.title}</h3>
                      {isUnread && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: greenColor }} />}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${goldColor}10`, color: goldColor }}>{tc.label}</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: '#6B5B45' }}>
                      <Clock className="w-3 h-3" /> {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
