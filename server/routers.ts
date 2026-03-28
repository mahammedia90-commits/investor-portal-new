import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import * as db from "./db";
import * as hubspot from "./lib/hubspot";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
  }),

  exhibitions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getExhibitionsByInvestor(ctx.user.id);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getExhibitionById(input.id);
    }),
    units: protectedProcedure.input(z.object({ exhibitionId: z.number() })).query(async ({ input }) => {
      return db.getExhibitionUnits(input.exhibitionId);
    }),
  }),

  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getBookingsByInvestor(ctx.user.id);
    }),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected"]) })).mutation(async ({ input }) => {
      await db.updateBookingStatus(input.id, input.status);

      // Auto-sync booking status change to HubSpot
      try {
        const bookings = await db.getAllBookings();
        const booking = bookings.find(b => b.id === input.id);
        if (booking) {
          const result = await hubspot.syncBookingToDeal(booking as any);
          await db.logHubSpotSync({
            entityType: "booking",
            entityId: booking.id,
            hubspotObjectType: "deal",
            hubspotObjectId: result.dealResult.hubspotId || null,
            action: result.dealResult.action,
            status: result.dealResult.success ? "success" : "failed",
            errorMessage: result.dealResult.error || null,
          });
          console.log(`[HubSpot] Auto-synced booking #${booking.id} status → ${input.status}`);
        }
      } catch (err: any) {
        console.error(`[HubSpot] Auto-sync failed for booking #${input.id}:`, err.message);
      }

      return { success: true };
    }),
  }),

  contracts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getContractsByInvestor(ctx.user.id);
    }),
    sign: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.signContract(input.id);

      // Auto-sync contract signing to HubSpot
      try {
        const allContracts = await db.getAllContracts();
        const contract = allContracts.find(c => c.id === input.id);
        if (contract) {
          const result = await hubspot.syncContractToDeal({
            id: contract.id,
            contractNumber: contract.contractNumber,
            merchantName: contract.merchantName,
            merchantCompany: contract.merchantCompany,
            amount: String(contract.amount),
            status: "active",
            exhibitionId: contract.exhibitionId,
          });
          await db.logHubSpotSync({
            entityType: "contract",
            entityId: contract.id,
            hubspotObjectType: "deal",
            hubspotObjectId: result.hubspotId || null,
            action: result.action,
            status: result.success ? "success" : "failed",
            errorMessage: result.error || null,
          });
          console.log(`[HubSpot] Auto-synced contract #${contract.contractNumber} → Deal`);
        }
      } catch (err: any) {
        console.error(`[HubSpot] Auto-sync failed for contract #${input.id}:`, err.message);
      }

      return { success: true };
    }),
  }),

  payments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPaymentsByInvestor(ctx.user.id);
    }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUser(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markNotificationRead(input.id);
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // === NEW: Investment Opportunities Marketplace ===
  opportunities: router({
    list: protectedProcedure.input(z.object({ category: z.string().optional(), riskLevel: z.string().optional() }).optional()).query(async ({ input }) => {
      return db.getOpportunities(input ?? undefined);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getOpportunityById(input.id);
    }),
  }),

  // === NEW: Portfolio (Active Investments) ===
  portfolio: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPortfolioByInvestor(ctx.user.id);
    }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getPortfolioStats(ctx.user.id);
    }),
  }),

  // === NEW: Investor Documents ===
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getDocumentsByInvestor(ctx.user.id);
    }),
  }),

  // === NEW: Investor Profile ===
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getInvestorProfile(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      investorType: z.enum(["individual", "company", "fund"]).optional(),
      companyName: z.string().optional(),
      preferredSectors: z.string().optional(),
      investmentCapacity: z.string().optional(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.upsertInvestorProfile(ctx.user.id, input as any);
      return { success: true };
    }),
  }),

  // === NEW: Messages ===
  // === Investor Login Flow (OTP + Registration) ===
  investorAuth: router({
    sendOtp: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
    })).mutation(async ({ input }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await db.createOtp(input.phone, code);
      // TODO: Integrate real SMS API — for now OTP is stored in DB
      // In demo mode, we return a hint
      console.log(`[OTP] Code for ${input.phone}: ${code}`);
      return { success: true, demo: true, hint: code };
    }),

    verifyOtp: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
      code: z.string().length(6),
    })).mutation(async ({ input }) => {
      const valid = await db.verifyOtp(input.phone, input.code);
      if (!valid) return { success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' };
      // Check if investor already registered
      const lead = await db.getInvestorLeadByPhone(input.phone);
      return {
        success: true,
        isRegistered: lead?.isRegistered === 1,
        leadData: lead ? { fullName: lead.fullName, investmentInterest: lead.investmentInterest, region: lead.region } : null,
      };
    }),

    // Demo bypass — skip OTP when API not connected
    demoBypass: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
    })).mutation(async ({ input }) => {
      const lead = await db.getInvestorLeadByPhone(input.phone);
      return {
        success: true,
        isRegistered: lead?.isRegistered === 1,
        leadData: lead ? { fullName: lead.fullName, investmentInterest: lead.investmentInterest, region: lead.region } : null,
      };
    }),

    register: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
      fullName: z.string().min(2).max(255),
      investmentInterest: z.enum([
        'exhibitions_events',
        'real_estate',
        'food_beverage',
        'retail_brands',
        'entertainment',
        'technology',
        'general_investment',
      ]),
      region: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const lead = await db.createInvestorLead(input);

      // Auto-sync to HubSpot CRM
      if (lead && lead.id) {
        try {
          const syncResult = await hubspot.syncInvestorLead({
            id: lead.id,
            phone: input.phone,
            fullName: input.fullName,
            investmentInterest: input.investmentInterest,
            region: input.region || null,
            status: "new",
          });
          await db.logHubSpotSync({
            entityType: "investor_lead",
            entityId: lead.id,
            hubspotObjectType: "contact",
            hubspotObjectId: syncResult.contactResult.hubspotId || null,
            action: syncResult.contactResult.action,
            status: syncResult.contactResult.success ? "success" : "failed",
            errorMessage: syncResult.contactResult.error || null,
          });
          console.log(`[HubSpot] Auto-synced investor lead #${lead.id} → Contact ${syncResult.contactResult.hubspotId}`);
        } catch (err: any) {
          console.error(`[HubSpot] Auto-sync failed for lead #${lead.id}:`, err.message);
        }
      }

      // Create/find user in users table and set session cookie
      const openId = `investor_${input.phone}`;
      await db.upsertUser({
        openId,
        name: input.fullName,
        loginMethod: "otp",
        lastSignedIn: new Date(),
        role: "investor",
        phone: input.phone,
      });
      const token = await sdk.createSessionToken(openId, { name: input.fullName });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, lead };
    }),

    // Login existing investor (update last login)
    login: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
    })).mutation(async ({ input, ctx }) => {
      await db.updateInvestorLeadLogin(input.phone);
      const lead = await db.getInvestorLeadByPhone(input.phone);

      // Set session cookie
      const openId = `investor_${input.phone}`;
      const userName = lead?.fullName || input.phone;
      await db.upsertUser({
        openId,
        name: userName,
        loginMethod: "otp",
        lastSignedIn: new Date(),
        role: "investor",
        phone: input.phone,
      });
      const token = await sdk.createSessionToken(openId, { name: userName });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, lead };
    }),
  }),

  // === HubSpot CRM Integration ===
  hubspotCRM: router({
    // Connection health check
    status: protectedProcedure.query(async () => {
      const connection = await hubspot.checkHubSpotConnection();
      const syncStats = await db.getHubSpotSyncStats();
      return { connection, syncStats };
    }),

    // List contacts from HubSpot
    contacts: protectedProcedure.input(z.object({ limit: z.number().optional(), after: z.string().optional() }).optional()).query(async ({ input }) => {
      return hubspot.listContacts(input?.limit || 50, input?.after);
    }),

    // List deals from HubSpot
    deals: protectedProcedure.input(z.object({ limit: z.number().optional(), after: z.string().optional() }).optional()).query(async ({ input }) => {
      return hubspot.listDeals(input?.limit || 50, input?.after);
    }),

    // List companies from HubSpot
    companies: protectedProcedure.input(z.object({ limit: z.number().optional(), after: z.string().optional() }).optional()).query(async ({ input }) => {
      return hubspot.listCompanies(input?.limit || 50, input?.after);
    }),

    // Search deals
    searchDeals: protectedProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
      return hubspot.searchDeals(input.query);
    }),

    // Get sync logs
    syncLogs: protectedProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(async ({ input }) => {
      return db.getHubSpotSyncLogs(input?.limit || 50);
    }),

    // Get CRM overview stats
    crmStats: protectedProcedure.query(async () => {
      return hubspot.getCRMStats();
    }),

    // Manual sync: Push a single investor lead to HubSpot
    syncInvestorLead: protectedProcedure.input(z.object({ leadId: z.number() })).mutation(async ({ input }) => {
      const leads = await db.getAllInvestorLeads();
      const lead = leads.find(l => l.id === input.leadId);
      if (!lead) return { success: false, error: "Lead not found" };

      const result = await hubspot.syncInvestorLead(lead);

      // Log sync
      await db.logHubSpotSync({
        entityType: "investor_lead",
        entityId: lead.id,
        hubspotObjectType: "contact",
        hubspotObjectId: result.contactResult.hubspotId || null,
        action: result.contactResult.action,
        status: result.contactResult.success ? "success" : "failed",
        errorMessage: result.contactResult.error || null,
      });

      if (result.dealResult) {
        await db.logHubSpotSync({
          entityType: "investor_lead",
          entityId: lead.id,
          hubspotObjectType: "deal",
          hubspotObjectId: result.dealResult.hubspotId || null,
          action: result.dealResult.action,
          status: result.dealResult.success ? "success" : "failed",
          errorMessage: result.dealResult.error || null,
        });
      }

      return result;
    }),

    // Manual sync: Push a booking to HubSpot
    syncBooking: protectedProcedure.input(z.object({ bookingId: z.number() })).mutation(async ({ input }) => {
      const bookings = await db.getAllBookings();
      const booking = bookings.find(b => b.id === input.bookingId);
      if (!booking) return { success: false, error: "Booking not found" };

      const result = await hubspot.syncBookingToDeal(booking as any);

      await db.logHubSpotSync({
        entityType: "booking",
        entityId: booking.id,
        hubspotObjectType: "deal",
        hubspotObjectId: result.dealResult.hubspotId || null,
        action: result.dealResult.action,
        status: result.dealResult.success ? "success" : "failed",
        errorMessage: result.dealResult.error || null,
      });

      return result;
    }),

    // Bulk sync all investor leads
    bulkSyncLeads: protectedProcedure.mutation(async () => {
      const leads = await db.getAllInvestorLeads();
      const results: { leadId: number; success: boolean; error?: string }[] = [];

      for (const lead of leads) {
        try {
          const result = await hubspot.syncInvestorLead(lead);
          await db.logHubSpotSync({
            entityType: "investor_lead",
            entityId: lead.id,
            hubspotObjectType: "contact",
            hubspotObjectId: result.contactResult.hubspotId || null,
            action: result.contactResult.action,
            status: result.contactResult.success ? "success" : "failed",
            errorMessage: result.contactResult.error || null,
          });
          results.push({ leadId: lead.id, success: result.contactResult.success, error: result.contactResult.error || undefined });
        } catch (err: any) {
          results.push({ leadId: lead.id, success: false, error: err.message });
        }
      }

      return { total: leads.length, synced: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results };
    }),

    // Bulk sync all bookings
    bulkSyncBookings: protectedProcedure.mutation(async () => {
      const bookings = await db.getAllBookings();
      const results: { bookingId: number; success: boolean; error?: string }[] = [];

      for (const booking of bookings) {
        try {
          const result = await hubspot.syncBookingToDeal(booking as any);
          await db.logHubSpotSync({
            entityType: "booking",
            entityId: booking.id,
            hubspotObjectType: "deal",
            hubspotObjectId: result.dealResult.hubspotId || null,
            action: result.dealResult.action,
            status: result.dealResult.success ? "success" : "failed",
            errorMessage: result.dealResult.error || null,
          });
          results.push({ bookingId: booking.id, success: result.dealResult.success, error: result.dealResult.error || undefined });
        } catch (err: any) {
          results.push({ bookingId: booking.id, success: false, error: err.message });
        }
      }

      return { total: bookings.length, synced: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results };
    }),

    // Calculate lead score
    calculateLeadScore: protectedProcedure.input(z.object({
      companySize: z.enum(["large", "medium", "small"]).optional(),
      activityMatch: z.boolean().optional(),
      interactions: z.array(z.enum(["visited_site", "requested_info", "attended_event"])).optional(),
      budgetLevel: z.enum(["high", "medium", "low"]).optional(),
    })).query(async ({ input }) => {
      return hubspot.calculateLeadScore(input);
    }),
  }),

  messages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getMessagesByUser(ctx.user.id);
    }),
    send: protectedProcedure.input(z.object({
      receiverId: z.number(),
      subject: z.string(),
      content: z.string(),
    })).mutation(async ({ ctx, input }) => {
      await db.sendMessage(ctx.user.id, input.receiverId, input.subject, input.content);
      return { success: true };
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markMessageRead(input.id);
      return { success: true };
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadMessageCount(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
