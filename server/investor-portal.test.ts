import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-investor",
    email: "nour@maham.ai",
    name: "Nour Karam",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

// === Auth Tests ===
describe("Auth Router", () => {
  it("auth.me returns user for authenticated context", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Nour Karam");
    expect(result?.email).toBe("nour@maham.ai");
  });

  it("auth.me returns null for public context", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.logout clears session cookie", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

// === Dashboard Tests ===
describe("Dashboard Router", () => {
  it("dashboard.stats returns correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toBeDefined();
    expect(typeof result.activeExhibitions).toBe("number");
    expect(typeof result.pendingBookings).toBe("number");
    expect(typeof result.activeContracts).toBe("number");
    expect(typeof result.totalRevenue).toBe("number");
    expect(result.activeExhibitions).toBeGreaterThanOrEqual(0);
    expect(result.pendingBookings).toBeGreaterThanOrEqual(0);
  });
});

// === Exhibitions Tests ===
describe("Exhibitions Router", () => {
  it("exhibitions.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exhibitions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === Bookings Tests ===
describe("Bookings Router", () => {
  it("bookings.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === Contracts Tests ===
describe("Contracts Router", () => {
  it("contracts.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contracts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === Payments Tests ===
describe("Payments Router", () => {
  it("payments.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === Notifications Tests ===
describe("Notifications Router", () => {
  it("notifications.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("notifications.unreadCount returns number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.unreadCount();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// === NEW: Opportunities Tests ===
describe("Opportunities Router", () => {
  it("opportunities.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === NEW: Portfolio Tests ===
describe("Portfolio Router", () => {
  it("portfolio.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portfolio.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("portfolio.stats returns correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portfolio.stats();
    expect(result).toBeDefined();
    expect(typeof result.totalInvested).toBe("number");
    expect(typeof result.totalRevenue).toBe("number");
    expect(typeof result.totalProfit).toBe("number");
    expect(typeof result.activeCount).toBe("number");
  });
});

// === NEW: Documents Tests ===
describe("Documents Router", () => {
  it("documents.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documents.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// === NEW: Messages Tests ===
describe("Messages Router", () => {
  it("messages.list returns array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.messages.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("messages.unreadCount returns number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.messages.unreadCount();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
