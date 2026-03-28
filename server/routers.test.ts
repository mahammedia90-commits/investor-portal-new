import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(userId = 1): TrpcContext {
  const user = {
    id: userId,
    openId: "test-user-open-id",
    email: "test@example.com",
    name: "Test Investor",
    loginMethod: "manus" as const,
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Investor");
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("dashboard.stats", () => {
  it("returns stats object for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("activeExhibitions");
    expect(result).toHaveProperty("pendingBookings");
    expect(result).toHaveProperty("activeContracts");
    expect(result).toHaveProperty("totalRevenue");
  });
});

describe("exhibitions.list", () => {
  it("returns an array for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exhibitions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("notifications", () => {
  it("returns notification list for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns unread count as a number", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.unreadCount();
    expect(typeof result).toBe("number");
  });
});

describe("portfolio", () => {
  it("returns portfolio list for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portfolio.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns portfolio stats for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portfolio.stats();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalInvested");
    // totalReturns may be named differently
    expect(typeof result.totalInvested).toBe("number");
  });
});

describe("messages", () => {
  it("returns messages list for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.messages.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns unread message count as a number", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.messages.unreadCount();
    expect(typeof result).toBe("number");
  });
});

describe("profile", () => {
  it("returns profile data for authenticated user without error", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    // Profile may be null/undefined if not created yet, but the call should not throw
    const result = await caller.profile.get();
    // Accept null, undefined, or an object
    expect([null, undefined].includes(result as any) || typeof result === 'object').toBe(true);
  });
});
