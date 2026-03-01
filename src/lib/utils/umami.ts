/**
 * Umami analytics tracking helper.
 * Calls `window.umami.track()` when the Umami script is loaded; silently no-ops otherwise.
 */

type UmamiEventData = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: UmamiEventData) => void;
    };
  }
}

export function trackEvent(event: string, data?: UmamiEventData) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(event, data);
  }
}
