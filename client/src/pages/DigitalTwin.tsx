import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { Globe, Layers, Thermometer, Users, Eye, Zap, Loader2 } from "lucide-react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type UnitStatus = "available" | "booked" | "pending";
interface Unit { id: string; name: string; status: UnitStatus; tenant?: string; revenue?: number; area: number; traffic?: number; x: number; y: number; w: number; h: number; }

const defaultPositions = [
  { x: 5, y: 5, w: 18, h: 12 }, { x: 25, y: 5, w: 15, h: 12 }, { x: 42, y: 5, w: 17, h: 12 },
  { x: 61, y: 5, w: 16, h: 12 }, { x: 79, y: 5, w: 16, h: 12 }, { x: 5, y: 22, w: 22, h: 14 },
  { x: 29, y: 22, w: 20, h: 14 }, { x: 51, y: 22, w: 25, h: 14 }, { x: 78, y: 22, w: 17, h: 14 },
  { x: 5, y: 41, w: 20, h: 13 }, { x: 27, y: 41, w: 18, h: 13 }, { x: 47, y: 41, w: 28, h: 13 },
  { x: 77, y: 41, w: 18, h: 13 }, { x: 5, y: 59, w: 15, h: 12 }, { x: 22, y: 59, w: 18, h: 12 },
  { x: 42, y: 59, w: 17, h: 12 }, { x: 61, y: 59, w: 16, h: 12 }, { x: 79, y: 59, w: 16, h: 12 },
];

const demoUnits: Unit[] = [
  { id: "A-01", name: 'وحدة A-01', status: "booked", tenant: 'الأصالة للتجارة', revenue: 180000, area: 50, traffic: 1200, x: 5, y: 5, w: 18, h: 12 },
  { id: "A-02", name: 'وحدة A-02', status: "booked", tenant: 'زهور الفخامة', revenue: 95000, area: 35, traffic: 800, x: 25, y: 5, w: 15, h: 12 },
  { id: "A-03", name: 'وحدة A-03', status: "available", area: 45, x: 42, y: 5, w: 17, h: 12 },
  { id: "A-04", name: 'وحدة A-04', status: "pending", tenant: 'التقنية المتقدمة', area: 40, traffic: 600, x: 61, y: 5, w: 16, h: 12 },
  { id: "A-05", name: 'وحدة A-05', status: "booked", tenant: 'عطور الشرق', revenue: 120000, area: 30, traffic: 950, x: 79, y: 5, w: 16, h: 12 },
  { id: "B-01", name: 'وحدة B-01', status: "booked", tenant: 'مجموعة الذواقة', revenue: 220000, area: 80, traffic: 2100, x: 5, y: 22, w: 22, h: 14 },
  { id: "B-02", name: 'وحدة B-02', status: "available", area: 60, x: 29, y: 22, w: 20, h: 14 },
  { id: "B-03", name: 'وحدة B-03', status: "booked", tenant: 'الريادة التجارية', revenue: 310000, area: 100, traffic: 3200, x: 51, y: 22, w: 25, h: 14 },
  { id: "B-04", name: 'وحدة B-04', status: "pending", tenant: 'وكالة الإبداع السعودي', area: 55, traffic: 700, x: 78, y: 22, w: 17, h: 14 },
  { id: "C-01", name: 'وحدة C-01', status: "available", area: 70, x: 5, y: 41, w: 20, h: 13 },
  { id: "C-02", name: 'وحدة C-02', status: "booked", tenant: 'دار الأزياء الحديثة', revenue: 145000, area: 45, traffic: 1100, x: 27, y: 41, w: 18, h: 13 },
  { id: "C-03", name: 'وحدة C-03', status: "booked", tenant: 'ماهام AI', revenue: 500000, area: 120, traffic: 4500, x: 47, y: 41, w: 28, h: 13 },
  { id: "C-04", name: 'وحدة C-04', status: "available", area: 40, x: 77, y: 41, w: 18, h: 13 },
  { id: "D-01", name: 'وحدة D-01', status: "booked", tenant: 'على خطاه', revenue: 85000, area: 35, traffic: 600, x: 5, y: 59, w: 15, h: 12 },
  { id: "D-02", name: 'وحدة D-02', status: "pending", area: 50, x: 22, y: 59, w: 18, h: 12 },
  { id: "D-03", name: 'وحدة D-03', status: "available", area: 45, x: 42, y: 59, w: 17, h: 12 },
  { id: "D-04", name: 'وحدة D-04', status: "booked", tenant: 'النخبة للتسويق', revenue: 165000, area: 55, traffic: 1400, x: 61, y: 59, w: 16, h: 12 },
  { id: "D-05", name: 'وحدة D-05', status: "booked", tenant: 'مجموعة الفخامة', revenue: 200000, area: 65, traffic: 1800, x: 79, y: 59, w: 16, h: 12 },
];

