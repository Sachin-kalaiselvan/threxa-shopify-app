-- Threxa initial migration
-- Run: npx prisma migrate deploy

-- Session (Shopify session storage)
CREATE TABLE IF NOT EXISTS "Session" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "shop"          TEXT NOT NULL,
  "state"         TEXT NOT NULL,
  "isOnline"      BOOLEAN NOT NULL DEFAULT false,
  "scope"         TEXT,
  "expires"       DATETIME,
  "accessToken"   TEXT NOT NULL,
  "userId"        BIGINT,
  "firstName"     TEXT,
  "lastName"      TEXT,
  "email"         TEXT,
  "accountOwner"  BOOLEAN NOT NULL DEFAULT false,
  "locale"        TEXT,
  "collaborator"  BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false,
  "refreshToken"        TEXT,
  "refreshTokenExpires" DATETIME
);

-- AutomationConfig: on/off + config blob per (shop, automation)
CREATE TABLE IF NOT EXISTS "AutomationConfig" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "shop"      TEXT NOT NULL,
  "automation" TEXT NOT NULL,
  "enabled"   BOOLEAN NOT NULL DEFAULT false,
  "config"    TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationConfig_shop_automation_key"
  ON "AutomationConfig"("shop", "automation");

-- AuditLog: append-only, every action logged with its source
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "shop"      TEXT NOT NULL,
  "automation" TEXT NOT NULL,
  "event"     TEXT NOT NULL,
  "status"    TEXT NOT NULL,
  "message"   TEXT,
  "refId"     TEXT,
  "source"    TEXT NOT NULL DEFAULT 'webhook',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AuditLog_shop_automation_createdAt_idx"
  ON "AuditLog"("shop", "automation", "createdAt");

-- AutomationHealth: rolled-up per-automation health for the dashboard
CREATE TABLE IF NOT EXISTS "AutomationHealth" (
  "id"            TEXT NOT NULL PRIMARY KEY,
  "shop"          TEXT NOT NULL,
  "automation"    TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'idle',
  "lastRunAt"     DATETIME,
  "lastSuccessAt" DATETIME,
  "lastFailureAt" DATETIME,
  "failures24h"   INTEGER NOT NULL DEFAULT 0,
  "updatedAt"     DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationHealth_shop_automation_key"
  ON "AutomationHealth"("shop", "automation");

-- Job: durable queue with retry / exponential backoff
CREATE TABLE IF NOT EXISTS "Job" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "shop"        TEXT NOT NULL,
  "automation"  TEXT NOT NULL,
  "type"        TEXT NOT NULL,
  "payload"     TEXT NOT NULL DEFAULT '{}',
  "status"      TEXT NOT NULL DEFAULT 'pending',
  "attempts"    INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "runAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError"   TEXT,
  "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "Job_status_runAt_idx" ON "Job"("status", "runAt");

-- Subscription: mirrors Shopify billing state locally for instant gating
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "shop"      TEXT NOT NULL UNIQUE,
  "plan"      TEXT NOT NULL,
  "status"    TEXT NOT NULL,
  "chargeId"  TEXT,
  "test"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- CustomerContact: minimal PII (phone + email only), isolated for GDPR
CREATE TABLE IF NOT EXISTS "CustomerContact" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "shop"       TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "phone"      TEXT,
  "email"      TEXT,
  "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerContact_shop_customerId_key"
  ON "CustomerContact"("shop", "customerId");
CREATE INDEX IF NOT EXISTS "CustomerContact_shop_idx"
  ON "CustomerContact"("shop");
