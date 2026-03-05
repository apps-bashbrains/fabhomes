/**
 * Minimal structured logging for auth and admin actions.
 * Production: send to CloudWatch, Datadog, or similar.
 */
type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = { level, message, ...meta, timestamp: new Date().toISOString() };
  if (process.env.NODE_ENV === "production") {
    console[level === "info" ? "log" : level](JSON.stringify(payload));
  } else {
    console[level === "info" ? "log" : level](message, meta ?? "");
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
