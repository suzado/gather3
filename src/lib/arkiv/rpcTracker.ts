type Listener = (unhealthy: boolean) => void;

const RECOVERY_TIMEOUT = 60_000;

let unhealthy = false;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function notify(value: boolean) {
  if (unhealthy === value) return;
  unhealthy = value;
  listeners.forEach((l) => l(value));
}

export function reportRpcFailure() {
  if (recoveryTimer) clearTimeout(recoveryTimer);
  notify(true);
  recoveryTimer = setTimeout(() => {
    notify(false);
  }, RECOVERY_TIMEOUT);
}

export function reportRpcSuccess() {
  if (recoveryTimer) clearTimeout(recoveryTimer);
  notify(false);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isRpcUnhealthy(): boolean {
  return unhealthy;
}

/**
 * Wraps a promise to track RPC health.
 * Reports success/failure to the global tracker.
 */
export async function trackedFetch<T>(promise: Promise<T>): Promise<T> {
  try {
    const result = await promise;
    reportRpcSuccess();
    return result;
  } catch (error) {
    reportRpcFailure();
    throw error;
  }
}
