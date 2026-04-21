import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SingleValue } from "react-select";

import { SecretSyncConnectionField } from "@app/components/secret-syncs/forms/SecretSyncConnectionField";
import { FilterableSelect, FormControl, Select, SelectItem } from "@app/components/v2";
import { useOnaConnectionListProjects } from "@app/hooks/api/appConnections/ona";
import { TOnaProject } from "@app/hooks/api/appConnections/ona/types";
import { SecretSync } from "@app/hooks/api/secretSyncs";
import { OnaSyncScope } from "@app/hooks/api/secretSyncs/types/ona-sync";

import { TSecretSyncForm } from "../schemas";

const ONA_SYNC_SCOPE_LABELS: Record<OnaSyncScope, string> = {
  [OnaSyncScope.Project]: "Project Secret",
  [OnaSyncScope.User]: "User Secret"
};

export const OnaSyncFields = () => {
  const { control, setValue } = useFormContext<TSecretSyncForm & { destination: SecretSync.Ona }>();

  const connectionId = useWatch({ name: "connection.id", control });
  const scope = useWatch({ name: "destinationConfig.scope", control });

  const { data: projects, isLoading: isProjectsLoading } = useOnaConnectionListProjects(
    connectionId,
    { enabled: Boolean(connectionId) && scope === OnaSyncScope.Project }
  );

  // Initialize a sensible default scope when a connection is first selected.
  useEffect(() => {
    if (!connectionId) return;
    if (!scope) {
      setValue("destinationConfig.scope", OnaSyncScope.Project);
    }
  }, [connectionId, scope, setValue]);

  return (
    <>
      <SecretSyncConnectionField
        onChange={() => {
          setValue("destinationConfig.scope", OnaSyncScope.Project);
          setValue("destinationConfig.projectId", "");
          setValue("destinationConfig.projectName", "");
        }}
      />

      <Controller
        name="destinationConfig.scope"
        control={control}
        defaultValue={OnaSyncScope.Project}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl
            isError={Boolean(error)}
            errorText={error?.message}
            label="Scope"
            tooltipText="Where the secrets will live in Ona. Project scope writes to a selected Ona project; User scope writes to the authenticated user's personal secrets."
          >
            <Select
              value={value}
              onValueChange={(val) => {
                onChange(val);
                if (val !== OnaSyncScope.Project) {
                  setValue("destinationConfig.projectId", "");
                  setValue("destinationConfig.projectName", "");
                }
              }}
              className="w-full border border-mineshaft-500"
              position="popper"
              placeholder="Select a scope..."
              dropdownContainerClassName="max-w-none"
            >
              {Object.values(OnaSyncScope).map((scopeValue) => (
                <SelectItem value={scopeValue} key={scopeValue}>
                  {ONA_SYNC_SCOPE_LABELS[scopeValue]}
                </SelectItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {scope === OnaSyncScope.Project && (
        <Controller
          name="destinationConfig.projectId"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <FormControl isError={Boolean(error)} errorText={error?.message} label="Ona Project">
              <FilterableSelect
                menuPlacement="top"
                isLoading={isProjectsLoading && Boolean(connectionId)}
                isDisabled={!connectionId}
                value={projects?.find((p) => p.id === value) ?? null}
                onChange={(option) => {
                  const selected = option as SingleValue<TOnaProject>;
                  onChange(selected?.id ?? "");
                  setValue("destinationConfig.projectName", selected?.name ?? "");
                }}
                options={projects ?? []}
                placeholder="Select a project..."
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
              />
            </FormControl>
          )}
        />
      )}

      {scope === OnaSyncScope.User && (
        <p className="mb-2 text-xs text-mineshaft-400">
          Secrets will be written to the authenticated Ona user&apos;s personal secret store.
        </p>
      )}
    </>
  );
};
