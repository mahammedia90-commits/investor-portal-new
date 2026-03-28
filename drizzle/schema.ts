import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const exhibitions = mysqlTable("exhibitions", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  totalUnits: int("totalUnits").default(0),
  bookedUnits: int("bookedUnits").default(0),
  status: mysqlEnum("status", ["active", "upcoming", "completed", "cancelled"]).default("upcoming").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exhibition = typeof exhibitions.$inferSelect;
export type InsertExhibition = typeof exhibitions.$inferInsert;

export const exhibitionUnits = mysqlTable("exhibition_units", {
  id: int("id").autoincrement().primaryKey(),
  exhibitionId: int("exhibitionId").notNull(),
  unitCode: varchar("unitCode", { length: 20 }).notNull(),
  unitType: mysqlEnum("unitType", ["retail", "food", "service", "premium"]).default("retail").notNull(),
  area: decimal("area", { precision: 8, scale: 2 }),
  price: decimal("price", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["available", "booked", "pending"]).default("available").notNull(),
  positionX: int("positionX").default(0),
  positionY: int("positionY").default(0),
  width: int("width").default(1),
  height: int("height").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExhibitionUnit = typeof exhibitionUnits.$inferSelect;

export const bookingRequests = mysqlTable("booking_requests", {
  id: int("id").autoincrement().primaryKey(),
  exhibitionId: int("exhibitionId").notNull(),
  unitId: int("unitId"),
  merchantName: varchar("merchantName", { length: 255 }).notNull(),
  merchantCompany: varchar("merchantCompany", { length: 255 }),
  merchantPhone: varchar("merchantPhone", { length: 20 }),
  merchantEmail: varchar("merchantEmail", { length: 320 }),
  activityType: varchar("activityType", { length: 100 }),
  requestedAmount: decimal("requestedAmount", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  investorId: int("investorId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingRequest = typeof bookingRequests.$inferSelect;

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNumber: varchar("contractNumber", { length: 50 }).notNull(),
  exhibitionId: int("exhibitionId").notNull(),
  bookingId: int("bookingId"),
  investorId: int("investorId").notNull(),
  merchantName: varchar("merchantName", { length: 255 }).notNull(),
  merchantCompany: varchar("merchantCompany", { length: 255 }),
  unitCode: varchar("unitCode", { length: 20 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "pending_signature", "expired", "cancelled"]).default("pending_signature").notNull(),
  signedAt: timestamp("signedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  exhibitionId: int("exhibitionId").notNull(),
  investorId: int("investorId").notNull(),
  merchantName: varchar("merchantName", { length: 255 }).notNull(),
  merchantCompany: varchar("merchantCompany", { length: 255 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "credit_card", "cash", "mada"]).default("bank_transfer").notNull(),
  status: mysqlEnum("status", ["received", "pending", "refunded"]).default("pending").notNull(),
  transactionRef: varchar("transactionRef", { length: 100 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["booking", "contract", "payment", "system", "opportunity", "investment"]).default("system").notNull(),
  isRead: int("isRead").default(0),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;

// === NEW TABLES: Investment Ecosystem ===

export const investmentOpportunities = mysqlTable("investment_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  description: text("description"),
  category: mysqlEnum("category", ["retail", "food_beverage", "popup", "brand_experience", "event_partnership", "technology"]).default("retail").notNull(),
  eventName: varchar("eventName", { length: 255 }),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  requiredInvestment: decimal("requiredInvestment", { precision: 14, scale: 2 }),
  expectedRevenue: decimal("expectedRevenue", { precision: 14, scale: 2 }),
  projectedROI: decimal("projectedROI", { precision: 6, scale: 2 }),
  duration: varchar("duration", { length: 100 }),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  opportunityScore: int("opportunityScore").default(0),
  status: mysqlEnum("status", ["open", "reserved", "committed", "closed"]).default("open").notNull(),
  operatorName: varchar("operatorName", { length: 255 }),
  operatorProfile: text("operatorProfile"),
  investmentStructure: text("investmentStructure"),
  businessModel: text("businessModel"),
  visitorTraffic: int("visitorTraffic").default(0),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestmentOpportunity = typeof investmentOpportunities.$inferSelect;

export const activeInvestments = mysqlTable("active_investments", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  opportunityId: int("opportunityId"),
  title: varchar("title", { length: 255 }).notNull(),
  investmentAmount: decimal("investmentAmount", { precision: 14, scale: 2 }).notNull(),
  ownershipPercentage: decimal("ownershipPercentage", { precision: 5, scale: 2 }),
  operatorName: varchar("operatorName", { length: 255 }),
  currentRevenue: decimal("currentRevenue", { precision: 14, scale: 2 }).default("0.00"),
  profitDistributed: decimal("profitDistributed", { precision: 14, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["active", "paused", "completed", "exited"]).default("active").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  projectTimeline: text("projectTimeline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActiveInvestment = typeof activeInvestments.$inferSelect;

export const investorDocuments = mysqlTable("investor_documents", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  documentType: mysqlEnum("documentType", ["contract", "agreement", "certificate", "financial_statement", "payment_receipt", "report", "other"]).default("other").notNull(),
  fileUrl: text("fileUrl"),
  fileSize: int("fileSize"),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorDocument = typeof investorDocuments.$inferSelect;

export const investorProfiles = mysqlTable("investor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  investorType: mysqlEnum("investorType", ["individual", "company", "fund"]).default("individual").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  preferredSectors: text("preferredSectors"),
  investmentCapacity: decimal("investmentCapacity", { precision: 14, scale: 2 }),
  totalInvested: decimal("totalInvested", { precision: 14, scale: 2 }).default("0.00"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorProfile = typeof investorProfiles.$inferSelect;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isRead: int("isRead").default(0),
  senderType: mysqlEnum("senderType", ["investor", "operator", "admin"]).default("investor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// === Investor Login Flow ===

export const investorLeads = mysqlTable("investor_leads", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }),
  investmentInterest: mysqlEnum("investmentInterest", [
    "exhibitions_events",
    "real_estate",
    "food_beverage",
    "retail_brands",
    "entertainment",
    "technology",
    "general_investment"
  ]),
  region: varchar("region", { length: 100 }),
  userId: int("userId"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted"]).default("new").notNull(),
  source: varchar("source", { length: 50 }).default("investor_portal"),
  isRegistered: int("isRegistered").default(0),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorLead = typeof investorLeads.$inferSelect;
export type InsertInvestorLead = typeof investorLeads.$inferInsert;

export const otpCodes = mysqlTable("otp_codes", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: int("verified").default(0),
  attempts: int("attempts").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;

// === HubSpot CRM Sync Log ===

export const hubspotSyncLog = mysqlTable("hubspot_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  hubspotObjectType: varchar("hubspotObjectType", { length: 50 }).notNull(),
  hubspotObjectId: varchar("hubspotObjectId", { length: 100 }),
  action: varchar("action", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HubSpotSyncLogEntry = typeof hubspotSyncLog.$inferSelect;
