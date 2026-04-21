import { Knex } from "knex";

import { TableName } from "../schemas";
import { dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  const hasRotationOutputTable = await knex.schema.hasTable(TableName.DeprecatedSecretRotationOutput);
  const hasRotationOutputV2Table = await knex.schema.hasTable(TableName.DeprecatedSecretRotationOutputV2);
  const hasRotationTable = await knex.schema.hasTable(TableName.DeprecatedSecretRotationV1);

  if (hasRotationOutputTable) await knex.schema.dropTable(TableName.DeprecatedSecretRotationOutput);
  if (hasRotationOutputV2Table) await knex.schema.dropTable(TableName.DeprecatedSecretRotationOutputV2);

  if (hasRotationTable) {
    await dropOnUpdateTrigger(knex, TableName.DeprecatedSecretRotationV1);
    await knex.schema.dropTableIfExists(TableName.DeprecatedSecretRotationV1);
  }
}

export async function down(): Promise<void> {}
