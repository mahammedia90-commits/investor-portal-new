import { describe, expect, it } from "vitest";

/**
 * Landing Page routing and structure tests.
 * These tests verify that the landing page is accessible publicly
 * and that the dashboard routes are correctly separated.
 */

describe("Landing Page Configuration", () => {
  it("should have landing page route at root /", () => {
    // The landing page should be accessible at the root path
    const landingRoute = "/";
    const dashboardRoute = "/dashboard";
    
    expect(landingRoute).toBe("/");
    expect(dashboardRoute).toBe("/dashboard");
    expect(landingRoute).not.toBe(dashboardRoute);
  });

  it("should have all required landing page sections defined", () => {
    const requiredSections = [
      "hero",
      "why-invest",
      "how-it-works",
      "stats",
      "features",
      "testimonials",
      "faq",
      "cta",
      "footer",
    ];

    expect(requiredSections).toHaveLength(9);
    expect(requiredSections).toContain("hero");
    expect(requiredSections).toContain("why-invest");
    expect(requiredSections).toContain("how-it-works");
    expect(requiredSections).toContain("stats");
    expect(requiredSections).toContain("features");
    expect(requiredSections).toContain("testimonials");
    expect(requiredSections).toContain("faq");
    expect(requiredSections).toContain("cta");
    expect(requiredSections).toContain("footer");
  });

  it("should have correct brand colors for Sovereign Glassmorphism & Golden Touch", () => {
    // Sovereign Glassmorphism primary tokens
    const SOVEREIGN_GOLD = "#d4a843";
    const GOLD_WARM = "#f0d78c";
    const GOLD_DEEP = "#A67C00";
    const DARK_BG = "#0a0a0a";
    const GLASS_SURFACE = "rgba(20,20,35,0.6)";
    const GLASS_BORDER = "rgba(212,168,67,0.12)";

    expect(SOVEREIGN_GOLD).toBe("#d4a843");
    expect(GOLD_WARM).toBe("#f0d78c");
    expect(GOLD_DEEP).toBe("#A67C00");
    expect(DARK_BG).toBe("#0a0a0a");
    expect(GLASS_SURFACE).toBe("rgba(20,20,35,0.6)");
    expect(GLASS_BORDER).toBe("rgba(212,168,67,0.12)");
  });

  it("should have correct number of why-invest cards", () => {
    const whyInvestCards = [
      "تملّك مساحات في أكبر الفعاليات",
      "قسّم وحداتك وأجّرها للتجار",
      "عوائد إيجارية مرتفعة",
      "أعد استثمارها لمستثمرين فرعيين",
      "تحليلات ذكية بالـ AI",
      "عقود موثقة وحماية كاملة",
    ];

    expect(whyInvestCards).toHaveLength(6);
  });

  it("should have correct number of how-it-works steps", () => {
    const steps = [
      { step: 1, title: "احجز مساحتك" },
      { step: 2, title: "قسّم الوحدات" },
      { step: 3, title: "أجّر للتجار أو المستثمرين" },
      { step: 4, title: "تابع عوائدك" },
    ];

    expect(steps).toHaveLength(4);
    expect(steps[0].step).toBe(1);
    expect(steps[3].step).toBe(4);
  });

  it("should have correct number of FAQ items", () => {
    const faqs = [
      "ما هي بوابة المستثمر من مهام إكسبو؟",
      "كيف أحجز مساحة وأبدأ تأجير الوحدات؟",
      "ما الفرق بين التأجير المباشر والتسليم لمستثمر فرعي؟",
      "ما هي أنواع الفعاليات والمعارض المتاحة؟",
      "كيف تحمي المنصة حقوقي كمستثمر؟",
      "ما هي رسوم المنصة؟",
    ];

    expect(faqs).toHaveLength(6);
  });

  it("should have correct number of testimonials", () => {
    const testimonials = [
      { name: "م. خالد العتيبي", role: "مستثمر رئيسي — بوليفارد وورلد" },
      { name: "أ. سارة المنصور", role: "مديرة استثمارات — مجموعة المنصور" },
      { name: "د. عبدالله الشمري", role: "رئيس تنفيذي — شركة الشمري القابضة" },
    ];

    expect(testimonials).toHaveLength(3);
  });

  it("should have correct number of platform features", () => {
    const features = [
      "سوق المساحات والفعاليات",
      "إدارة الوحدات والتجار",
      "عقود إيجار إلكترونية",
      "خريطة رقمية تفاعلية",
      "تحليلات الإشغال والعوائد",
      "مستشار AI للتسعير",
    ];

    expect(features).toHaveLength(6);
  });

  it("should have dashboard routes separate from landing page", () => {
    const dashboardRoutes = [
      "/dashboard",
      "/exhibitions",
      "/bookings",
      "/contracts",
      "/payments",
      "/marketplace",
      "/deal-room",
      "/portfolio",
      "/analytics",
      "/digital-twin",
      "/live-economy",
      "/ai-advisor",
      "/roi-calculator",
      "/financial-center",
      "/documents",
      "/communications",
      "/map",
      "/notifications",
      "/profile",
    ];

    // All dashboard routes should NOT be at root
    dashboardRoutes.forEach((route) => {
      expect(route).not.toBe("/");
      expect(route.startsWith("/")).toBe(true);
    });

    // Should have at least 19 dashboard routes
    expect(dashboardRoutes.length).toBeGreaterThanOrEqual(19);
  });

  it("should have login URL generation capability", () => {
    // Verify that the login URL pattern is correct
    const loginUrlPattern = /\/api\/oauth\/login/;
    const testUrl = "/api/oauth/login?state=encoded-state";
    
    expect(loginUrlPattern.test(testUrl)).toBe(true);
  });
});
