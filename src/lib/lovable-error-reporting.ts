// Generic error reporting stub.
// Replace with Sentry, LogRocket, or any other error tracking service if needed.
// Example with Sentry: https://sentry.io/for/react/

type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  _options: ErrorOptions = {},
) {
  // In production, integrate your preferred error tracking service here.
  // For now, we log to the console so errors are visible during development.
  if (typeof window === "undefined") {
    console.error("[Server Error]", error, context);
  } else {
    console.error("[Client Error]", error, { ...context, route: window.location.pathname });
  }
}
