import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  userType: mysqlEnum("userType", ["candidate", "company", "admin"]).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => [index("idx_userType").on(table.userType)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Candidate profile table
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  experience: text("experience"),
  skills: text("skills"),
  areas: text("areas"),
  availability: mysqlEnum("availability", ["immediate", "2weeks", "1month", "flexible"]),
  maxDistance: int("maxDistance"),
  salaryExpectation: decimal("salaryExpectation", { precision: 10, scale: 2 }),
  resume: text("resume"),
  bio: text("bio"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_userId_candidate").on(table.userId)]);

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

/**
 * Company profile table with institutional profile fields
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  sector: mysqlEnum("sector", ["hospitality", "construction", "retail", "supermarket", "other"]),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  // Institutional profile fields
  institutionalDescription: text("institutionalDescription"),
  workEnvironment: text("workEnvironment"),
  culture: text("culture"),
  benefits: text("benefits"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  coverImageUrl: varchar("coverImageUrl", { length: 500 }),
  employeeCount: varchar("employeeCount", { length: 50 }),
  foundedYear: int("foundedYear"),
  planId: int("planId"),
  verified: boolean("verified").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_userId_company").on(table.userId)]);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Job listings table
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sector: mysqlEnum("sector", ["hospitality", "construction", "retail", "supermarket", "other"]),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  requiredSkills: text("requiredSkills"),
  desiredSkills: text("desiredSkills"),
  minExperience: int("minExperience"),
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  jobType: mysqlEnum("jobType", ["full_time", "part_time", "temporary", "contract"]),
  urgency: mysqlEnum("urgency", ["low", "medium", "high", "critical"]),
  status: mysqlEnum("status", ["active", "paused", "closed"]).default("active"),
  viewCount: int("viewCount").default(0),
  applicationCount: int("applicationCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_companyId").on(table.companyId), index("idx_status").on(table.status)]);

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * External jobs aggregated from LinkedIn, OLX, Facebook, etc.
 */
export const externalJobs = mysqlTable("externalJobs", {
  id: int("id").autoincrement().primaryKey(),
  source: mysqlEnum("source", ["linkedin", "olx", "facebook", "indeed", "catho", "infojobs", "other"]).notNull(),
  externalId: varchar("externalId", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  description: text("description"),
  sector: mysqlEnum("sector", ["hospitality", "construction", "retail", "supermarket", "other"]),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  jobType: varchar("jobType", { length: 50 }),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  active: boolean("active").default(true),
  lastScrapedAt: timestamp("lastScrapedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_source").on(table.source),
  index("idx_sector_ext").on(table.sector),
  index("idx_active_ext").on(table.active),
]);

export type ExternalJob = typeof externalJobs.$inferSelect;
export type InsertExternalJob = typeof externalJobs.$inferInsert;

/**
 * Applications table
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  candidateId: int("candidateId").notNull(),
  status: mysqlEnum("status", ["applied", "viewed", "shortlisted", "rejected", "hired"]).default("applied"),
  compatibilityScore: decimal("compatibilityScore", { precision: 5, scale: 2 }),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("idx_jobId").on(table.jobId), index("idx_candidateId").on(table.candidateId)]);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Matches table
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  candidateId: int("candidateId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  viewed: boolean("viewed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("idx_jobId_match").on(table.jobId), index("idx_candidateId_match").on(table.candidateId)]);

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Plans table
 */
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default('0'),
  maxJobsPerMonth: int("maxJobsPerMonth"),
  maxFeaturedJobs: int("maxFeaturedJobs"),
  advancedFilters: boolean("advancedFilters").default(false),
  aiMatching: boolean("aiMatching").default(false),
  supportLevel: mysqlEnum("supportLevel", ["none", "email", "priority"]),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("idx_active").on(table.active)]);

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * Subscriptions table
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("idx_companyId_sub").on(table.companyId)]);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Telemetry / Analytics events table
 * Tracks views, clicks, applications, etc.
 */
export const telemetryEvents = mysqlTable("telemetryEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "job_view", "job_click", "job_apply", "job_share",
    "profile_view", "search", "login", "signup",
    "external_job_click"
  ]).notNull(),
  userId: int("userId"),
  jobId: int("jobId"),
  externalJobId: int("externalJobId"),
  metadata: text("metadata"), // JSON additional data
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_eventType").on(table.eventType),
  index("idx_userId_tel").on(table.userId),
  index("idx_jobId_tel").on(table.jobId),
  index("idx_createdAt_tel").on(table.createdAt),
]);

export type TelemetryEvent = typeof telemetryEvents.$inferSelect;
export type InsertTelemetryEvent = typeof telemetryEvents.$inferInsert;

/**
 * Audit log table
 * Records all administrative and important user actions
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  action: mysqlEnum("action", [
    "job_created", "job_updated", "job_deleted", "job_paused", "job_closed",
    "user_created", "user_updated", "user_deleted", "user_banned",
    "company_verified", "company_unverified",
    "application_submitted", "application_status_changed",
    "notification_sent", "settings_changed",
    "external_job_imported", "external_job_removed"
  ]).notNull(),
  userId: int("userId"),
  targetType: varchar("targetType", { length: 50 }),
  targetId: int("targetId"),
  details: text("details"), // JSON with action details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_action_audit").on(table.action),
  index("idx_userId_audit").on(table.userId),
  index("idx_createdAt_audit").on(table.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "job_viewed", "profile_viewed", "new_application",
    "new_match", "job_recommendation", "system_message",
    "admin_message"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedJobId: int("relatedJobId"),
  relatedUserId: int("relatedUserId"),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("idx_userId_notif").on(table.userId),
  index("idx_read_notif").on(table.read),
]);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Automation settings table
 * Configurable automation parameters for the platform
 */
export const automationSettings = mysqlTable("automationSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["notifications", "scraping", "matching", "system"]).notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationSetting = typeof automationSettings.$inferSelect;
export type InsertAutomationSetting = typeof automationSettings.$inferInsert;
