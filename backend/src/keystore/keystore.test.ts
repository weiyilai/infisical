import { describe, expect, test } from "vitest";

import { KeyStorePrefixes, KeyStoreTtls } from "./keystore";

describe("KeyStorePrefixes", () => {
  test("AdminConfig matches previously hardcoded value", () => {
    expect(KeyStorePrefixes.AdminConfig).toBe("infisical-admin-cfg");
  });

  test("InvalidatingCache matches previously hardcoded value", () => {
    expect(KeyStorePrefixes.InvalidatingCache).toBe("invalidating-cache");
  });

  test("SecretManagerCachePattern matches previously hardcoded value", () => {
    expect(KeyStorePrefixes.SecretManagerCachePattern).toBe("secret-manager:*");
  });

  test("AuditLogMigrationAlert matches previously hardcoded value", () => {
    expect(KeyStorePrefixes.AuditLogMigrationAlert).toBe("audit-log-migration-alert-last-row-count");
  });

  test("LicenseCloudPlan factory matches previously hardcoded template", () => {
    const orgId = "org-123";
    expect(KeyStorePrefixes.LicenseCloudPlan(orgId)).toBe(`infisical-cloud-plan-${orgId}`);
  });

  test("IdentityLockoutState factory matches previously hardcoded template", () => {
    const identityId = "id-abc";
    const authMethod = "ldap-auth";
    const slug = "my-user";
    expect(KeyStorePrefixes.IdentityLockoutState(identityId, authMethod, slug)).toBe(
      `lockout:identity:${identityId}:${authMethod}:${slug}`
    );
  });

  test("TelemetryIdentify factory matches previously hardcoded template", () => {
    const distinctId = "user-xyz";
    expect(KeyStorePrefixes.TelemetryIdentify(distinctId)).toBe(`telemetry-identify:${distinctId}`);
  });
});

describe("KeyStoreTtls", () => {
  test("AdminConfigInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.AdminConfigInSeconds).toBe(60);
  });

  test("InvalidatingCacheInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.InvalidatingCacheInSeconds).toBe(1800);
  });

  test("AuditLogMigrationAlertInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.AuditLogMigrationAlertInSeconds).toBe(7 * 24 * 60 * 60);
  });

  test("LicenseCloudPlanInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.LicenseCloudPlanInSeconds).toBe(5 * 60);
  });

  test("AiMcpEndpointOAuthFlowInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.AiMcpEndpointOAuthFlowInSeconds).toBe(5 * 60);
  });

  test("AiMcpServerOAuthSessionInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.AiMcpServerOAuthSessionInSeconds).toBe(10 * 60);
  });

  test("DashboardCacheInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.DashboardCacheInSeconds).toBe(600);
  });

  test("ProjectEnvironmentOperationMarkerInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.ProjectEnvironmentOperationMarkerInSeconds).toBe(10);
  });

  test("UserMfaUnlockEmailSentInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.UserMfaUnlockEmailSentInSeconds).toBe(300);
  });

  test("TelemetryGroupIdentifyInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.TelemetryGroupIdentifyInSeconds).toBe(3600);
  });

  test("TelemetryAggregatedEventInSeconds matches previously hardcoded value", () => {
    expect(KeyStoreTtls.TelemetryAggregatedEventInSeconds).toBe(600);
  });
});
