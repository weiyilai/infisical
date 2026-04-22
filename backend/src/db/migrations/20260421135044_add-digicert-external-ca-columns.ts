import { Knex } from "knex";

import { TableName } from "../schemas";

export async function up(knex: Knex): Promise<void> {
  const hasCertificateRequests = await knex.schema.hasTable(TableName.CertificateRequests);
  if (hasCertificateRequests) {
    const hasEncryptedPrivateKey = await knex.schema.hasColumn(TableName.CertificateRequests, "encryptedPrivateKey");
    if (!hasEncryptedPrivateKey) {
      await knex.schema.alterTable(TableName.CertificateRequests, (t) => {
        t.binary("encryptedPrivateKey").nullable();
      });
    }
  }

  const hasCertificate = await knex.schema.hasTable(TableName.Certificate);
  if (hasCertificate) {
    const hasExternalOrderId = await knex.schema.hasColumn(TableName.Certificate, "externalOrderId");
    if (!hasExternalOrderId) {
      await knex.schema.alterTable(TableName.Certificate, (t) => {
        t.string("externalOrderId").nullable();
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasCertificate = await knex.schema.hasTable(TableName.Certificate);
  if (hasCertificate) {
    const hasExternalOrderId = await knex.schema.hasColumn(TableName.Certificate, "externalOrderId");
    if (hasExternalOrderId) {
      await knex.schema.alterTable(TableName.Certificate, (t) => {
        t.dropColumn("externalOrderId");
      });
    }
  }

  const hasCertificateRequests = await knex.schema.hasTable(TableName.CertificateRequests);
  if (hasCertificateRequests) {
    const hasEncryptedPrivateKey = await knex.schema.hasColumn(TableName.CertificateRequests, "encryptedPrivateKey");
    if (hasEncryptedPrivateKey) {
      await knex.schema.alterTable(TableName.CertificateRequests, (t) => {
        t.dropColumn("encryptedPrivateKey");
      });
    }
  }
}
