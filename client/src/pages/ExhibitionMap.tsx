import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { Grid3X3, Eye, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type UnitStatus = "available" | "booked" | "pending";
interface Unit { id: number; code: string; type: string; area: number; price: number; status: UnitStatus; x: number; y: number; w: number; h: number; }

const demoUnits: Unit[] = [
  { id: 1, code: "A-01", type: "premium", area: 50, price: 180000, status: "booked", x: 0, y: 0, w: 2, h: 2 },
  { id: 2, code: "A-02", type: "retail", area: 25, price: 95000, status: "booked", x: 2, y: 0, w: 1, h: 1 },
  { id: 3, code: "A-03", type: "retail", area: 25, price: 95000, status: "available", x: 3, y: 0, w: 1, h: 1 },
  { id: 4, code: "A-04", type: "food", area: 30, price: 120000, status: "pending", x: 4, y: 0, w: 1, h: 1 },
  { id: 5, code: "A-05", type: "retail", area: 25, price: 90000, status: "available", x: 5, y: 0, w: 1, h: 1 },
  { id: 6, code: "B-01", type: "premium", area: 60, price: 220000, status: "booked", x: 0, y: 2, w: 2, h: 1 },
  { id: 7, code: "B-02", type: "retail", area: 25, price: 85000, status: "available", x: 2, y: 1, w: 1, h: 1 },
  { id: 8, code: "B-03", type: "food", area: 35, price: 130000, status: "booked", x: 3, y: 1, w: 1, h: 1 },
  { id: 9, code: "B-04", type: "service", area: 20, price: 70000, status: "pending", x: 4, y: 1, w: 1, h: 1 },
  { id: 10, code: "B-05", type: "retail", area: 25, price: 95000, status: "booked", x: 5, y: 1, w: 1, h: 1 },
  { id: 11, code: "C-01", type: "retail", area: 25, price: 80000, status: "available", x: 0, y: 3, w: 1, h: 1 },
  { id: 12, code: "C-02", type: "food", area: 30, price: 110000, status: "available", x: 1, y: 3, w: 1, h: 1 },
  { id: 13, code: "C-03", type: "premium", area: 45, price: 160000, status: "booked", x: 2, y: 2, w: 2, h: 2 },
  { id: 14, code: "C-04", type: "retail", area: 25, price: 85000, status: "pending", x: 4, y: 2, w: 1, h: 1 },
  { id: 15, code: "C-05", type: "service", area: 20, price: 65000, status: "available", x: 5, y: 2, w: 1, h: 1 },
  { id: 16, code: "D-01", type: "retail", area: 25, price: 90000, status: "booked", x: 0, y: 4, w: 1, h: 1 },
  { id: 17, code: "D-02", type: "food", area: 30, price: 100000, status: "available", x: 1, y: 4, w: 1, h: 1 },
  { id: 18, code: "D-03", type: "retail", area: 25, price: 85000, status: "booked", x: 4, y: 3, w: 1, h: 1 },
  { id: 19, code: "D-04", type: "service", area: 20, price: 70000, status: "pending", x: 5, y: 3, w: 1, h: 1 },
  { id: 20, code: "D-05", type: "premium", area: 50, price: 200000, status: "available", x: 0, y: 5, w: 2, h: 1 },
  { id: 21, code: "D-06", type: "retail", area: 25, price: 80000, status: "booked", x: 2, y: 4, w: 1, h: 1 },
  { id: 22, code: "D-07", type: "food", area: 35, price: 125000, status: "available", x: 3, y: 4, w: 1, h: 1 },
  { id: 23, code: "D-08", type: "retail", area: 25, price: 90000, status: "pending", x: 4, y: 4, w: 1, h: 1 },
  { id: 24, code: "D-09", type: "service", area: 20, price: 75000, status: "booked", x: 5, y: 4, w: 1, h: 1 },
];

export default function ExhibitionMap() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const exhibitionsQuery = trpc.exhibitions.list.useQuery(undefined, { enabled: !!user });
  const exhibitions = exhibitionsQuery.data || [];
  const typeLabels: Record<string, string> = { retail: t("dashboard.exhibitionMap.commercial"), food: t("dashboard.exhibitionMap.food"), service: t("dashboard.exhibitionMap.services"), premium: t("dashboard.exhibitionMap.premium") };
  const isDark = theme === 'dark';
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [zoom, setZoom] = useState(1);

  // Use real exhibition data to adjust unit statuses
  const units = useMemo(() => {
    if (exhibitions.length > 0) {
      const exh = exhibitions[0] as any;
      const bookedBooths = exh.bookedBooths || 0;
      return demoUnits.map((u, i) => {
        if (i < bookedBooths) return { ...u, status: 'booked' as UnitStatus };
        if (i < bookedBooths + 3) return { ...u, status: 'pending' as UnitStatus };
        return { ...u, status: 'available' as UnitStatus };
      });
    }
    return demoUnits;
  }, [exhibitions]);
  const filtered = filterStatus === "all" ? units : units.filter(u => u.status === filterStatus);
  const totalUnits = units.length;
  const bookedCount = units.filter(u => u.status === "booked").length;
  const availableCount = units.filter(u => u.status === "available").length;
  const pendingCount = units.filter(u => u.status === "pending").length;

  const statusColors: Record<UnitStatus, { bg: string; border: string; label: string; text: string }> = {
    available: { bg: 'rgba(0,255,65,0.12)', border: 'rgba(0,255,65,0.3)', label: t("dashboard.exhibitionMap.available"), text: '#4CAF50' },
    booked: { bg: 'rgba(212,168,83,0.12)', border: 'rgba(212,168,83,0.3)', label: t("dashboard.exhibitionMap.booked"), text: 'var(--gold)' },
    pending: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', label: t("dashboard.exhibitionMap.pending"), text: '#60A5FA' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '150px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.boothDesign2} alt={t('exhibitionMap.header.imageAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] inline-block">EXHIBITION MAP</p>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('exhibitionMap.header.title')}</h1>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('exhibitionMap.header.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.6, zoom - 0.1))} className="p-2 rounded-xl glass"><ZoomOut className="w-4 h-4" style={{ color: '#F5F5F5' }} /></button>
            <span className="text-xs" style={{ color: '#9ca3af' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 rounded-xl glass"><ZoomIn className="w-4 h-4" style={{ color: '#F5F5F5' }} /></button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {(Object.entries(statusColors) as [UnitStatus, typeof statusColors[UnitStatus]][]).map(([key, val]) => {
          const count = key === "available" ? availableCount : key === "booked" ? bookedCount : pendingCount;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300"
              style={{
                background: filterStatus === key ? val.bg : 'transparent',
                border: `1px solid ${filterStatus === key ? val.border : 'transparent'}`,
                color: val.text,
              }}>
              <div className="w-3 h-3 rounded" style={{ background: val.bg, border: `1px solid ${val.border}` }} />
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Grid */}
        <div className="lg:col-span-2 nour-card p-5 overflow-auto">
          <div className="mb-3 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" style={{ color: '#FBBF24' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('exhibitionMap.grid.title')}</span>
          </div>
          <div className="relative mx-auto" style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)',
            gap: `${4 * zoom}px`, transform: `scale(${zoom})`, transformOrigin: 'top right', width: '100%', maxWidth: '600px',
          }}>
            {filtered.map((unit) => {
              const sc = statusColors[unit.status];
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <button key={unit.id} onClick={() => setSelectedUnit(unit)}
                  className="rounded-xl flex flex-col items-center justify-center transition-all text-center hover:scale-105"
                  style={{
                    gridColumn: `${unit.x + 1} / span ${unit.w}`, gridRow: `${unit.y + 1} / span ${unit.h}`,
                    background: sc.bg, border: `2px solid ${isSelected ? sc.text : sc.border}`, minHeight: `${60 * zoom}px`,
                    boxShadow: isSelected ? `0 0 12px ${sc.text}30` : 'none',
                  }}>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{unit.code}</span>
                  <span className="text-[8px]" style={{ color: '#9a9aae' }}>{typeLabels[unit.type]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unit Details */}
        <div className="nour-card p-5">
          {selectedUnit ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t("dashboard.exhibitionMap.unit")} {selectedUnit.code}</h3>
                <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: statusColors[selectedUnit.status].bg, color: statusColors[selectedUnit.status].text }}>
                  {statusColors[selectedUnit.status].label}
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: t("dashboard.exhibitionMap.type"), value: typeLabels[selectedUnit.type] },
                  { label: t("dashboard.exhibitionMap.area"), value: `${selectedUnit.area} ${t("dashboard.exhibitionMap.sqm")}` },
                  { label: t("dashboard.exhibitionMap.price"), value: `${selectedUnit.price.toLocaleString('ar-SA')} ${t("dashboard.exhibitionMap.sar")}` },
                  { label: t("dashboard.exhibitionMap.location"), value: `${t("dashboard.exhibitionMap.rowCol").replace("{row}", String(selectedUnit.y + 1)).replace("{col}", String(selectedUnit.x + 1))}` },
                  { label: t("dashboard.exhibitionMap.dimensions"), value: `${selectedUnit.w} × ${selectedUnit.h}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Eye className="w-8 h-8 mb-3" style={{ color: '#6B5B45' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('exhibitionMap.details.placeholder')}</p>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h4 className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('exhibitionMap.summary.title')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>{t('exhibitionMap.summary.totalUnits')}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{totalUnits}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>{t('exhibitionMap.summary.occupancyRate')}</span>
                <span style={{ color: '#4CAF50' }}>{Math.round((bookedCount / totalUnits) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mt-1" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(bookedCount / totalUnits) * 100}%`, background: `linear-gradient(90deg, #987012, #4CAF50)` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
