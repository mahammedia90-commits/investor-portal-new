import { describe, expect, it, vi, beforeEach } from "vitest";
import { calculateLeadScore, INVESTOR_PIPELINE_MAP, MERCHANT_PIPELINE_MAP, BOOKING_STATUS_MAP } from "./lib/hubspot";

describe("HubSpot Integration", () => {
  describe("Lead Scoring", () => {
    it("scores a hot lead correctly (large company + high budget + attended event)", () => {
      const result = calculateLeadScore({
        companySize: "large",
        activityMatch: true,
        interactions: ["attended_event", "requested_info"],
        budgetLevel: "high",
      });
      expect(result.score).toBeGreaterThanOrEqual(61);
      expect(result.tier).toBe("hot");
    });

    it("scores a warm lead correctly (medium company + medium budget)", () => {
      const result = calculateLeadScore({
        companySize: "medium",
        activityMatch: true,
        interactions: ["visited_site"],
        budgetLevel: "medium",
      });
      expect(result.score).toBeGreaterThanOrEqual(31);
      expect(result.score).toBeLessThan(61);
      expect(result.tier).toBe("warm");
    });

    it("scores a cold lead correctly (small company + low budget + no interactions)", () => {
      const result = calculateLeadScore({
        companySize: "small",
        activityMatch: false,
        interactions: [],
        budgetLevel: "low",
      });
      expect(result.score).toBeLessThan(31);
      expect(result.tier).toBe("cold");
    });

    it("handles empty input gracefully", () => {
      const result = calculateLeadScore({});
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(["hot", "warm", "cold"]).toContain(result.tier);
    });

    it("accumulates interaction scores correctly", () => {
      const noInteractions = calculateLeadScore({ interactions: [] });
      const withVisit = calculateLeadScore({ interactions: ["visited_site"] });
      const withInfo = calculateLeadScore({ interactions: ["requested_info"] });
      const withEvent = calculateLeadScore({ interactions: ["attended_event"] });

      expect(withVisit.score).toBe(noInteractions.score + 5);
      expect(withInfo.score).toBe(noInteractions.score + 10);
      expect(withEvent.score).toBe(noInteractions.score + 25);
    });

    it("stacks multiple interactions", () => {
      const all = calculateLeadScore({
        interactions: ["visited_site", "requested_info", "attended_event"],
      });
      const none = calculateLeadScore({ interactions: [] });
      expect(all.score).toBe(none.score + 5 + 10 + 25);
    });
  });

  describe("Pipeline Mappings", () => {
    it("maps investor pipeline stages correctly", () => {
      expect(INVESTOR_PIPELINE_MAP["lead"]).toBe("appointmentscheduled");
      expect(INVESTOR_PIPELINE_MAP["qualified"]).toBe("qualifiedtobuy");
      expect(INVESTOR_PIPELINE_MAP["proposal"]).toBe("presentationscheduled");
      expect(INVESTOR_PIPELINE_MAP["agreement"]).toBe("decisionmakerboughtin");
      expect(INVESTOR_PIPELINE_MAP["active"]).toBe("contractsent");
      expect(INVESTOR_PIPELINE_MAP["renewal"]).toBe("closedwon");
    });

    it("maps merchant pipeline stages correctly", () => {
      expect(MERCHANT_PIPELINE_MAP["lead"]).toBe("appointmentscheduled");
      expect(MERCHANT_PIPELINE_MAP["signed"]).toBe("closedwon");
      expect(MERCHANT_PIPELINE_MAP["lost"]).toBe("closedlost");
    });

    it("maps booking statuses to deal stages", () => {
      expect(BOOKING_STATUS_MAP["pending"]).toBe("appointmentscheduled");
      expect(BOOKING_STATUS_MAP["approved"]).toBe("contractsent");
      expect(BOOKING_STATUS_MAP["rejected"]).toBe("closedlost");
    });

    it("covers all expected investor stages", () => {
      const expectedStages = ["lead", "qualified", "proposal", "agreement", "active", "renewal"];
      for (const stage of expectedStages) {
        expect(INVESTOR_PIPELINE_MAP[stage]).toBeDefined();
      }
    });

    it("covers all expected booking statuses", () => {
      const expectedStatuses = ["pending", "approved", "rejected"];
      for (const status of expectedStatuses) {
        expect(BOOKING_STATUS_MAP[status]).toBeDefined();
      }
    });
  });

  describe("HubSpot Service Types", () => {
    it("exports the correct pipeline map structure", () => {
      expect(typeof INVESTOR_PIPELINE_MAP).toBe("object");
      expect(typeof MERCHANT_PIPELINE_MAP).toBe("object");
      expect(typeof BOOKING_STATUS_MAP).toBe("object");
    });

    it("all pipeline values are valid HubSpot deal stages", () => {
      const validStages = [
        "appointmentscheduled",
        "qualifiedtobuy",
        "presentationscheduled",
        "decisionmakerboughtin",
        "contractsent",
        "closedwon",
        "closedlost",
      ];

      for (const stage of Object.values(INVESTOR_PIPELINE_MAP)) {
        expect(validStages).toContain(stage);
      }
      for (const stage of Object.values(MERCHANT_PIPELINE_MAP)) {
        expect(validStages).toContain(stage);
      }
      for (const stage of Object.values(BOOKING_STATUS_MAP)) {
        expect(validStages).toContain(stage);
      }
    });
  });
});
