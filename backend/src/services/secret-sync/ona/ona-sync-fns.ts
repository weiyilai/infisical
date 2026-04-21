import { AxiosError } from "axios";

import { request } from "@app/lib/config/request";
import { IntegrationUrls } from "@app/services/integration-auth/integration-list";
import { SecretSyncError } from "@app/services/secret-sync/secret-sync-errors";
import { matchesSchema } from "@app/services/secret-sync/secret-sync-fns";
import { TSecretMap } from "@app/services/secret-sync/secret-sync-types";

import { ONA_PAGE_SIZE, OnaSyncScope } from "./ona-sync-enums";
import {
  TOnaAuthenticatedIdentityResponse,
  TOnaListSecretsResponse,
  TOnaScopeFilter,
  TOnaSecret,
  TOnaSyncWithCredentials
} from "./ona-sync-types";

const ONA_LIST_SECRETS_PATH = "/gitpod.v1.SecretService/ListSecrets";
const ONA_CREATE_SECRET_PATH = "/gitpod.v1.SecretService/CreateSecret";
const ONA_UPDATE_SECRET_VALUE_PATH = "/gitpod.v1.SecretService/UpdateSecretValue";
const ONA_DELETE_SECRET_PATH = "/gitpod.v1.SecretService/DeleteSecret";
const ONA_GET_AUTHENTICATED_IDENTITY_PATH = "/gitpod.v1.IdentityService/GetAuthenticatedIdentity";

const ONA_MAX_RETRIES = 3;
const ONA_BASE_RETRY_DELAY_MS = 500;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetryableOnaError = (error: unknown): boolean => {
  if (!(error instanceof AxiosError)) return false;
  if (!error.response) return true;
  const { status } = error.response;
  return status === 408 || status === 429;
};

const withOnaRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      if (attempt >= ONA_MAX_RETRIES || !isRetryableOnaError(error)) throw error;
      // eslint-disable-next-line no-await-in-loop
      await sleep(ONA_BASE_RETRY_DELAY_MS * 2 ** attempt);
    }
  }
};

const getAuthHeaders = (secretSync: TOnaSyncWithCredentials) => ({
  Authorization: `Bearer ${secretSync.connection.credentials.personalAccessToken}`,
  "Content-Type": "application/json"
});

const makeUserIdResolver = (secretSync: TOnaSyncWithCredentials) => {
  let cached: string | undefined;
  return async (): Promise<string> => {
    if (cached) return cached;
    const { data } = await withOnaRetry(() =>
      request.post<TOnaAuthenticatedIdentityResponse>(
        `${IntegrationUrls.ONA_API_URL}${ONA_GET_AUTHENTICATED_IDENTITY_PATH}`,
        {},
        { headers: getAuthHeaders(secretSync) }
      )
    );
    const userId = data?.identity?.subject?.id ?? data?.userId;
    if (!userId) {
      throw new SecretSyncError({
        message: "Unable to resolve authenticated Ona user ID for user-scoped sync.",
        shouldRetry: false
      });
    }
    cached = userId;
    return cached;
  };
};

const buildScopeFilter = async (
  secretSync: TOnaSyncWithCredentials,
  resolveUserId: () => Promise<string>
): Promise<TOnaScopeFilter> => {
  if (secretSync.destinationConfig.scope === OnaSyncScope.Project) {
    return { projectId: secretSync.destinationConfig.projectId };
  }
  return { userId: await resolveUserId() };
};

const listEnvVarSecrets = async (
  secretSync: TOnaSyncWithCredentials,
  scope: TOnaScopeFilter
): Promise<TOnaSecret[]> => {
  const all: TOnaSecret[] = [];
  let token: string | undefined;
  let hasMore = true;

  while (hasMore) {
    // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-loop-func
    const { data } = await withOnaRetry(() =>
      request.post<TOnaListSecretsResponse>(
        `${IntegrationUrls.ONA_API_URL}${ONA_LIST_SECRETS_PATH}`,
        {
          filter: { scope },
          pagination: { pageSize: ONA_PAGE_SIZE, ...(token ? { token } : {}) }
        },
        { headers: getAuthHeaders(secretSync) }
      )
    );

    if (data?.secrets?.length) all.push(...data.secrets);

    token = data?.pagination?.nextToken || undefined;
    hasMore = Boolean(token);
  }

  return all.filter((secret) => secret.environmentVariable === true);
};

