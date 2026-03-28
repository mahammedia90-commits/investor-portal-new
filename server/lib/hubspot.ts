/**
 * HubSpot CRM Integration Service Layer
 * ======================================
 * Professional integration with HubSpot CRM for Maham Expo Investor Portal
 * 
 * Handles:
 * - Contact management (Investors, Merchants, Sponsors)
 * - Deal management (Investment deals, Booking deals)
 * - Company management
 * - Pipeline stage tracking
 * - Lead scoring
 * - Activity logging
 */

import { ENV } from "../_core/env";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

// ============================================================
// Types
// ============================================================

export interface HubSpotContact {
  id?: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    city?: string;
    country?: string;
    jobtitle?: string;
    // Custom Maham Expo properties (stored as notes until custom props are available)
    investor_type?: string;
    investment_interest?: string;
    lead_score?: string;
    pipeline_stage?: string;
    risk_classification?: string;
    maham_portal_id?: string;
    [key: string]: string | undefined;
  };
}

export interface HubSpotDeal {
  id?: string;
  properties: {
    dealname: string;
    amount?: string;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    description?: string;
    dealtype?: string;
    // Custom
    maham_deal_type?: string;
    maham_exhibition_id?: string;
    maham_booking_id?: string;
    [key: string]: string | undefined;
  };
}

export interface HubSpotCompany {
  id?: string;
  properties: {
    name: string;
    domain?: string;
    phone?: string;
    city?: string;
    country?: string;
    industry?: string;
    description?: string;
    [key: string]: string | undefined;
  };
}

export interface HubSpotEngagement {
  type: "NOTE" | "EMAIL" | "CALL" | "MEETING" | "TASK";
  timestamp: number;
  body?: string;
  subject?: string;
}

export interface SyncResult {
  success: boolean;
  hubspotId?: string;
  error?: string;
  action: "created" | "updated" | "skipped" | "failed";
}

export interface HubSpotSyncLog {
  entityType: string;
  entityId: number;
  hubspotId: string;
  action: string;
  timestamp: Date;
  details?: string;
}

// ============================================================
// Core API Helper
// ============================================================

