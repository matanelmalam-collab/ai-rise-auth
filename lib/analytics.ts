/**
 * AI Rise Auth Gateway — Analytics Events
 *
 * Fires events to both GA4 (gtag) and Facebook Pixel (fbq)
 * for full funnel visibility across ad platforms.
 *
 * Events tracked:
 * - auth_page_viewed: Clerk page loads
 * - auth_method_selected: User picks magic link/sms/google
 * - auth_completed: Clerk auth succeeds
 * - bridge_success: Base44 account linked
 * - bridge_error: Bridge failed (alert!)
 * - dashboard_landed: User arrives in course
 */

// GA4 Measurement ID (same as main site)
const GA4_MEASUREMENT_ID = "G-6CY7ZZV553";

type AuthMethod = "magic_link" | "sms" | "google" | "unknown";

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Fire an event to GA4 via gtag
 */
function fireGA4(eventName: string, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, {
      ...properties,
      send_to: GA4_MEASUREMENT_ID,
    });
  }
}

/**
 * Fire an event to Facebook Pixel
 */
function fireFBPixel(eventName: string, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    fbq("trackCustom", eventName, properties);
  }
}

/**
 * Fire event to all analytics platforms
 */
function fireEvent(eventName: string, properties: EventProperties = {}) {
  fireGA4(eventName, properties);
  fireFBPixel(eventName, properties);

  // Console log in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties);
  }
}

// --- Public API ---

export function trackAuthPageViewed(pageType: "signup" | "login") {
  // Extract UTM params from URL
  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  fireEvent("auth_page_viewed", {
    page_type: pageType,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
  });
}

export function trackAuthMethodSelected(method: AuthMethod) {
  fireEvent("auth_method_selected", { method });
}

export function trackAuthCompleted(
  method: AuthMethod,
  isNewUser: boolean,
  timeSeconds: number
) {
  fireEvent("auth_completed", {
    method,
    is_new_user: isNewUser,
    time_seconds: Math.round(timeSeconds),
  });

  // Also fire standard GA4 "sign_up" or "login" event
  if (isNewUser) {
    fireGA4("sign_up", { method });
    fireFBPixel("CompleteRegistration", { method });
  } else {
    fireGA4("login", { method });
  }
}

export function trackBridgeSuccess(isNewAccount: boolean) {
  fireEvent("bridge_success", { is_new_account: isNewAccount });
}

export function trackBridgeError(errorType: string, errorMessage: string) {
  fireEvent("bridge_error", { error_type: errorType, error_message: errorMessage });
}

export function trackDashboardLanded(totalFlowSeconds: number) {
  fireEvent("dashboard_landed", {
    total_flow_seconds: Math.round(totalFlowSeconds),
  });
}

/**
 * Get the GA4 script tags for the <head>
 */
export function getGA4ScriptSrc(): string {
  return `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
}

export function getGA4InitScript(): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_MEASUREMENT_ID}');
  `;
}
