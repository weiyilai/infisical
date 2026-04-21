import { GenericFieldLabel } from "@app/components/secret-syncs";
import { OnaSyncScope, TOnaSync } from "@app/hooks/api/secretSyncs/types/ona-sync";

type Props = {
  secretSync: TOnaSync;
};

export const OnaSyncDestinationSection = ({ secretSync }: Props) => {
  const { destinationConfig } = secretSync;

  if (destinationConfig.scope === OnaSyncScope.Project) {
    return (
      <>
        <GenericFieldLabel label="Scope">Project Secret</GenericFieldLabel>
        <GenericFieldLabel label="Ona Project">{destinationConfig.projectName}</GenericFieldLabel>
      </>
    );
  }

  return <GenericFieldLabel label="Scope">User Secret</GenericFieldLabel>;
};