async function hubspotRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET",
  body?: any
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = ENV.hubspotAccessToken;
  if (!token) {
    return { data: null, error: "HUBSPOT_ACCESS_TOKEN not configured", status: 0 };
  }

  try {
    const url = `${HUBSPOT_API_BASE}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg = responseData?.message || `HTTP ${response.status}`;
      console.error(`[HubSpot] ${method} ${endpoint} failed:`, errMsg);
      return { data: null, error: errMsg, status: response.status };
    }

    return { data: responseData as T, error: null, status: response.status };
  } catch (err: any) {
    console.error(`[HubSpot] Request error:`, err.message);
    return { data: null, error: err.message, status: 0 };
  }
}

// ============================================================
// Contact Operations
// ============================================================

/**
 * Create or update a contact in HubSpot
 * Uses email as unique identifier for dedup
 */
export async function upsertContact(contact: HubSpotContact): Promise<SyncResult> {
  // First, search for existing contact by email
  if (contact.properties.email) {
    const existing = await searchContactByEmail(contact.properties.email);
    if (existing) {
      // Update existing
      const { data, error } = await hubspotRequest(
        `/crm/v3/objects/contacts/${existing.id}`,
        "PATCH",
        { properties: contact.properties }
      );
      if (error) return { success: false, error, action: "failed" };
      return { success: true, hubspotId: existing.id, action: "updated" };
    }
  }

  // Search by phone if no email match
  if (contact.properties.phone) {
    const existing = await searchContactByPhone(contact.properties.phone);
    if (existing) {
      const { data, error } = await hubspotRequest(
        `/crm/v3/objects/contacts/${existing.id}`,
        "PATCH",
        { properties: contact.properties }
      );
      if (error) return { success: false, error, action: "failed" };
      return { success: true, hubspotId: existing.id, action: "updated" };
    }
  }

  // Create new contact
  const { data, error } = await hubspotRequest<{ id: string }>(
    "/crm/v3/objects/contacts",
    "POST",
    { properties: contact.properties }
  );
  if (error) return { success: false, error, action: "failed" };
  return { success: true, hubspotId: data?.id, action: "created" };
}

export async function searchContactByEmail(email: string): Promise<{ id: string; properties: any } | null> {
  const { data } = await hubspotRequest<{ results: any[] }>(
    "/crm/v3/objects/contacts/search",
    "POST",
    {
      filterGroups: [{
        filters: [{ propertyName: "email", operator: "EQ", value: email }]
      }],
      limit: 1,
    }
  );
  return data?.results?.[0] || null;
}

export async function searchContactByPhone(phone: string): Promise<{ id: string; properties: any } | null> {
  const { data } = await hubspotRequest<{ results: any[] }>(
    "/crm/v3/objects/contacts/search",
    "POST",
    {
      filterGroups: [{
        filters: [{ propertyName: "phone", operator: "EQ", value: phone }]
      }],
      limit: 1,
    }
  );
  return data?.results?.[0] || null;
}

export async function getContact(contactId: string): Promise<HubSpotContact | null> {
  const { data } = await hubspotRequest<HubSpotContact>(
    `/crm/v3/objects/contacts/${contactId}?properties=email,firstname,lastname,phone,company,city,country,jobtitle`
  );
  return data;
}

export async function listContacts(limit = 50, after?: string): Promise<{ results: any[]; paging?: any }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  const { data } = await hubspotRequest<{ results: any[]; paging?: any }>(
    `/crm/v3/objects/contacts?${params}&properties=email,firstname,lastname,phone,company,city,jobtitle`
  );
  return data || { results: [] };
}

// ============================================================
// Deal Operations
// ============================================================

/**
 * Create a deal in HubSpot
 * Deals represent: Investment agreements, Booth bookings, Sponsorship packages
 */
export async function createDeal(deal: HubSpotDeal): Promise<SyncResult> {
  const { data, error } = await hubspotRequest<{ id: string }>(
    "/crm/v3/objects/deals",
    "POST",
    { properties: deal.properties }
  );
  if (error) return { success: false, error, action: "failed" };
  return { success: true, hubspotId: data?.id, action: "created" };
}

export async function updateDeal(dealId: string, properties: Record<string, string>): Promise<SyncResult> {
  const { data, error } = await hubspotRequest(
    `/crm/v3/objects/deals/${dealId}`,
    "PATCH",
    { properties }
  );
  if (error) return { success: false, error, action: "failed" };
  return { success: true, hubspotId: dealId, action: "updated" };
}

export async function getDeal(dealId: string): Promise<HubSpotDeal | null> {
  const { data } = await hubspotRequest<HubSpotDeal>(
    `/crm/v3/objects/deals/${dealId}?properties=dealname,amount,dealstage,pipeline,closedate,description,dealtype`
  );
  return data;
}

export async function listDeals(limit = 50, after?: string): Promise<{ results: any[]; paging?: any }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  const { data } = await hubspotRequest<{ results: any[]; paging?: any }>(
    `/crm/v3/objects/deals?${params}&properties=dealname,amount,dealstage,pipeline,closedate,dealtype`
  );
  return data || { results: [] };
}

export async function searchDeals(query: string): Promise<any[]> {
  const { data } = await hubspotRequest<{ results: any[] }>(
    "/crm/v3/objects/deals/search",
    "POST",
    { query, limit: 20, properties: ["dealname", "amount", "dealstage", "pipeline", "closedate"] }
  );
  return data?.results || [];
}

// ============================================================
// Company Operations
// ============================================================

export async function upsertCompany(company: HubSpotCompany): Promise<SyncResult> {
  // Search by name
  if (company.properties.name) {
    const { data } = await hubspotRequest<{ results: any[] }>(
      "/crm/v3/objects/companies/search",
      "POST",
      {
        filterGroups: [{
          filters: [{ propertyName: "name", operator: "EQ", value: company.properties.name }]
        }],
        limit: 1,
      }
    );
    if (data?.results?.[0]) {
      const existing = data.results[0];
      const { error } = await hubspotRequest(
        `/crm/v3/objects/companies/${existing.id}`,
        "PATCH",
        { properties: company.properties }
      );
      if (error) return { success: false, error, action: "failed" };
      return { success: true, hubspotId: existing.id, action: "updated" };
    }
  }

  const { data, error } = await hubspotRequest<{ id: string }>(
    "/crm/v3/objects/companies",
    "POST",
    { properties: company.properties }
  );
  if (error) return { success: false, error, action: "failed" };
  return { success: true, hubspotId: data?.id, action: "created" };
}

export async function listCompanies(limit = 50, after?: string): Promise<{ results: any[]; paging?: any }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  const { data } = await hubspotRequest<{ results: any[]; paging?: any }>(
    `/crm/v3/objects/companies?${params}&properties=name,domain,phone,city,country,industry`
  );
  return data || { results: [] };
}

// ============================================================
// Association Operations
// ============================================================

/**
 * Associate a contact with a deal (typeId: 4 for contact→deal)
 */
export async function associateContactToDeal(contactId: string, dealId: string): Promise<boolean> {
  const { error } = await hubspotRequest(
    `/crm/v4/objects/contacts/${contactId}/associations/deals/${dealId}`,
    "PUT",
    [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 4 }]
  );
  return !error;
}

/**
 * Associate a contact with a company (typeId: 1 for primary)
 */
export async function associateContactToCompany(contactId: string, companyId: string): Promise<boolean> {
  const { error } = await hubspotRequest(
    `/crm/v4/objects/contacts/${contactId}/associations/companies/${companyId}`,
    "PUT",
    [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 }]
  );
  return !error;
}

/**
 * Associate a deal with a company (typeId: 5 for primary)
 */
export async function associateDealToCompany(dealId: string, companyId: string): Promise<boolean> {
  const { error } = await hubspotRequest(
    `/crm/v4/objects/deals/${dealId}/associations/companies/${companyId}`,
    "PUT",
    [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 5 }]
  );
  return !error;
}

// ============================================================
// Engagement / Activity Operations
// ============================================================

export async function createNote(contactId: string, body: string): Promise<boolean> {
  const { error } = await hubspotRequest(
    "/crm/v3/objects/notes",
    "POST",
    {
      properties: {
        hs_note_body: body,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }]
      }]
    }
  );
  return !error;
}

// ============================================================
// Lead Scoring (Section 63 from V.2)
// ============================================================

export interface LeadScoreInput {
  companySize?: "large" | "medium" | "small";
  activityMatch?: boolean;
  interactions?: ("visited_site" | "requested_info" | "attended_event")[];
  budgetLevel?: "high" | "medium" | "low";
}

export function calculateLeadScore(input: LeadScoreInput): { score: number; tier: "hot" | "warm" | "cold" } {
  let score = 0;

  // Company size scoring
  if (input.companySize === "large") score += 30;
  else if (input.companySize === "medium") score += 20;
  else if (input.companySize === "small") score += 10;

  // Activity matching
  if (input.activityMatch) score += 20;
  else score += 5;

  // Interaction scoring
  if (input.interactions) {
    for (const interaction of input.interactions) {
      if (interaction === "visited_site") score += 5;
      else if (interaction === "requested_info") score += 10;
      else if (interaction === "attended_event") score += 25;
    }
  }

  // Budget scoring
  if (input.budgetLevel === "high") score += 30;
  else if (input.budgetLevel === "medium") score += 15;
  else if (input.budgetLevel === "low") score += 5;

  // Tier classification
  let tier: "hot" | "warm" | "cold";
  if (score >= 61) tier = "hot";
  else if (score >= 31) tier = "warm";
  else tier = "cold";

  return { score, tier };
}

// ============================================================
// Investor Pipeline Mapping
// ============================================================

/**
 * Maps Maham Expo investor pipeline stages to HubSpot deal stages
 * Using default HubSpot pipeline stages
 */
export const INVESTOR_PIPELINE_MAP: Record<string, string> = {
  "lead": "appointmentscheduled",       // Lead → Appointment Scheduled
  "qualified": "qualifiedtobuy",        // Qualified → Qualified to Buy
  "proposal": "presentationscheduled",  // Proposal → Presentation Scheduled
  "agreement": "decisionmakerboughtin", // Agreement → Decision Maker Bought-In
  "active": "contractsent",             // Active → Contract Sent
  "renewal": "closedwon",               // Renewal → Closed Won
};

export const MERCHANT_PIPELINE_MAP: Record<string, string> = {
  "lead": "appointmentscheduled",
  "qualified": "qualifiedtobuy",
  "proposal_sent": "presentationscheduled",
  "negotiation": "decisionmakerboughtin",
  "contract_sent": "contractsent",
  "signed": "closedwon",
  "paid": "closedwon",
  "active_tenant": "closedwon",
  "completed": "closedwon",
  "lost": "closedlost",
};

export const BOOKING_STATUS_MAP: Record<string, string> = {
  "pending": "appointmentscheduled",
  "approved": "contractsent",
  "rejected": "closedlost",
};

// ============================================================
// High-Level Sync Functions
// ============================================================

/**
 * Sync an investor lead to HubSpot as Contact + Deal
 */
export async function syncInvestorLead(lead: {
  id: number;
  phone: string;
  fullName?: string | null;
  investmentInterest?: string | null;
  region?: string | null;
  status?: string;
}): Promise<{ contactResult: SyncResult; dealResult?: SyncResult }> {
  // Parse name
  const nameParts = (lead.fullName || "").split(" ");
  const firstname = nameParts[0] || "";
  const lastname = nameParts.slice(1).join(" ") || "";

  // Create/Update Contact
  const contactResult = await upsertContact({
    properties: {
      firstname,
      lastname,
      phone: lead.phone,
      city: lead.region || undefined,
      country: "Saudi Arabia",
      jobtitle: "Investor",
      company: "Maham Expo Investor",
    },
  });

  if (!contactResult.success || !contactResult.hubspotId) {
    return { contactResult };
  }

  // Add note with investor details
  const noteBody = [
    `🏢 Maham Expo Investor Portal`,
    `📋 Portal ID: ${lead.id}`,
    `📱 Phone: ${lead.phone}`,
    `💼 Interest: ${lead.investmentInterest || "General"}`,
    `📍 Region: ${lead.region || "N/A"}`,
    `📊 Status: ${lead.status || "new"}`,
    `🔗 Source: Investor Portal Registration`,
  ].join("\n");
  await createNote(contactResult.hubspotId, noteBody);

  // Create Deal for the investor
  const dealResult = await createDeal({
    properties: {
      dealname: `Maham Expo - ${lead.fullName || lead.phone}`,
      dealstage: INVESTOR_PIPELINE_MAP[lead.status || "lead"] || "appointmentscheduled",
      amount: "0",
      description: `Investor from Maham Expo Portal. Interest: ${lead.investmentInterest || "General"}. Region: ${lead.region || "N/A"}`,
      dealtype: "newbusiness",
    },
  });

  // Associate contact with deal
  if (dealResult.success && dealResult.hubspotId && contactResult.hubspotId) {
    await associateContactToDeal(contactResult.hubspotId, dealResult.hubspotId);
  }

  return { contactResult, dealResult };
}

/**
 * Sync a booking request to HubSpot as a Deal
 */
export async function syncBookingToDeal(booking: {
  id: number;
  merchantName: string;
  merchantCompany?: string | null;
  merchantPhone?: string | null;
  merchantEmail?: string | null;
  activityType?: string | null;
  requestedAmount?: string | null;
  status: string;
  exhibitionId: number;
}): Promise<{ contactResult: SyncResult; dealResult: SyncResult }> {
  // Upsert merchant as contact
  const nameParts = booking.merchantName.split(" ");
  const contactResult = await upsertContact({
    properties: {
      firstname: nameParts[0] || "",
      lastname: nameParts.slice(1).join(" ") || "",
      phone: booking.merchantPhone || undefined,
      email: booking.merchantEmail || undefined,
      company: booking.merchantCompany || undefined,
      jobtitle: "Merchant",
      country: "Saudi Arabia",
    },
  });

  // Create deal for booking
  const dealResult = await createDeal({
    properties: {
      dealname: `Booth Booking - ${booking.merchantName} (#${booking.id})`,
      amount: booking.requestedAmount || "0",
      dealstage: BOOKING_STATUS_MAP[booking.status] || "appointmentscheduled",
      description: `Booth booking for Exhibition #${booking.exhibitionId}. Activity: ${booking.activityType || "N/A"}. Company: ${booking.merchantCompany || "N/A"}`,
      dealtype: "newbusiness",
    },
  });

  // Associate
  if (contactResult.success && dealResult.success && contactResult.hubspotId && dealResult.hubspotId) {
    await associateContactToDeal(contactResult.hubspotId, dealResult.hubspotId);
  }

  return { contactResult, dealResult };
}

