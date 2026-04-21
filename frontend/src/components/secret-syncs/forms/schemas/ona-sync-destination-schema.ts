import { z } from "zod";

import { BaseSecretSyncSchema } from "@app/components/secret-syncs/forms/schemas/base-secret-sync-schema";
import { SecretSync } from "@app/hooks/api/secretSyncs";
import { OnaSyncScope } from "@app/hooks/api/secretSyncs/types/ona-sync";

export const OnaSyncDestinationSchema = BaseSecretSyncSchema().merge(
  z.object({
    destination: z.literal(SecretSync.Ona),
    destinationConfig: z.discriminatedUnion("scope", [
      z.object({
        scope: z.literal(OnaSyncScope.Project),
        projectId: z.string().trim().min(1, "Ona project required"),
        projectName: z.string().trim().min(1, "Ona project name required")
      }),
      z.object({
        scope: z.literal(OnaSyncScope.User)
      })
    ])
  })
);
