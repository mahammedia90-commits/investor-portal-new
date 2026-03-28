import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Handshake, CheckCircle2, XCircle, Eye, MessageSquare, FileText, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type DealStatus = "negotiation" | "due_diligence" | "approved" | "signed" | "rejected";
interface Deal { id: number; title: string; counterparty: string; type: string; amount: number; status: DealStatus; progress: number; startDate: string; deadline: string; location: string; description: string; documents: number; messages: number; lastActivity: string; }

const demoDeals: Deal[] = [
  { id: 1, title: 'شراكة استثمارية — بوليفارد وورلد', counterparty: 'شركة الريادة التجارية', type: 'شراكة استثمارية', amount: 5000000, status: "negotiation", progress: 35, startDate: "2026-03-01", deadline: "2026-04-15", location: 'الرياض', description: 'شراكة استثمارية لتشغيل منطقة تجارية في بوليفارد وورلد', documents: 4, messages: 12, lastActivity: 'منذ ساعتين' },
  { id: 2, title: 'إيجار طويل الأمد — KAFD', counterparty: 'شركة التقنية المتقدمة', type: 'إيجار تجاري', amount: 3200000, status: "due_diligence", progress: 60, startDate: "2026-02-15", deadline: "2026-03-30", location: 'الرياض — KAFD', description: 'عقد إيجار لمدة 12 شهراً لوحدة تجارية في KAFD', documents: 7, messages: 23, lastActivity: 'منذ 4 ساعات' },
  { id: 3, title: 'رعاية حصرية — موسم الرياض', counterparty: 'مجموعة الفخامة', type: 'رعاية حصرية', amount: 8500000, status: "approved", progress: 85, startDate: "2026-01-20", deadline: "2026-03-20", location: 'الرياض', description: 'رعاية حصرية لفعاليات موسم الرياض', documents: 12, messages: 45, lastActivity: 'أمس' },
  { id: 4, title: 'شراء وحدة — على خطاه', counterparty: 'مؤسسة على خطاه', type: 'شراء مباشر', amount: 1800000, status: "signed", progress: 100, startDate: "2026-01-05", deadline: "2026-02-28", location: 'المدينة المنورة', description: 'شراء وحدة تجارية في مشروع على خطاه', documents: 9, messages: 31, lastActivity: 'الأسبوع الماضي' },
  { id: 5, title: 'مشروع مشترك — منصة تقنية', counterparty: 'شركة ماهام AI', type: 'مشروع مشترك', amount: 12000000, status: "negotiation", progress: 20, startDate: "2026-03-10", deadline: "2026-05-30", location: 'الرياض', description: 'مشروع مشترك لتطوير منصة تقنية متقدمة', documents: 2, messages: 8, lastActivity: 'اليوم' },
];

