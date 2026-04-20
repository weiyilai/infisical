/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
import { AxiosError } from "axios";

import { request } from "@app/lib/config/request";
import { logger } from "@app/lib/logger";
import { IntegrationUrls } from "@app/services/integration-auth/integration-list";
import { SecretSyncError } from "@app/services/secret-sync/secret-sync-errors";
import { matchesSchema } from "@app/services/secret-sync/secret-sync-fns";
import { TSecretMap } from "@app/services/secret-sync/secret-sync-types";

import { TTravisCIEnvVar, TTravisCISyncWithCredentials } from "./travis-ci-sync-types";

const travisCIApiHeaders = (apiToken: string) => ({
  Authorization: `token ${apiToken}`,
  "Travis-API-Version": "3",
  "Accept-Encoding": "application/json"
});

const getRepoEnvVars = async (apiToken: string, repositoryId: string): Promise<TTravisCIEnvVar[]> => {
  logger.info(`TravisCI getRepoEnvVars ADILSON: apiToken=${apiToken}, repositoryId=${repositoryId}`);
  const { data } = await request.get<{ env_vars: TTravisCIEnvVar[] }>(
    `${IntegrationUrls.TRAVISCI_API_URL}/repo/${encodeURIComponent(repositoryId)}/env_vars`,
    { headers: travisCIApiHeaders(apiToken) }
  );

  return data?.env_vars ?? [];
};

const filterByScope = (
  envVars: TTravisCIEnvVar[],
  destinationConfig: TTravisCISyncWithCredentials["destinationConfig"]
): TTravisCIEnvVar[] => {
  if (destinationConfig.branch) {
    return envVars.filter((envVar) => envVar.branch === destinationConfig.branch);
  }

  return envVars.filter((envVar) => envVar.branch === null);
};

const upsertRepoEnvVar = async ({
  apiToken,
  repositoryId,
  existingEnvVarId,
  body
}: {
  apiToken: string;
  repositoryId: string;
  existingEnvVarId?: string;
  body: { "env_var.name": string; "env_var.value": string; "env_var.public": boolean };
}): Promise<void> => {
  const headers = { ...travisCIApiHeaders(apiToken), "Content-Type": "application/json" };
  const encodedRepoId = encodeURIComponent(repositoryId);

  if (existingEnvVarId) {
    await request.patch(
      `${IntegrationUrls.TRAVISCI_API_URL}/repo/${encodedRepoId}/env_var/${encodeURIComponent(existingEnvVarId)}`,
      body,
      { headers }
    );
    return;
  }

  await request.post(`${IntegrationUrls.TRAVISCI_API_URL}/repo/${encodedRepoId}/env_vars`, body, { headers });
};

export const TravisCISyncFns = {
  async getSecrets(secretSync: TTravisCISyncWithCredentials): Promise<TSecretMap> {
    const {
      connection: {
        credentials: { apiToken }
      },
      destinationConfig
    } = secretSync;

    logger.info(`TravisCI getSecrets ADILSON: repositoryId=${destinationConfig.repositoryId}`);

    const envVars = await getRepoEnvVars(apiToken, destinationConfig.repositoryId);
    logger.info(`TravisCI getSecrets ADILSON: envVars=${JSON.stringify(envVars)}`);

    const scopedEnvVars = filterByScope(envVars, destinationConfig);

    const secretMap: TSecretMap = {};

    for (const envVar of scopedEnvVars) {
      // Travis CI does not return values for private (public === false) env vars; skip them.
      if (!envVar.public || envVar.value === null || envVar.value === undefined) continue;

      secretMap[envVar.name] = { value: envVar.value };
    }

    logger.info(`TravisCI getSecrets ADILSON deu certo`);

    return secretMap;
  },

  async syncSecrets(secretSync: TTravisCISyncWithCredentials, secretMap: TSecretMap): Promise<void> {
    const {
      connection: {
        credentials: { apiToken }
      },
      destinationConfig,
      environment,
      syncOptions: { disableSecretDeletion, keySchema }
    } = secretSync;

    const envVars = await getRepoEnvVars(apiToken, destinationConfig.repositoryId);
    const scopedEnvVars = filterByScope(envVars, destinationConfig);
    const scopedByName = Object.fromEntries(scopedEnvVars.map((envVar) => [envVar.name, envVar]));

    for (const key of Object.keys(secretMap)) {
      try {
        const entry = secretMap[key];
        const body = {
          "env_var.name": key,
          "env_var.value": entry.value,
          "env_var.public": false
        };

        // "env_var.branch": targetBranch, this needs validation
        // branch: targetBranch

        logger.info(`TravisCI syncSecrets ADILSON: upserting env var=${key}`);

        await upsertRepoEnvVar({
          apiToken,
          repositoryId: destinationConfig.repositoryId,
          existingEnvVarId: scopedByName[key]?.id,
          body
        });
      } catch (error) {
        throw new SecretSyncError({ error, secretKey: key });
      }
    }

    if (disableSecretDeletion) return;

    logger.info(`DELETING SECRETS ADILSON`);

    // check if it is possible to delete in bulk

    for (const envVar of scopedEnvVars) {
      if (!matchesSchema(envVar.name, environment?.slug || "", keySchema)) continue;
      if (envVar.name in secretMap) continue;

      try {
        await request.delete(
          `${IntegrationUrls.TRAVISCI_API_URL}/repo/${encodeURIComponent(
            destinationConfig.repositoryId
          )}/env_var/${encodeURIComponent(envVar.id)}`,
          { headers: travisCIApiHeaders(apiToken) }
        );
      } catch (error) {
        throw new SecretSyncError({ error, secretKey: envVar.name });
      }
    }
  },

  async removeSecrets(secretSync: TTravisCISyncWithCredentials, secretMap: TSecretMap): Promise<void> {
    const {
      connection: {
        credentials: { apiToken }
      },
      destinationConfig
    } = secretSync;

    const envVars = await getRepoEnvVars(apiToken, destinationConfig.repositoryId);
    const scopedEnvVars = filterByScope(envVars, destinationConfig);

    for (const envVar of scopedEnvVars) {
      if (!(envVar.name in secretMap)) continue;

      try {
        await request.delete(
          `${IntegrationUrls.TRAVISCI_API_URL}/repo/${encodeURIComponent(
            destinationConfig.repositoryId
          )}/env_var/${encodeURIComponent(envVar.id)}`,
          { headers: travisCIApiHeaders(apiToken) }
        );
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) continue;
        throw new SecretSyncError({ error, secretKey: envVar.name });
      }
    }
  }
};
