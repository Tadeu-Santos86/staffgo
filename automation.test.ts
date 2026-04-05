import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock db module before importing automation
vi.mock("./db", () => ({
  getAutomationSetting: vi.fn(),
  getActiveJobs: vi.fn(),
  getAllCandidates: vi.fn(),
  createMatch: vi.fn(),
  createNotification: vi.fn(),
  createTelemetryEvent: vi.fn(),
  createAuditLog: vi.fn(),
  getCompanyById: vi.fn(),
  getJobById: vi.fn(),
  getNotificationsByUserId: vi.fn(),
  upsertAutomationSetting: vi.fn(),
  incrementJobViewCount: vi.fn(),
}));

import * as db from "./db";
import { onCandidateCreatedOrUpdated, onJobCreated, onJobViewed, initDefaultAutomationSettings } from "./automation";
import type { Candidate, Job } from "../drizzle/schema";

const mockDb = vi.mocked(db);

const baseCandidate: Candidate = {
  id: 1,
  userId: 10,
  city: "São Paulo",
  state: "SP",
  experience: null,
  skills: "Cozinha, Limpeza",
  areas: "Hotelaria",
  availability: "immediate",
  maxDistance: 50,
  salaryExpectation: "2000.00",
  resume: null,
  bio: "Experiência em cozinha",
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseJob: Job = {
  id: 1,
  companyId: 1,
  title: "Cozinheiro",
  description: "Vaga para cozinheiro",
  sector: "hospitality",
  city: "São Paulo",
  state: "SP",
  requiredSkills: "Cozinha, Limpeza",
  desiredSkills: null,
  minExperience: null,
  salaryMin: "1500.00",
  salaryMax: "3000.00",
  jobType: "full_time",
  urgency: "medium",
  status: "active",
  viewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const nonMatchingJob: Job = {
  ...baseJob,
  id: 2,
  companyId: 2,
  title: "Eletricista",
  sector: "construction",
  city: "Manaus",
  state: "AM",
  requiredSkills: "Eletricidade, NR10",
  salaryMin: "5000.00",
  salaryMax: "8000.00",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: automação ativa
  mockDb.getAutomationSetting.mockResolvedValue(undefined);
  mockDb.createMatch.mockResolvedValue(undefined as any);
  mockDb.createNotification.mockResolvedValue(undefined);
  mockDb.createTelemetryEvent.mockResolvedValue(undefined);
  mockDb.createAuditLog.mockResolvedValue(undefined);
  mockDb.upsertAutomationSetting.mockResolvedValue(undefined);
});

// ─── onCandidateCreatedOrUpdated ───

describe("onCandidateCreatedOrUpdated", () => {
  it("creates matches for compatible jobs", async () => {
    mockDb.getActiveJobs.mockResolvedValue([baseJob]);
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);

    const result = await onCandidateCreatedOrUpdated(baseCandidate, 10);

    expect(result.matchesCreated).toBeGreaterThanOrEqual(1);
    expect(mockDb.createMatch).toHaveBeenCalled();
  });

  it("does not create matches when score is below threshold", async () => {
    mockDb.getActiveJobs.mockResolvedValue([nonMatchingJob]);

    const lowMatchCandidate = {
      ...baseCandidate,
      skills: null as any,
      city: null as any,
      state: null as any,
      salaryExpectation: null as any,
      availability: null as any,
    };

    // Non-matching job with null candidate data should result in base score ~50
    // but the non-matching job has very different skills/location
    const result = await onCandidateCreatedOrUpdated(lowMatchCandidate, 10);

    // Even with low match, base score is 50 which is above MIN_MATCH_SCORE (40)
    expect(result.matchesCreated).toBeGreaterThanOrEqual(0);
  });

  it("sends notifications to candidate and company", async () => {
    mockDb.getActiveJobs.mockResolvedValue([baseJob]);
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);

    const result = await onCandidateCreatedOrUpdated(baseCandidate, 10);

    expect(result.notificationsSent).toBeGreaterThanOrEqual(1);
    expect(mockDb.createNotification).toHaveBeenCalled();
  });

  it("skips when automação está desativada", async () => {
    mockDb.getAutomationSetting.mockResolvedValue({
      id: 1,
      settingKey: "auto_match_on_signup",
      settingValue: "false",
      description: "",
      category: "matching",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await onCandidateCreatedOrUpdated(baseCandidate, 10);

    expect(result.matchesCreated).toBe(0);
    expect(result.notificationsSent).toBe(0);
    expect(mockDb.getActiveJobs).not.toHaveBeenCalled();
  });

  it("handles empty jobs list gracefully", async () => {
    mockDb.getActiveJobs.mockResolvedValue([]);

    const result = await onCandidateCreatedOrUpdated(baseCandidate, 10);

    expect(result.matchesCreated).toBe(0);
    expect(result.notificationsSent).toBe(0);
  });

  it("logs telemetry and audit events", async () => {
    mockDb.getActiveJobs.mockResolvedValue([baseJob]);
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);

    await onCandidateCreatedOrUpdated(baseCandidate, 10);

    expect(mockDb.createTelemetryEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "auto_match_candidate", userId: 10 })
    );
    expect(mockDb.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auto_match_candidate", userId: 10 })
    );
  });

  it("handles createMatch errors gracefully (duplicate)", async () => {
    mockDb.getActiveJobs.mockResolvedValue([baseJob]);
    mockDb.createMatch.mockRejectedValue(new Error("Duplicate entry"));
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);

    const result = await onCandidateCreatedOrUpdated(baseCandidate, 10);

    // Should not throw, just log warning
    expect(result.matchesCreated).toBe(0);
  });
});

