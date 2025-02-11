// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const SecretApprovalRequestsSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  hasMerged: z.boolean().default(false),
  status: z.string().default("open"),
  conflicts: z.unknown().nullable().optional(),
  slug: z.string(),
  folderId: z.string().uuid(),
  statusChangeBy: z.string().uuid().nullable().optional(),
  committerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TSecretApprovalRequests = z.infer<typeof SecretApprovalRequestsSchema>;
export type TSecretApprovalRequestsInsert = Omit<TSecretApprovalRequests, TImmutableDBKeys>;
export type TSecretApprovalRequestsUpdate = Partial<Omit<TSecretApprovalRequests, TImmutableDBKeys>>;
