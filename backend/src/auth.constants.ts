const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = 24 * 60 * 60;
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60;

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ?? "lifeos-access-secret";
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "lifeos-refresh-secret";

export const ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? "1d";
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = durationToSeconds(
  ACCESS_TOKEN_EXPIRES_IN,
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
);
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = durationToSeconds(
  REFRESH_TOKEN_EXPIRES_IN,
  DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
);

function durationToSeconds(value: string | number, fallback: number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
  }

  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(s|m|h|d)?$/);
  if (!match) {
    return fallback;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";

  if (!Number.isFinite(amount) || amount <= 0) {
    return fallback;
  }

  if (unit === "m") {
    return amount * 60;
  }
  if (unit === "h") {
    return amount * 60 * 60;
  }
  if (unit === "d") {
    return amount * 24 * 60 * 60;
  }
  return amount;
}
