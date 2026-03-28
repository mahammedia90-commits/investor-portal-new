import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CDN_IMAGES } from "@/lib/images";
import { Phone, ArrowLeft, CheckCircle2, Sparkles, Shield, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Investment Interest Options ───
const INVESTMENT_INTEREST_KEYS: { value: string; key: string; icon: string }[] = [
  { value: "exhibitions_events", key: "dashboard.investorLogin.interests.exhibitions", icon: "🏛️" },
  { value: "real_estate", key: "dashboard.investorLogin.interests.realEstate", icon: "🏗️" },
  { value: "food_beverage", key: "dashboard.investorLogin.interests.foodBeverage", icon: "🍽️" },
  { value: "retail_brands", key: "dashboard.investorLogin.interests.retail", icon: "🛍️" },
  { value: "entertainment", key: "dashboard.investorLogin.interests.entertainment", icon: "🎭" },
  { value: "technology", key: "dashboard.investorLogin.interests.technology", icon: "💻" },
  { value: "general_investment", key: "dashboard.investorLogin.interests.general", icon: "📊" },
];

// ─── Saudi Regions ───
const REGION_KEYS = [
  "dashboard.investorLogin.regions.riyadh",
  "dashboard.investorLogin.regions.makkah",
  "dashboard.investorLogin.regions.madinah",
  "dashboard.investorLogin.regions.eastern",
  "dashboard.investorLogin.regions.qassim",
  "dashboard.investorLogin.regions.asir",
  "dashboard.investorLogin.regions.tabuk",
  "dashboard.investorLogin.regions.hail",
  "dashboard.investorLogin.regions.jouf",
  "dashboard.investorLogin.regions.jazan",
  "dashboard.investorLogin.regions.najran",
  "dashboard.investorLogin.regions.baha",
  "dashboard.investorLogin.regions.northern",
];

// ─── Flow Steps ───
type Step = "phone" | "otp" | "register" | "success";

// ─── Gold Particle Animation Component ───
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; fadeDir: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeDir * 0.003;
        if (p.opacity > 0.5) p.fadeDir = -1;
        if (p.opacity < 0.05) p.fadeDir = 1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(152,112,18, ${p.opacity})`;
        ctx.fill();

        // Gold glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(152,112,18, ${p.opacity * 0.15})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}

// ─── OTP Input Component ───
function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length - value.length).fill(""));

  const handleChange = (idx: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.slice(0, length);
    arr[idx] = char;
    const newVal = arr.join("").slice(0, length);
    onChange(newVal);
    if (char && idx < length - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      {digits.slice(0, length).map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-300 focus:outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: d ? "rgba(152,112,18,0.6)" : "rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: d ? "0 0 20px rgba(152,112,18,0.15)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Login Page ───
export default function InvestorLogin() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [fullName, setFullName] = useState("");
  const [interest, setInterest] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { t } = useLanguage();

  // tRPC mutations
  const sendOtp = trpc.investorAuth.sendOtp.useMutation();
  const verifyOtp = trpc.investorAuth.verifyOtp.useMutation();
  const demoBypass = trpc.investorAuth.demoBypass.useMutation();
  const register = trpc.investorAuth.register.useMutation();
  const login = trpc.investorAuth.login.useMutation();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── Handlers ───
  const handleSendOtp = async () => {
    if (phone.length < 9) { setError(t('dashboard.investorLogin.invalidPhone')); return; }
    setError("");
    setLoading(true);
    try {
      const result = await sendOtp.mutateAsync({ phone });
      if (result.demo && result.hint) setDemoOtp(result.hint);
      setStep("otp");
      setCountdown(60);
    } catch {
      setError(t('dashboard.investorLogin.otpSendError'));
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { setError(t('dashboard.investorLogin.invalidOtp')); return; }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp.mutateAsync({ phone, code: otpValue });
      if (!result.success) { setError(result.error || t('dashboard.investorLogin.wrongOtp')); setLoading(false); return; }
      if (result.isRegistered && result.leadData) {
        // Already registered — login directly
        await login.mutateAsync({ phone });
        setStep("success");
        setTimeout(() => setLocation("/dashboard"), 1500);
      } else {
        // New user — go to registration
        if (result.leadData) {
          setFullName(result.leadData.fullName || "");
          setInterest(result.leadData.investmentInterest || "");
          setRegion(result.leadData.region || "");
        }
        setStep("register");
      }
    } catch {
      setError(t('dashboard.investorLogin.verifyError'));
    }
    setLoading(false);
  };

  const handleDemoBypass = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await demoBypass.mutateAsync({ phone });
      if (result.isRegistered) {
        await login.mutateAsync({ phone });
        setStep("success");
        setTimeout(() => setLocation("/dashboard"), 1500);
      } else {
        setStep("register");
      }
    } catch {
      setError(t('dashboard.investorLogin.generalError'));
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!fullName.trim()) { setError(t('dashboard.investorLogin.nameRequired')); return; }
    if (!interest) { setError(t('dashboard.investorLogin.interestRequired')); return; }
    setError("");
    setLoading(true);
    try {
      await register.mutateAsync({
        phone,
        fullName: fullName.trim(),
        investmentInterest: interest as any,
        region: region || undefined,
      });
      setStep("success");
      setTimeout(() => setLocation("/dashboard"), 1500);
    } catch {
      setError(t('dashboard.investorLogin.registerError'));
    }
    setLoading(false);
  };

  // ─── Glass Card Style ───
  const glassCard: React.CSSProperties = {
    background: "rgba(10, 10, 14, 0.75)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(152,112,18, 0.12)",
    borderRadius: "24px",
    boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(152,112,18,0.08)",
  };

  const goldBtn: React.CSSProperties = {
    background: "linear-gradient(135deg, #987012 0%, #B8962E 50%, #987012 100%)",
    color: "#0A0A0E",
    fontWeight: 700,
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(152,112,18,0.3), 0 2px 8px rgba(152,112,18,0.2)",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    color: "#fff",
    padding: "14px 16px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* ─── Background ─── */}
      <div className="fixed inset-0 z-0">
        <img
          src={CDN_IMAGES.riyadhSkylineNight}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.15) saturate(0.6)" }}
        />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(152,112,18,0.06) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(10,10,14,0.95) 100%)",
        }} />
      </div>

      {/* ─── Gold Particles ─── */}
      <GoldParticles />

      {/* ─── Content ─── */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <img
            src={CDN_IMAGES.mahamExpoLogoDark}
            alt="Maham Expo"
            className="h-16 mx-auto mb-4 rounded-lg"
            style={{ filter: "brightness(1.2)" }}
          />
          <h1 className="text-2xl font-bold text-white tracking-wide">{t('dashboard.investorLogin.title')}</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(152,112,18,0.7)" }}>INVESTOR PORTAL</p>
        </div>

        {/* ─── Glass Card ─── */}
        <div className="w-full max-w-md" style={glassCard}>
          <div className="p-8">

            {/* ═══ Step 1: Phone ═══ */}
            {step === "phone" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(152,112,18,0.1)", border: "1px solid rgba(152,112,18,0.2)" }}>
                    <Phone className="w-6 h-6" style={{ color: "#987012" }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('dashboard.investorLogin.loginTitle')}</h2>
                  <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {t('dashboard.investorLogin.enterPhoneDesc')}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>🇸🇦</span>
                    <span>+966</span>
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="5XXXXXXXX"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    maxLength={10}
                    style={{ ...inputStyle, paddingRight: "100px", textAlign: "left" }}
                    className="w-full focus:border-[rgba(152,112,18,0.5)]"
                    onFocus={(e) => { e.target.style.borderColor = "rgba(152,112,18,0.5)"; e.target.style.boxShadow = "0 0 24px rgba(152,112,18,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 9}
                  className="w-full py-4 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  style={goldBtn}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('dashboard.investorLogin.sending')}
                    </span>
                  ) : t('dashboard.investorLogin.sendOtp')}
                </button>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{t('dashboard.investorLogin.or')}</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>

                <button
                  onClick={() => { if (phone.length >= 9) handleDemoBypass(); else setError(t('dashboard.investorLogin.enterPhoneFirst')); }}
                  className="w-full py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('dashboard.investorLogin.demoBypass')}
                  </span>
                </button>

                {/* Back to landing */}
                <button
                  onClick={() => setLocation("/")}
                  className="w-full flex items-center justify-center gap-2 text-sm pt-2 transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('dashboard.investorLogin.backToHome')}
                </button>
              </div>
            )}

            {/* ═══ Step 2: OTP Verification ═══ */}
            {step === "otp" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(152,112,18,0.1)", border: "1px solid rgba(152,112,18,0.2)" }}>
                    <Shield className="w-6 h-6" style={{ color: "#987012" }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('dashboard.investorLogin.otpTitle')}</h2>
                  <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {t('dashboard.investorLogin.otpSentTo')} <span className="text-white font-medium" dir="ltr">+966{phone}</span>
                  </p>
                </div>

                {/* Demo OTP hint */}
                {demoOtp && (
                  <div className="rounded-xl p-3 text-center" style={{ background: "rgba(152,112,18,0.08)", border: "1px solid rgba(152,112,18,0.15)" }}>
                    <p className="text-xs" style={{ color: "rgba(152,112,18,0.8)" }}>
                      {t('dashboard.investorLogin.demoMode')} <span className="font-bold text-sm text-white" dir="ltr">{demoOtp}</span>
                    </p>
                  </div>
                )}

                <OtpInput value={otpValue} onChange={(v) => { setOtpValue(v); setError(""); }} />

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpValue.length !== 6}
                  className="w-full py-4 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={goldBtn}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('dashboard.investorLogin.verifying')}
                    </span>
                  ) : t('dashboard.investorLogin.verify')}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => { setStep("phone"); setOtpValue(""); setDemoOtp(""); setError(""); }}
                    className="flex items-center gap-1 transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t('dashboard.investorLogin.changeNumber')}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={countdown > 0 || loading}
                    className="transition-colors disabled:opacity-40"
                    style={{ color: countdown > 0 ? "rgba(255,255,255,0.3)" : "rgba(152,112,18,0.8)" }}
                  >
                    {countdown > 0 ? `${t('dashboard.investorLogin.resend')} (${countdown})` : t('dashboard.investorLogin.resend')}
                  </button>
                </div>

                {/* Demo bypass from OTP step */}
                <button
                  onClick={handleDemoBypass}
                  className="w-full py-2.5 text-xs font-medium rounded-xl transition-all duration-300 hover:bg-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                >
                  {t('dashboard.investorLogin.noCodeReceived')}
                </button>
              </div>
            )}

            {/* ═══ Step 3: Registration ═══ */}
            {step === "register" && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(152,112,18,0.1)", border: "1px solid rgba(152,112,18,0.2)" }}>
                    <Sparkles className="w-6 h-6" style={{ color: "#987012" }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('dashboard.investorLogin.completeProfile')}</h2>
                  <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {t('dashboard.investorLogin.profileDesc')}
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {t('dashboard.investorLogin.fullNameLabel')} <span style={{ color: "#987012" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('dashboard.investorLogin.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(""); }}
                    style={inputStyle}
                    className="w-full focus:border-[rgba(152,112,18,0.5)]"
                    onFocus={(e) => { e.target.style.borderColor = "rgba(152,112,18,0.5)"; e.target.style.boxShadow = "0 0 24px rgba(152,112,18,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Investment Interest */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {t('dashboard.investorLogin.interestLabel')} <span style={{ color: "#987012" }}>*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INVESTMENT_INTEREST_KEYS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => { setInterest(item.value); setError(""); }}
                        className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-300 text-right"
                        style={{
                          background: interest === item.value ? "rgba(152,112,18,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1.5px solid ${interest === item.value ? "rgba(152,112,18,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: interest === item.value ? "#fff" : "rgba(255,255,255,0.55)",
                          boxShadow: interest === item.value ? "0 0 20px rgba(152,112,18,0.1)" : "none",
                        }}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="truncate">{t(item.key)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {t('marketplace.region')} <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{t('dashboard.investorLogin.optional')}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      style={{ ...inputStyle, appearance: "none", paddingLeft: "40px" }}
                      className="w-full"
                    >
                      <option value="" style={{ background: "#1a1a1e" }}>{t('dashboard.investorLogin.selectRegion')}</option>
                      {REGION_KEYS.map((rKey) => (
                        <option key={rKey} value={t(rKey)} style={{ background: "#1a1a1e" }}>{t(rKey)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  onClick={handleRegister}
                  disabled={loading || !fullName.trim() || !interest}
                  className="w-full py-4 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={goldBtn}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('dashboard.investorLogin.saving')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {t('dashboard.investorLogin.enterPlatform')}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setStep("phone"); setError(""); }}
                  className="w-full flex items-center justify-center gap-2 text-sm pt-1 transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('dashboard.investorLogin.back')}
                </button>
              </div>
            )}

            {/* ═══ Step 4: Success ═══ */}
            {step === "success" && (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse"
                  style={{ background: "rgba(152,112,18,0.12)", border: "2px solid rgba(152,112,18,0.3)" }}>
                  <CheckCircle2 className="w-10 h-10" style={{ color: "#987012" }} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('dashboard.investorLogin.welcome')}</h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {t('dashboard.investorLogin.redirecting')}
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-8 h-1 rounded-full animate-pulse" style={{ background: "rgba(152,112,18,0.5)" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} Maham Expo — {t('dashboard.investorLogin.footerText')}
          </p>
        </div>
      </div>

      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
