import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { FileText, Upload, Download, Search, FolderOpen, Lock, Shield, Eye, Star, File, FileImage, FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

const demoDocuments = [
  { id: 1, title: 'عقد استثمار - بوليفارد وورلد', documentType: "contract", fileSize: 245000, createdAt: "2026-03-10", relatedEntityType: "contract" },
  { id: 2, title: 'تقرير أداء الربع الأول 2026', documentType: "report", fileSize: 1500000, createdAt: "2026-03-08", relatedEntityType: null },
  { id: 3, title: 'السجل التجاري', documentType: "certificate", fileSize: 150000, createdAt: "2026-02-15", relatedEntityType: null },
  { id: 4, title: 'إيصال دفعة - أحمد الغامدي', documentType: "payment_receipt", fileSize: 85000, createdAt: "2026-03-01", relatedEntityType: "payment" },
  { id: 5, title: 'القوائم المالية - الربع الأول', documentType: "financial_statement", fileSize: 2200000, createdAt: "2026-01-20", relatedEntityType: null },
  { id: 6, title: 'اتفاقية شراكة - مجموعة ماهام', documentType: "agreement", fileSize: 420000, createdAt: "2026-02-28", relatedEntityType: "investment" },
];

const typeConfig: Record<string, { label: string; icon: any }> = {
  contract: { label: 'عقود', icon: FileText },
  report: { label: 'تقارير', icon: File },
  certificate: { label: 'شهادات', icon: Shield },
  payment_receipt: { label: 'إيصالات', icon: FileCheck },
  financial_statement: { label: 'قوائم مالية', icon: FileImage },
  agreement: { label: 'اتفاقيات', icon: FileText },
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

export default function DocumentVault() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  // Fetch real documents from API
  const docsQuery = trpc.documents.list.useQuery(undefined, { enabled: !!user });
  const documents = docsQuery.data?.length ? docsQuery.data : demoDocuments;

  const categories = [
    { key: "all", label: 'الكل', count: documents.length, icon: FolderOpen },
    { key: "contract", label: 'العقود', count: documents.filter((d: any) => d.documentType === 'contract').length, icon: FileText },
    { key: "report", label: 'التقارير', count: documents.filter((d: any) => d.documentType === 'report').length, icon: File },
    { key: "payment_receipt", label: 'الإيصالات', count: documents.filter((d: any) => d.documentType === 'payment_receipt').length, icon: FileCheck },
    { key: "financial_statement", label: 'القوائم المالية', count: documents.filter((d: any) => d.documentType === 'financial_statement').length, icon: FileImage },
    { key: "certificate", label: 'الشهادات', count: documents.filter((d: any) => d.documentType === 'certificate').length, icon: Shield },
  ];

  const filtered = documents.filter((doc: any) => {
    const matchesSearch = doc.title?.includes(search) || search === "";
    const matchesCategory = activeCategory === "all" || doc.documentType === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '170px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.boothDesign1} alt="خزنة المستندات" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)' }} />
        </div>
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5" style={{ color: goldColor }} />
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/80">DOCUMENT VAULT</span>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-green-400" style={{ background: 'rgba(76,175,80,0.15)' }}>
                <Shield className="w-3 h-3" /> مشفّر
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">خزنة المستندات</h1>
            <p className="text-sm mt-1 text-white/60">جميع مستنداتك وعقودك في مكان واحد آمن</p>
          </div>
          <button className="glass-btn-gold glass-btn-ripple flex items-center gap-2 text-sm" onClick={() => toast.info("رفع المستندات قريباً")}>
            <Upload className="w-4 h-4" /> رفع مستند
          </button>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المستندات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all shrink-0"
              style={{
                background: activeCategory === cat.key ? 'var(--gold-bg)' : 'transparent',
                color: activeCategory === cat.key ? goldColor : 'var(--text-secondary)',
                border: `1px solid ${activeCategory === cat.key ? 'var(--gold)' : 'transparent'}`,
              }}>
              <cat.icon className="w-3 h-3" /> {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {docsQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: goldColor }} />
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((doc: any) => {
          const typeInfo = typeConfig[doc.documentType] || { label: doc.documentType, icon: FileText };
          return (
            <div key={doc.id} className="nour-card p-4 cursor-pointer transition-all hover:scale-[1.01]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gold-bg)' }}>
                  <typeInfo.icon className="w-5 h-5" style={{ color: goldColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--gold-bg)', color: goldColor }}>{typeInfo.label}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{formatFileSize(doc.fileSize || 0)}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('ar-SA') : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="glass-btn-cta glass-btn-sm flex items-center gap-1" onClick={(e) => { e.stopPropagation(); toast.info("التحميل قريباً"); }}>
                  <Download className="w-3 h-3" /> تحميل
                </button>
                <button className="glass-btn-ghost glass-btn-sm flex items-center gap-1" onClick={(e) => { e.stopPropagation(); toast.info("المعاينة قريباً"); }}>
                  <Eye className="w-3 h-3" /> معاينة
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Stats */}
      <div className="nour-card p-5">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>إحصائيات التخزين</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي المستندات', value: String(documents.length), color: goldColor },
            { label: 'المساحة المستخدمة', value: formatFileSize(documents.reduce((sum: number, d: any) => sum + (d.fileSize || 0), 0)), color: greenColor },
            { label: 'العقود', value: String(documents.filter((d: any) => d.documentType === 'contract').length), color: goldColor },
            { label: 'التقارير', value: String(documents.filter((d: any) => d.documentType === 'report').length), color: '#6464FF' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
