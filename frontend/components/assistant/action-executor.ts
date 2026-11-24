/**
 * Safe Navigation & Action Executor for KrishiSetu Voice Assistant
 * Validates target routes against role-scoped allowlists before navigation.
 */

export interface NavigationTarget {
  targetRoute: string;
  description: string;
}

const ALLOWED_FARMER_ROUTES = new Set([
  "/farmer/dashboard",
  "/farmer/profile",
  "/farmer/schemes",
  "/farmer/applications",
  "/farmer/benefits",
  "/farmer/calculator",
  "/farmer/eligibility",
  "/farmer/grievances",
  "/farmer/notifications",
  "/farmer/settings",
]);

const ALLOWED_OFFICER_ROUTES = new Set([
  "/officer/dashboard",
  "/officer/farmers",
  "/officer/applications",
  "/officer/grievances",
  "/officer/discrepancies",
  "/officer/verifications",
  "/officer/reports",
  "/officer/settings",
  "/officer/voice-escalations",
]);

const ALLOWED_ADMIN_ROUTES = new Set([
  "/admin/dashboard",
  "/admin/users",
  "/admin/schemes",
  "/admin/policies",
  "/admin/audit-logs",
  "/admin/settings",
]);

export function isRoutePermitted(targetRoute: string, userRole: string): boolean {
  const cleanRoute = targetRoute.split("?")[0].trim();
  const role = userRole.toLowerCase();

  if (role === "admin") {
    return (
      ALLOWED_ADMIN_ROUTES.has(cleanRoute) ||
      ALLOWED_FARMER_ROUTES.has(cleanRoute) ||
      ALLOWED_OFFICER_ROUTES.has(cleanRoute)
    );
  }

  if (role === "officer" || role === "government") {
    return ALLOWED_OFFICER_ROUTES.has(cleanRoute);
  }

  // Farmer role
  return ALLOWED_FARMER_ROUTES.has(cleanRoute);
}

export function executeSafeNavigation(
  navigation: NavigationTarget,
  userRole: string,
  routerPush: (href: string) => void,
): { executed: boolean; message: string } {
  const { targetRoute, description } = navigation;

  if (!isRoutePermitted(targetRoute, userRole)) {
    return {
      executed: false,
      message: `Access denied: Role '${userRole}' is not authorized to navigate to '${targetRoute}'.`,
    };
  }

  try {
    routerPush(targetRoute);
    return {
      executed: true,
      message: `Navigated to ${description} (${targetRoute})`,
    };
  } catch (err) {
    return {
      executed: false,
      message: err instanceof Error ? err.message : "Navigation failed",
    };
  }
}