const createEnvVarSecret = async (
  secretSync: TOnaSyncWithCredentials,
  scope: TOnaScopeFilter,
  name: string,
  value: string
): Promise<void> => {
  await withOnaRetry(() =>
    request.post(
      `${IntegrationUrls.ONA_API_URL}${ONA_CREATE_SECRET_PATH}`,
      {
        name,
        value,
        scope,
        environmentVariable: true
      },
      { headers: getAuthHeaders(secretSync) }
    )
  );
};

const updateSecretValue = async (
  secretSync: TOnaSyncWithCredentials,
  secretId: string,
  value: string
): Promise<void> => {
  await withOnaRetry(() =>
    request.post(
      `${IntegrationUrls.ONA_API_URL}${ONA_UPDATE_SECRET_VALUE_PATH}`,
      { secretId, value },
      { headers: getAuthHeaders(secretSync) }
    )
  );
};

const deleteSecret = async (secretSync: TOnaSyncWithCredentials, secretId: string): Promise<void> => {
  await withOnaRetry(() =>
    request.post(
      `${IntegrationUrls.ONA_API_URL}${ONA_DELETE_SECRET_PATH}`,
      { secretId },
      { headers: getAuthHeaders(secretSync) }
    )
  );
};

const wrapApiError = (error: unknown, secretKey: string): never => {
  if (error instanceof SecretSyncError) throw error;
  if (error instanceof AxiosError) {
    throw new SecretSyncError({
      error,
      secretKey
    });
  }
  throw new SecretSyncError({
    error,
    secretKey
  });
};

export const OnaSyncFns = {
  syncSecrets: async (secretSync: TOnaSyncWithCredentials, secretMap: TSecretMap) => {
    const resolveUserId = makeUserIdResolver(secretSync);
    const scope = await buildScopeFilter(secretSync, resolveUserId);

    const existingSecrets = await listEnvVarSecrets(secretSync, scope);
    const existingByName = new Map(existingSecrets.map((s) => [s.name, s]));

    for (const key of Object.keys(secretMap)) {
      const prior = existingByName.get(key);
      try {
        if (!prior) {
          // eslint-disable-next-line no-await-in-loop
          await createEnvVarSecret(secretSync, scope, key, secretMap[key].value);
        } else {
          // eslint-disable-next-line no-await-in-loop
          await updateSecretValue(secretSync, prior.id, secretMap[key].value);
        }
      } catch (error) {
        wrapApiError(error, key);
      }
    }

    if (secretSync.syncOptions.disableSecretDeletion) return;

    for (const existing of existingSecrets) {
      if (!matchesSchema(existing.name, secretSync.environment?.slug || "", secretSync.syncOptions.keySchema)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (secretMap[existing.name]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteSecret(secretSync, existing.id);
      } catch (error) {
        wrapApiError(error, existing.name);
      }
    }
  },

  getSecrets: async (): Promise<TSecretMap> => {
    // Ona's GetSecretValue endpoint only returns values from within an active workspace/environment,
    // so importing secret values from outside a workspace is not possible with a PAT. Import is
    // intentionally disabled (canImportSecrets: false on the schema/list-item).
    throw new Error("Ona does not support importing secrets.");
  },

  removeSecrets: async (secretSync: TOnaSyncWithCredentials, secretMap: TSecretMap) => {
    const resolveUserId = makeUserIdResolver(secretSync);
    const scope = await buildScopeFilter(secretSync, resolveUserId);
    const existingSecrets = await listEnvVarSecrets(secretSync, scope);

    for (const existing of existingSecrets) {
      if (!(existing.name in secretMap)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteSecret(secretSync, existing.id);
      } catch (error) {
        wrapApiError(error, existing.name);
      }
    }
  }
};