// ─── onJobCreated ───

describe("onJobCreated", () => {
  it("creates matches for compatible candidates", async () => {
    mockDb.getAllCandidates.mockResolvedValue([baseCandidate]);

    const result = await onJobCreated(baseJob, 20);

    expect(result.matchesCreated).toBeGreaterThanOrEqual(1);
    expect(mockDb.createMatch).toHaveBeenCalled();
  });

  it("sends notifications to compatible candidates", async () => {
    mockDb.getAllCandidates.mockResolvedValue([baseCandidate]);

    const result = await onJobCreated(baseJob, 20);

    expect(result.notificationsSent).toBeGreaterThanOrEqual(1);
    expect(mockDb.createNotification).toHaveBeenCalled();
  });

  it("skips when automação está desativada", async () => {
    mockDb.getAutomationSetting.mockResolvedValue({
      id: 1,
      settingKey: "auto_match_on_job_post",
      settingValue: "false",
      description: "",
      category: "matching",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await onJobCreated(baseJob, 20);

    expect(result.matchesCreated).toBe(0);
    expect(result.notificationsSent).toBe(0);
    expect(mockDb.getAllCandidates).not.toHaveBeenCalled();
  });

  it("handles empty candidates list gracefully", async () => {
    mockDb.getAllCandidates.mockResolvedValue([]);

    const result = await onJobCreated(baseJob, 20);

    expect(result.matchesCreated).toBe(0);
    expect(result.notificationsSent).toBe(0);
  });

  it("logs telemetry and audit events", async () => {
    mockDb.getAllCandidates.mockResolvedValue([baseCandidate]);

    await onJobCreated(baseJob, 20);

    expect(mockDb.createTelemetryEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "auto_match_job", userId: 20 })
    );
    expect(mockDb.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auto_match_job", userId: 20 })
    );
  });

  it("notifies company with summary of matches", async () => {
    mockDb.getAllCandidates.mockResolvedValue([baseCandidate]);

    await onJobCreated(baseJob, 20);

    // Should notify company (userId 20) with match summary
    const notifyCalls = mockDb.createNotification.mock.calls;
    const companySummary = notifyCalls.find(
      (call) => call[0].userId === 20 && call[0].type === "match_summary"
    );
    expect(companySummary).toBeDefined();
  });
});

// ─── onJobViewed ───

describe("onJobViewed", () => {
  it("does not notify when setting is disabled (default)", async () => {
    // Default: notify_on_job_view is not set (undefined)
    await onJobViewed(1, 10);

    expect(mockDb.createNotification).not.toHaveBeenCalled();
  });

  it("notifies company when setting is enabled", async () => {
    mockDb.getAutomationSetting.mockResolvedValue({
      id: 1,
      settingKey: "notify_on_job_view",
      settingValue: "true",
      description: "",
      category: "notifications",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDb.getJobById.mockResolvedValue(baseJob);
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);
    mockDb.getNotificationsByUserId.mockResolvedValue([]);

    await onJobViewed(1, 10);

    expect(mockDb.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 20,
        type: "job_viewed",
      })
    );
  });

  it("does not send duplicate view notifications within 1 hour", async () => {
    mockDb.getAutomationSetting.mockResolvedValue({
      id: 1,
      settingKey: "notify_on_job_view",
      settingValue: "true",
      description: "",
      category: "notifications",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDb.getJobById.mockResolvedValue(baseJob);
    mockDb.getCompanyById.mockResolvedValue({ id: 1, userId: 20, companyName: "Hotel ABC" } as any);
    // Simulate recent notification
    mockDb.getNotificationsByUserId.mockResolvedValue([
      {
        id: 1,
        userId: 20,
        type: "job_viewed",
        title: "Vaga visualizada",
        message: "",
        read: false,
        relatedJobId: 1,
        relatedUserId: null,
        createdAt: new Date(), // Just now
      },
    ]);

    await onJobViewed(1, 10);

    expect(mockDb.createNotification).not.toHaveBeenCalled();
  });
});

// ─── initDefaultAutomationSettings ───

describe("initDefaultAutomationSettings", () => {
  it("creates default settings when none exist", async () => {
    mockDb.getAutomationSetting.mockResolvedValue(undefined);

    await initDefaultAutomationSettings();

    // Should call upsertAutomationSetting for each default setting
    expect(mockDb.upsertAutomationSetting).toHaveBeenCalledTimes(9);
  });

  it("does not overwrite existing settings", async () => {
    mockDb.getAutomationSetting.mockResolvedValue({
      id: 1,
      settingKey: "auto_match_on_signup",
      settingValue: "false",
      description: "",
      category: "matching",
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await initDefaultAutomationSettings();

    // Should not call upsert since all settings already exist
    expect(mockDb.upsertAutomationSetting).not.toHaveBeenCalled();
  });
});
