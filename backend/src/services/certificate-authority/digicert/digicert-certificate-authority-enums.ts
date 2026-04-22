export enum DigiCertOrderStatus {
  Pending = "pending",
  Issued = "issued",
  Reissue = "reissue",
  ReissuePending = "reissue_pending",
  Revoked = "revoked",
  Canceled = "canceled",
  Rejected = "rejected",
  WaitingPickup = "waiting_pickup",
  Expired = "expired"
}

export const DIGICERT_FINAL_ISSUED_STATUSES = [
  DigiCertOrderStatus.Issued,
  DigiCertOrderStatus.WaitingPickup,
  DigiCertOrderStatus.Reissue,
  DigiCertOrderStatus.ReissuePending
] as const;

export enum DigiCertProcessorOutcome {
  Skipped = "skipped"
}
