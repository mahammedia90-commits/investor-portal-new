import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Building2, Shield, Award, TrendingUp, Star, Edit3, Save, Globe, Briefcase, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export default function InvestorProfile() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';

  // Fetch real profile from API
  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !!user });
  const portfolioStats = trpc.portfolio.stats.useQuery(undefined, { enabled: !!user });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => { profileQuery.refetch(); toast.success("تم حفظ التغييرات"); setIsEditing(false); }
  });

  const profileData = profileQuery.data;
  const stats = portfolioStats.data as any;

  const profile = {
    companyName: profileData?.companyName || 'مجموعة ماهام',
    companyNameEn: "Maham Investment Group",
    investorType: profileData?.investorType === 'company' ? 'شركة استثمارية' : profileData?.investorType === 'individual' ? 'مستثمر فردي' : 'مستثمر',
    sector: profileData?.preferredSectors?.split(',').map((s: string) => {
      const map: Record<string, string> = { exhibitions_events: 'معارض وفعاليات', food_beverage: 'أغذية ومشروبات', retail_brands: 'تجزئة', technology: 'تقنية' };
      return map[s.trim()] || s;
    }).join('، ') || 'معارض وفعاليات',
    phone: profileData?.phone || '+966 50 XXX XXXX',
    email: user?.email || 'nour@maham.ai',
    city: profileData?.location || 'الرياض',
    country: 'المملكة العربية السعودية',
    website: 'www.maham.ai',
    bio: profileData?.bio || 'مجموعة ماهام — رواد في تنظيم المعارض والفعاليات',
    registrationNumber: 'CR-XXXXXXXX',
    taxNumber: 'VAT-XXXXXXXX',
    verificationStatus: profileData?.verificationStatus || 'pending',
    investmentCapacity: profileData?.investmentCapacity || 0,
    totalInvested: profileData?.totalInvested || stats?.totalInvested || 0,
  };

  const investorStats = {
    totalInvestments: stats?.activeInvestments ? (stats.activeInvestments + (stats.completedInvestments || 0)) : 5,
    activeInvestments: stats?.activeInvestments || 3,
    totalInvested: profile.totalInvested || 6750000,
    totalReturn: stats?.totalReturn || 3785000,
    memberSince: "2024-01-15",
    rating: 4.8,
    verificationStatus: profile.verificationStatus,
    tier: Number(profile.totalInvested) > 5000000 ? 'Platinum' : Number(profile.totalInvested) > 1000000 ? 'Gold' : 'Silver',
  };

  const achievements = [
    { title: 'مستثمر بلاتيني', description: 'استثمارات تتجاوز 5 مليون ر.س', icon: Award, color: goldColor, earned: Number(investorStats.totalInvested) > 5000000 },
    { title: 'عائد متميز', description: 'عائد استثماري يتجاوز 25%', icon: TrendingUp, color: greenColor, earned: investorStats.totalReturn > investorStats.totalInvested * 0.25 },
    { title: 'مستثمر موثق', description: 'تم التحقق من الهوية والسجل', icon: Shield, color: goldColor, earned: profile.verificationStatus === 'verified' },
    { title: 'رائد المعارض', description: 'مشاركة في أكثر من 3 معارض', icon: Star, color: greenColor, earned: investorStats.totalInvestments >= 3 },
    { title: 'محفظة متنوعة', description: 'استثمارات في 3+ قطاعات', icon: Briefcase, color: '#6464FF', earned: false },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.riyadhSeason1} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(12, 12, 24, 0.68) 0%, rgba(10, 10, 20, 0.95) 60%)' }} />
        </div>
        <div className="relative p-6 pt-12">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ring-4" style={{ background: `linear-gradient(135deg, var(--gold), #F5D799)`, color: 'var(--card)', boxShadow: '0 0 0 4px rgba(152,112,18,0.2)' }}>
              {user?.name?.charAt(0) || 'N'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-white">{user?.name || 'نور كرم'}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(152,112,18,0.2)', color: goldColor }}>{investorStats.tier}</span>
                {investorStats.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(76,175,80,0.15)', color: greenColor }}>
                    <Shield className="w-3 h-3" /> موثّق
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: goldColor }}>{profile.companyName}</p>
              <p className="text-xs mt-1 text-white/60">{profile.bio}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-white/50" />
                  <span className="text-[10px] text-white/50">{profile.city}، {profile.country}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-white/50" />
                  <span className="text-[10px] text-white/50">عضو منذ {investorStats.memberSince}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" style={{ color: goldColor }} />
                  <span className="text-[10px] font-bold" style={{ color: goldColor }}>{investorStats.rating}</span>
                </div>
              </div>
            </div>
            <button onClick={() => { if (isEditing) { updateProfile.mutate({ companyName: profile.companyName, phone: profile.phone, bio: profile.bio }); } else { setIsEditing(true); } }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(152,112,18,0.15)', color: goldColor, border: '1px solid rgba(152,112,18,0.3)' }}>
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditing ? 'حفظ' : 'تعديل'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الاستثمارات', value: String(investorStats.totalInvestments), color: goldColor },
          { label: 'استثمارات نشطة', value: String(investorStats.activeInvestments), color: greenColor },
          { label: 'إجمالي المستثمر', value: `${(Number(investorStats.totalInvested) / 1000000).toFixed(1)}M ر.س`, color: goldColor },
          { label: 'إجمالي العوائد', value: `${(Number(investorStats.totalReturn) / 1000000).toFixed(1)}M ر.س`, color: greenColor },
        ].map((s, i) => (
          <div key={i} className="nour-card p-4 text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[9px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Company Info */}
        <div className="nour-card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>معلومات الشركة</h2>
          <div className="space-y-3">
            {[
              { label: 'اسم الشركة', value: profile.companyName, icon: Building2 },
              { label: 'الاسم بالإنجليزية', value: profile.companyNameEn, icon: Globe },
              { label: 'نوع المستثمر', value: profile.investorType, icon: Briefcase },
              { label: 'القطاعات', value: profile.sector, icon: TrendingUp },
              { label: 'السجل التجاري', value: profile.registrationNumber, icon: Shield },
              { label: 'الرقم الضريبي', value: profile.taxNumber, icon: Shield },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                <item.icon className="w-4 h-4 shrink-0" style={{ color: goldColor }} />
                <div className="flex-1">
                  <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="nour-card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>معلومات التواصل</h2>
          <div className="space-y-3">
            {[
              { label: 'البريد الإلكتروني', value: profile.email, icon: Mail },
              { label: 'الهاتف', value: profile.phone, icon: Phone },
              { label: 'المدينة', value: profile.city, icon: MapPin },
              { label: 'الدولة', value: profile.country, icon: Globe },
              { label: 'الموقع الإلكتروني', value: profile.website, icon: Globe },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                <item.icon className="w-4 h-4 shrink-0" style={{ color: greenColor }} />
                <div className="flex-1">
                  <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="nour-card p-5">
        <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>الإنجازات والأوسمة</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {achievements.map((ach, i) => (
            <div key={i} className={`rounded-xl p-4 text-center transition-all ${ach.earned ? '' : 'opacity-40'}`} style={{ background: 'var(--card)', border: `1px solid ${ach.earned ? 'var(--border)' : 'transparent'}` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--gold-bg)' }}>
                <ach.icon className="w-5 h-5" style={{ color: ach.color }} />
              </div>
              <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{ach.title}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>{ach.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
