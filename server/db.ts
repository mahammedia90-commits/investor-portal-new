import { eq, and, desc, sql, count, or, asc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, exhibitions, exhibitionUnits, bookingRequests, contracts, payments, notifications, activityLog, investmentOpportunities, activeInvestments, investorDocuments, investorProfiles, messages, investorLeads, otpCodes, hubspotSyncLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => { const value = user[field]; if (value === undefined) return; const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized; };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// === Exhibitions ===
export async function getExhibitionsByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exhibitions).where(eq(exhibitions.investorId, investorId)).orderBy(desc(exhibitions.createdAt));
}

export async function getExhibitionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(exhibitions).where(eq(exhibitions.id, id)).limit(1);
  return result[0];
}

export async function getExhibitionUnits(exhibitionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exhibitionUnits).where(eq(exhibitionUnits.exhibitionId, exhibitionId));
}

// === Booking Requests ===
export async function getBookingsByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingRequests).where(eq(bookingRequests.investorId, investorId)).orderBy(desc(bookingRequests.createdAt));
}

export async function updateBookingStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return;
  await db.update(bookingRequests).set({ status }).where(eq(bookingRequests.id, id));
}

// === Contracts ===
export async function getContractsByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.investorId, investorId)).orderBy(desc(contracts.createdAt));
}

export async function signContract(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(contracts).set({ status: "active", signedAt: new Date() }).where(eq(contracts.id, id));
}

// === Payments ===
export async function getPaymentsByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.investorId, investorId)).orderBy(desc(payments.createdAt));
}

// === Notifications ===
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
  return result[0]?.count ?? 0;
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
}

// === Activity Log ===
export async function getActivityLogByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy(desc(activityLog.createdAt)).limit(50);
}

// === Dashboard Stats ===
export async function getDashboardStats(investorId: number) {
  const db = await getDb();
  if (!db) return { activeExhibitions: 0, pendingBookings: 0, activeContracts: 0, totalRevenue: 0, pendingPayments: 0, totalInvested: 0, activeInvestmentsCount: 0, openOpportunities: 0 };

  const [exhResult] = await db.select({ count: count() }).from(exhibitions).where(and(eq(exhibitions.investorId, investorId), eq(exhibitions.status, "active")));
  const [bookResult] = await db.select({ count: count() }).from(bookingRequests).where(and(eq(bookingRequests.investorId, investorId), eq(bookingRequests.status, "pending")));
  const [contResult] = await db.select({ count: count() }).from(contracts).where(and(eq(contracts.investorId, investorId), eq(contracts.status, "active")));
  const [revResult] = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(and(eq(payments.investorId, investorId), eq(payments.status, "received")));
  const [pendPayResult] = await db.select({ count: count() }).from(payments).where(and(eq(payments.investorId, investorId), eq(payments.status, "pending")));
  const [invResult] = await db.select({ total: sql<string>`COALESCE(SUM(investmentAmount), 0)` }).from(activeInvestments).where(and(eq(activeInvestments.investorId, investorId), eq(activeInvestments.status, "active")));
  const [invCountResult] = await db.select({ count: count() }).from(activeInvestments).where(and(eq(activeInvestments.investorId, investorId), eq(activeInvestments.status, "active")));
  const [oppResult] = await db.select({ count: count() }).from(investmentOpportunities).where(eq(investmentOpportunities.status, "open"));

  return {
    activeExhibitions: exhResult?.count ?? 0,
    pendingBookings: bookResult?.count ?? 0,
    activeContracts: contResult?.count ?? 0,
    totalRevenue: parseFloat(revResult?.total ?? "0"),
    pendingPayments: pendPayResult?.count ?? 0,
    totalInvested: parseFloat(invResult?.total ?? "0"),
    activeInvestmentsCount: invCountResult?.count ?? 0,
    openOpportunities: oppResult?.count ?? 0,
  };
}

// === Investment Opportunities ===
export async function getOpportunities(filter?: { category?: string; riskLevel?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(investmentOpportunities.status, "open")];
  if (filter?.category) conditions.push(eq(investmentOpportunities.category, filter.category as any));
  if (filter?.riskLevel) conditions.push(eq(investmentOpportunities.riskLevel, filter.riskLevel as any));
  return db.select().from(investmentOpportunities).where(and(...conditions)).orderBy(desc(investmentOpportunities.opportunityScore));
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(investmentOpportunities).where(eq(investmentOpportunities.id, id)).limit(1);
  return result[0];
}

// === Active Investments (Portfolio) ===
export async function getPortfolioByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activeInvestments).where(eq(activeInvestments.investorId, investorId)).orderBy(desc(activeInvestments.createdAt));
}

