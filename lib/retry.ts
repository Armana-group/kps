// Kept free of runtime imports so the node tests can load it directly.

/**
 * Runs `fn`, retrying after a pause if it throws. The public Koinos RPC
 * turns away bursts of requests, which the browser reports as "Failed to fetch".
 */
export async function withRetry<T>(fn: () => Promise<T>, { attempts = 2, delayMs = 1500 } = {}): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
