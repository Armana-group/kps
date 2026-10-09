// Kept free of runtime imports so the node tests can load it directly.

interface RetryOptions {
  attempts?: number;
  delayMs?: number;
  /** Return false for errors that will fail again, such as a contract rejection. */
  shouldRetry?: (error: unknown) => boolean;
}

/** Runs `fn`, retrying after a pause if it throws a retryable error. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 2, delayMs = 1500, shouldRetry = () => true }: RetryOptions = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts || !shouldRetry(error)) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
