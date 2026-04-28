/* eslint-disable max-classes-per-file */
import RE2 from "re2";

export const ACME_ORDER_TIMEOUT_MS = 5 * 60 * 1000;

export class AcmeOrderTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcmeOrderTimeoutError";
  }
}

export class AcmeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcmeRateLimitError";
  }
}

const ACME_ERROR_URN_PREFIX = "urn:ietf:params:acme:error:";

const RATE_LIMIT_URN = `${ACME_ERROR_URN_PREFIX}rateLimited`;

const RATE_LIMITED_WORD_RE = new RE2("\\brateLimited\\b", "i");

export const isAcmeRateLimitError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.message.includes(RATE_LIMIT_URN) || RATE_LIMITED_WORD_RE.test(error.message);
};

const formatTimeoutDuration = (timeoutMs: number): string => {
  const totalSeconds = Math.round(timeoutMs / 1000);
  if (totalSeconds % 60 === 0) {
    const minutes = totalSeconds / 60;
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return `${totalSeconds} seconds`;
};

export const runWithAcmeOrderTimeout = async <T>(operation: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout | undefined;
  const duration = formatTimeoutDuration(timeoutMs);
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new AcmeOrderTimeoutError(
          `ACME order did not complete within ${duration}. Possible causes: the CA is rate-limiting requests, the order is blocked at validation, or the CA is slow to respond.`
        )
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};
