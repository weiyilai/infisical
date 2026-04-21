import { useFormContext } from "react-hook-form";

import { GenericFieldLabel } from "@app/components/secret-syncs";
import { TSecretSyncForm } from "@app/components/secret-syncs/forms/schemas";
import { SecretSync } from "@app/hooks/api/secretSyncs";
import { OnaSyncScope } from "@app/hooks/api/secretSyncs/types/ona-sync";

export const OnaSyncReviewFields = () => {
  const { watch } = useFormContext<TSecretSyncForm & { destination: SecretSync.Ona }>();
  const destinationConfig = watch("destinationConfig");

  return (
    <>
      <GenericFieldLabel label="Scope">
        {destinationConfig.scope === OnaSyncScope.Project ? "Project Secret" : "User Secret"}
      </GenericFieldLabel>
      {destinationConfig.scope === OnaSyncScope.Project && (
        <GenericFieldLabel label="Ona Project">{destinationConfig.projectName}</GenericFieldLabel>
      )}
    </>
  );
};
