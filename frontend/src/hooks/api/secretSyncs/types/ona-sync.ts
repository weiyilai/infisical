import { AppConnection } from "@app/hooks/api/appConnections/enums";
import { SecretSync } from "@app/hooks/api/secretSyncs";
import { TRootSecretSync } from "@app/hooks/api/secretSyncs/types/root-sync";

export enum OnaSyncScope {
  Project = "project",
  User = "user"
}

export type TOnaSync = TRootSecretSync & {
  destination: SecretSync.Ona;
  destinationConfig:
    | { scope: OnaSyncScope.Project; projectId: string; projectName: string }
    | { scope: OnaSyncScope.User };
  connection: {
    app: AppConnection.Ona;
    name: string;
    id: string;
  };
};