/**
 * Sync a contract to HubSpot as a Deal update
 */
export async function syncContractToDeal(contract: {
  id: number;
  contractNumber: string;
  merchantName: string;
  merchantCompany?: string | null;
  amount: string;
  status: string;
  exhibitionId: number;
}): Promise<SyncResult> {
  const stageMap: Record<string, string> = {
    "pending_signature": "contractsent",
    "active": "closedwon",
    "expired": "closedlost",
    "cancelled": "closedlost",
  };

  return createDeal({
    properties: {
      dealname: `Contract ${contract.contractNumber} - ${contract.merchantName}`,
      amount: contract.amount,
      dealstage: stageMap[contract.status] || "contractsent",
      description: `Contract #${contract.contractNumber} for Exhibition #${contract.exhibitionId}. Company: ${contract.merchantCompany || "N/A"}`,
      dealtype: "newbusiness",
    },
  });
}

/**
 * Update deal stage when booking status changes
 */
export async function syncBookingStatusChange(
  hubspotDealId: string,
  newStatus: string
): Promise<SyncResult> {
  const newStage = BOOKING_STATUS_MAP[newStatus] || "appointmentscheduled";
  return updateDeal(hubspotDealId, { dealstage: newStage });
}

// ============================================================
// Health Check
// ============================================================