export default function DealRoom() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  // Fetch real opportunities from API
  const oppsQuery = trpc.opportunities.list.useQuery(undefined, { enabled: !!user });
  const contractsQuery = trpc.contracts.list.useQuery(undefined, { enabled: !!user });

  // Map real opportunities to deals format
  const realOpps = oppsQuery.data || [];
  const realContracts = contractsQuery.data || [];

  const deals: Deal[] = realOpps.length > 0 ? realOpps.map((opp: any, idx: number) => {
    const contract = realContracts.find((c: any) => c.exhibitionId === opp.exhibitionId);
    const statusMap: Record<string, DealStatus> = { open: 'negotiation', active: 'due_diligence', closed: 'signed', funded: 'approved' };
    return {
      id: opp.id,
      title: opp.title || `فرصة #${opp.id}`,
      counterparty: opp.category === 'exhibitions_events' ? 'إدارة المعارض' : opp.category === 'food_beverage' ? 'قطاع الأغذية' : 'شريك استثماري',
      type: opp.category === 'exhibitions_events' ? 'معارض وفعاليات' : opp.category === 'food_beverage' ? 'أغذية ومشروبات' : opp.category === 'retail_brands' ? 'تجزئة' : 'استثمار',
      amount: Number(opp.requiredInvestment || 0),
      status: statusMap[opp.status] || 'negotiation',
      progress: opp.status === 'closed' ? 100 : opp.status === 'funded' ? 85 : opp.status === 'active' ? 60 : 30,
      startDate: opp.createdAt ? new Date(opp.createdAt).toISOString().split('T')[0] : '',
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '',
      location: opp.location || 'الرياض',
      description: opp.description || '',
      documents: contract ? 3 : 1,
      messages: Math.floor(Math.random() * 20) + 5,
      lastActivity: 'اليوم',
    };
  }) : demoDeals;

  const statusConfig: Record<DealStatus, { color: string; bg: string; label: string; icon: any }> = {
    negotiation: { color: goldColor, bg: 'var(--gold-bg)', label: 'تفاوض', icon: MessageSquare },
    due_diligence: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', label: 'فحص نافي', icon: Eye },
    approved: { color: greenColor, bg: `${greenColor}12`, label: 'معتمد', icon: CheckCircle2 },
    signed: { color: greenColor, bg: `${greenColor}15`, label: 'موقّع', icon: CheckCircle2 },
    rejected: { color: '#FF6464', bg: 'rgba(255,100,100,0.12)', label: 'مرفوض', icon: XCircle },
  };

  const filtered = filter === "all" ? deals : deals.filter(d => d.status === filter);
  const totalValue = deals.reduce((s, d) => s + d.amount, 0);
  const activeDeals = deals.filter(d => d.status !== "signed" && d.status !== "rejected").length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.networking1} alt="غرفة الصفقات" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)' }} />
        </div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="w-5 h-5" style={{ color: goldColor }} />
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/80">DEAL ROOM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">غرفة الصفقات</h1>
            <p className="text-sm mt-1 text-white/60">إدارة ومتابعة جميع صفقاتك الاستثمارية</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-white/60">إجمالي قيمة الصفقات</p>
            <p className="text-xl font-bold" style={{ color: goldColor }}>{(totalValue / 1000000).toFixed(1)}M ر.س</p>
            <p className="text-[9px]" style={{ color: greenColor }}>{activeDeals} صفقات نشطة</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {oppsQuery.isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: goldColor }} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الصفقات', value: deals.length, color: goldColor },
          { label: 'قيد التفاوض', value: deals.filter(d => d.status === "negotiation").length, color: goldColor },
          { label: 'معتمدة/موقعة', value: deals.filter(d => d.status === "approved" || d.status === "signed").length, color: greenColor },
          { label: 'القيمة الإجمالية', value: `${(totalValue / 1000000).toFixed(1)}M`, color: goldColor },
        ].map((s, i) => (
          <div key={i} className="nour-card p-4 text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[9px]" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { key: "all", label: 'الكل' },
          { key: "negotiation", label: 'قيد التفاوض' },
          { key: "due_diligence", label: 'فحص نافي' },
          { key: "approved", label: 'معتمد' },
          { key: "signed", label: 'موقّع' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0"
            style={{
              background: filter === f.key ? 'var(--gold-bg)' : 'transparent',
              color: filter === f.key ? goldColor : 'var(--text-secondary)',
              border: `1px solid ${filter === f.key ? 'var(--gold)' : 'transparent'}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Deals */}
      <div className="space-y-3">
        {filtered.map((deal) => {
          const config = statusConfig[deal.status];
          return (
            <div key={deal.id} className="nour-card p-5 transition-all cursor-pointer hover:scale-[1.005]"
              onClick={() => setSelectedDeal(selectedDeal?.id === deal.id ? null : deal)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{deal.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px]" style={{ color: goldColor }}>{deal.counterparty}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>|</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{deal.type}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: config.bg, color: config.color }}>
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                {[
                  { label: 'قيمة الصفقة', value: `${(deal.amount / 1000000).toFixed(1)}M ر.س`, color: goldColor },
                  { label: 'الموقع', value: deal.location, color: 'var(--text-primary)' },
                  { label: 'الموعد النهائي', value: deal.deadline, color: 'var(--text-primary)' },
                  { label: 'المستندات', value: `${deal.documents} مستند`, color: 'var(--text-primary)' },
                  { label: 'آخر نشاط', value: deal.lastActivity, color: greenColor },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                    <p className="text-xs font-medium" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>تقدم الصفقة</span>
                  <span className="text-[9px] font-bold" style={{ color: goldColor }}>{deal.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-[1.2s]" style={{ width: `${deal.progress}%`, background: deal.progress === 100 ? greenColor : `linear-gradient(90deg, var(--gold), var(--gold-light))` }} />
                </div>
              </div>

              {/* Expanded */}
              {selectedDeal?.id === deal.id && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{deal.description}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium" style={{ background: 'var(--gold-bg)', color: goldColor }} onClick={(e) => { e.stopPropagation(); toast.info("فتح غرفة الصفقة"); }}>
                      <FileText className="w-3 h-3" /> المستندات ({deal.documents})
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium" style={{ background: `${greenColor}10`, color: greenColor }} onClick={(e) => { e.stopPropagation(); toast.info("فتح المحادثة"); }}>
                      <MessageSquare className="w-3 h-3" /> المحادثات ({deal.messages})
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