export async function getPortfolioStats(investorId: number) {
  const db = await getDb();
  if (!db) return { totalInvested: 0, totalRevenue: 0, totalProfit: 0, activeCount: 0 };
  const [invested] = await db.select({ total: sql<string>`COALESCE(SUM(investmentAmount), 0)` }).from(activeInvestments).where(eq(activeInvestments.investorId, investorId));
  const [revenue] = await db.select({ total: sql<string>`COALESCE(SUM(currentRevenue), 0)` }).from(activeInvestments).where(eq(activeInvestments.investorId, investorId));
  const [profit] = await db.select({ total: sql<string>`COALESCE(SUM(profitDistributed), 0)` }).from(activeInvestments).where(eq(activeInvestments.investorId, investorId));
  const [activeCount] = await db.select({ count: count() }).from(activeInvestments).where(and(eq(activeInvestments.investorId, investorId), eq(activeInvestments.status, "active")));
  return {
    totalInvested: parseFloat(invested?.total ?? "0"),
    totalRevenue: parseFloat(revenue?.total ?? "0"),
    totalProfit: parseFloat(profit?.total ?? "0"),
    activeCount: activeCount?.count ?? 0,
  };
}

// === Investor Documents ===
export async function getDocumentsByInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investorDocuments).where(eq(investorDocuments.investorId, investorId)).orderBy(desc(investorDocuments.createdAt));
}

// === Investor Profile ===
export async function getInvestorProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(investorProfiles).where(eq(investorProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertInvestorProfile(userId: number, data: Partial<typeof investorProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getInvestorProfile(userId);
  if (existing) {
    await db.update(investorProfiles).set(data).where(eq(investorProfiles.userId, userId));
  } else {
    await db.insert(investorProfiles).values({ userId, ...data } as any);
  }
}

// === Messages ===
export async function getMessagesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId))).orderBy(desc(messages.createdAt)).limit(100);
}

export async function sendMessage(senderId: number, receiverId: number, subject: string, content: string, senderType: "investor" | "operator" | "admin" = "investor") {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values({ senderId, receiverId, subject, content, senderType });
}

export async function markMessageRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: 1 }).where(eq(messages.id, id));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(messages).where(and(eq(messages.receiverId, userId), eq(messages.isRead, 0)));
  return result[0]?.count ?? 0;
}

// === OTP & Investor Leads ===

export async function createOtp(phone: string, code: string) {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await db.insert(otpCodes).values({ phone, code, expiresAt });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const now = new Date();
  const result = await db.select().from(otpCodes)
    .where(and(
      eq(otpCodes.phone, phone),
      eq(otpCodes.code, code),
      eq(otpCodes.verified, 0),
      gte(otpCodes.expiresAt, now)
    ))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  if (result.length === 0) return false;
  await db.update(otpCodes).set({ verified: 1 }).where(eq(otpCodes.id, result[0].id));
  return true;
}

export async function getInvestorLeadByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(investorLeads).where(eq(investorLeads.phone, phone)).limit(1);
  return result[0];
}

export async function createInvestorLead(data: { phone: string; fullName: string; investmentInterest: string; region?: string }) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getInvestorLeadByPhone(data.phone);
  if (existing) {
    await db.update(investorLeads).set({
      fullName: data.fullName,
      investmentInterest: data.investmentInterest as any,
      region: data.region || null,
      isRegistered: 1,
      lastLoginAt: new Date(),
    }).where(eq(investorLeads.id, existing.id));
    return { ...existing, fullName: data.fullName, isRegistered: 1 };
  }
  const [result] = await db.insert(investorLeads).values({
    phone: data.phone,
    fullName: data.fullName,
    investmentInterest: data.investmentInterest as any,
    region: data.region || null,
    isRegistered: 1,
    lastLoginAt: new Date(),
  }).$returningId();
  return { id: result.id, ...data };
}

export async function updateInvestorLeadLogin(phone: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(investorLeads).set({ lastLoginAt: new Date() }).where(eq(investorLeads.phone, phone));
}

// === HubSpot Sync Log ===

export async function logHubSpotSync(entry: {
  entityType: string;
  entityId: number;
  hubspotObjectType: string;
  hubspotObjectId?: string | null;
  action: string;
  status: "success" | "failed" | "pending";
  errorMessage?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(hubspotSyncLog).values({
    entityType: entry.entityType,
    entityId: entry.entityId,
    hubspotObjectType: entry.hubspotObjectType,
    hubspotObjectId: entry.hubspotObjectId || null,
    action: entry.action,
    status: entry.status,
    errorMessage: entry.errorMessage || null,
  });
}

export async function getHubSpotSyncLogs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hubspotSyncLog).orderBy(desc(hubspotSyncLog.createdAt)).limit(limit);
}

export async function getHubSpotSyncStats() {
  const db = await getDb();
  if (!db) return { total: 0, success: 0, failed: 0, pending: 0 };
  const [total] = await db.select({ count: count() }).from(hubspotSyncLog);
  const [success] = await db.select({ count: count() }).from(hubspotSyncLog).where(eq(hubspotSyncLog.status, "success"));
  const [failed] = await db.select({ count: count() }).from(hubspotSyncLog).where(eq(hubspotSyncLog.status, "failed"));
  const [pending] = await db.select({ count: count() }).from(hubspotSyncLog).where(eq(hubspotSyncLog.status, "pending"));
  return {
    total: total?.count ?? 0,
    success: success?.count ?? 0,
    failed: failed?.count ?? 0,
    pending: pending?.count ?? 0,
  };
}

export async function getAllInvestorLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investorLeads).orderBy(desc(investorLeads.createdAt));
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt));
}

export async function getAllContracts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).orderBy(desc(contracts.createdAt));
}