export async function checkHubSpotConnection(): Promise<{
  connected: boolean;
  hubId?: number;
  scopes?: string[];
  error?: string;
}> {
  if (!ENV.hubspotAccessToken) {
    return { connected: false, error: "HUBSPOT_ACCESS_TOKEN not configured" };
  }

  const { data, error } = await hubspotRequest<{
    hubId: number;
    scopes: string[];
    userId: number;
  }>("/oauth/v1/access-tokens/" + ENV.hubspotAccessToken);

  if (error) {
    return { connected: false, error };
  }

  return {
    connected: true,
    hubId: data?.hubId,
    scopes: data?.scopes,
  };
}

// ============================================================
// Bulk Sync
// ============================================================

export async function bulkSyncContacts(contacts: HubSpotContact[]): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  // Process in batches of 10 to avoid rate limits
  for (let i = 0; i < contacts.length; i += 10) {
    const batch = contacts.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(c => upsertContact(c)));
    results.push(...batchResults);
    // Small delay between batches
    if (i + 10 < contacts.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return results;
}

export async function getCRMStats(): Promise<{
  totalContacts: number;
  totalDeals: number;
  totalCompanies: number;
  recentContacts: any[];
  recentDeals: any[];
}> {
  const [contacts, deals, companies] = await Promise.all([
    listContacts(5),
    listDeals(5),
    listCompanies(5),
  ]);

  return {
    totalContacts: contacts.results.length,
    totalDeals: deals.results.length,
    totalCompanies: companies.results.length,
    recentContacts: contacts.results,
    recentDeals: deals.results,
  };
}