const heatmapColors = ["rgba(0,255,65,0.05)", "rgba(0,255,65,0.15)", "rgba(212,168,83,0.15)", "rgba(212,168,83,0.25)", "rgba(255,100,100,0.2)", "rgba(255,100,100,0.35)"];

export default function DigitalTwin() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "heatmap">("map");

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';
  const blueColor = '#6464FF';

  // Fetch real exhibition data
  const exhibitionsQuery = trpc.exhibitions.list.useQuery(undefined, { enabled: !!user });
  const exhibitions = exhibitionsQuery.data || [];

  // Use real data or fallback to demo
  const units = useMemo(() => {
    if (exhibitions.length > 0) {
      const firstExh = exhibitions[0] as any;
      const totalBooths = firstExh.totalBooths || 18;
      const bookedBooths = firstExh.bookedBooths || 0;
      return demoUnits.map((u, i) => {
        if (i < bookedBooths) return { ...u, status: 'booked' as UnitStatus };
        if (i < bookedBooths + 3) return { ...u, status: 'pending' as UnitStatus };
        return { ...u, status: 'available' as UnitStatus };
      });
    }
    return demoUnits;
  }, [exhibitions]);

  const statusConfig: Record<UnitStatus, { color: string; bg: string; label: string }> = {
    available: { color: greenColor, bg: `${greenColor}15`, label: 'متاح' },
    booked: { color: goldColor, bg: 'var(--gold-bg)', label: 'محجوز' },
    pending: { color: blueColor, bg: `${blueColor}15`, label: 'قيد الانتظار' },
  };

  const totalUnits = units.length;
  const bookedUnits = units.filter(u => u.status === "booked").length;
  const availableUnits = units.filter(u => u.status === "available").length;
  const pendingUnits = units.filter(u => u.status === "pending").length;
  const totalRevenue = units.reduce((s, u) => s + (u.revenue || 0), 0);
  const totalTraffic = units.reduce((s, u) => s + (u.traffic || 0), 0);
  const occupancyRate = ((bookedUnits / totalUnits) * 100).toFixed(0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '170px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.exhibitionInterior1} alt="التوأم الرقمي" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)' }} />
        </div>
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5" style={{ color: greenColor }} />
            <span className="text-[10px] font-bold tracking-[0.25em] text-white/80">DIGITAL TWIN</span>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${greenColor}15`, color: greenColor }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: greenColor }} /> LIVE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">التوأم الرقمي</h1>
          <p className="text-sm mt-1 text-white/60">خريطة تفاعلية حية لوحداتك التجارية</p>
        </div>
      </div>

      {/* Loading */}
      {exhibitionsQuery.isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: goldColor }} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'إجمالي الوحدات', value: totalUnits, color: goldColor },
          { label: 'محجوز', value: bookedUnits, color: goldColor },
          { label: 'متاح', value: availableUnits, color: greenColor },
          { label: 'قيد الانتظار', value: pendingUnits, color: blueColor },
          { label: 'نسبة الإشغال', value: `${occupancyRate}%`, color: goldColor },
          { label: 'زوار/يوم', value: totalTraffic.toLocaleString('ar-SA'), color: greenColor },
        ].map((s, i) => (
          <div key={i} className="nour-card p-3 text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[9px]" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        {[
          { key: "map" as const, label: 'خريطة الوحدات', icon: Layers },
          { key: "heatmap" as const, label: 'خريطة الحرارة', icon: Thermometer },
        ].map((v) => (
          <button key={v.key} onClick={() => setViewMode(v.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: viewMode === v.key ? 'var(--gold-bg)' : 'transparent',
              color: viewMode === v.key ? goldColor : 'var(--text-secondary)',
              border: `1px solid ${viewMode === v.key ? 'var(--gold)' : 'transparent'}`,
            }}>
            <v.icon className="w-3.5 h-3.5" /> {v.label}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 nour-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>خريطة المعرض — بوليفارد وورلد</h2>
            <div className="flex items-center gap-3">
              {Object.entries(statusConfig).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: val.color }} />
                  <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '50%' }}>
            <svg viewBox="0 0 100 75" className="absolute inset-0 w-full h-full" style={{ background: isDark ? 'rgba(10,10,20,0.5)' : 'rgba(240,240,245,0.8)', borderRadius: '0.75rem' }}>
              {Array.from({ length: 10 }).map((_, i) => (<line key={`h${i}`} x1="0" y1={i * 7.5} x2="100" y2={i * 7.5} stroke={isDark ? 'rgba(212,168,83,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.1" />))}
              {Array.from({ length: 10 }).map((_, i) => (<line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="75" stroke={isDark ? 'rgba(212,168,83,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.1" />))}
              <rect x="0" y="18" width="100" height="3" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} rx="0.3" />
              <rect x="0" y="37" width="100" height="3" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} rx="0.3" />
              <rect x="0" y="55" width="100" height="3" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} rx="0.3" />
              {units.map((unit) => {
                const config = statusConfig[unit.status];
                const isSelected = selectedUnit?.id === unit.id;
                const heatIndex = viewMode === "heatmap" ? Math.min(Math.floor((unit.traffic || 0) / 800), 5) : -1;
                const fillColor = viewMode === "heatmap" ? (heatmapColors[heatIndex] || heatmapColors[0]) : config.bg;
                return (
                  <g key={unit.id} onClick={() => setSelectedUnit(unit)} className="cursor-pointer">
                    <rect x={unit.x} y={unit.y} width={unit.w} height={unit.h} fill={fillColor} stroke={isSelected ? (isDark ? '#fff' : '#000') : config.color} strokeWidth={isSelected ? 0.4 : 0.15} rx="0.5" className="transition-all hover:opacity-80" />
                    <text x={unit.x + unit.w / 2} y={unit.y + unit.h / 2 - 1} textAnchor="middle" fill={config.color} fontSize="1.5" fontWeight="bold">{unit.id}</text>
                    <text x={unit.x + unit.w / 2} y={unit.y + unit.h / 2 + 1.5} textAnchor="middle" fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} fontSize="0.9">{unit.area}م²</text>
                  </g>
                );
              })}
              <rect x="42" y="72" width="16" height="3" fill={`${greenColor}15`} stroke={greenColor} strokeWidth="0.15" rx="0.5" />
              <text x="50" y="74" textAnchor="middle" fill={greenColor} fontSize="1.2" fontWeight="bold">المدخل الرئيسي</text>
            </svg>
          </div>
        </div>

        {/* Unit Details */}
        <div className="nour-card p-5">
          {selectedUnit ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedUnit.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: statusConfig[selectedUnit.status].bg, color: statusConfig[selectedUnit.status].color }}>
                  {statusConfig[selectedUnit.status].label}
                </span>
              </div>
              {[
                { label: 'المساحة', value: `${selectedUnit.area} م²` },
                ...(selectedUnit.tenant ? [{ label: 'المستأجر', value: selectedUnit.tenant }] : []),
                ...(selectedUnit.revenue ? [{ label: 'الإيراد الشهري', value: `${selectedUnit.revenue.toLocaleString('ar-SA')} ر.س` }] : []),
                ...(selectedUnit.traffic ? [{ label: 'حركة الزوار', value: `${selectedUnit.traffic.toLocaleString('ar-SA')} / يوم` }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Eye className="w-8 h-8 mb-3" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>اضغط على وحدة لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
