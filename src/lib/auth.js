const AUTH_STORAGE_KEY = "lifeos_auth_session";
export const AUTH_SESSION_CHANGED_EVENT = "lifeos-auth-session-changed";
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

const USER_FRIENDLY_MESSAGES = {
  generic: "Amalni hozir bajarib bo'lmadi. Qayta urinib ko'ring.",
  network:
    "Xizmatga ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.",
  authRequired: "Davom etish uchun avval tizimga kiring.",
  sessionExpired: "Sessiya yakunlandi. Qayta kirib ko'ring.",
  forbidden: "Bu amalni bajarishga ruxsat yo'q.",
  notFound: "Kerakli ma'lumot topilmadi.",
  conflict: "Bu ma'lumot allaqachon mavjud.",
  validation: "Kiritilgan ma'lumotlarni tekshirib, qayta urinib ko'ring.",
  rateLimited: "Juda ko'p urinish bo'ldi. Birozdan keyin qayta urinib ko'ring.",
  serviceUnavailable:
    "Xizmatda vaqtinchalik uzilish bor. Keyinroq qayta urinib ko'ring.",
};

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(USER_FRIENDLY_MESSAGES.network);
  }
  return API_BASE_URL;
}

function extractPayloadMessage(payload) {
  if (!payload) {
    return "";
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return "";
}

function parseErrorMessage(
  payload,
  status,
  fallback = USER_FRIENDLY_MESSAGES.generic,
  path = "",
) {
  const payloadMessage = extractPayloadMessage(payload);

  if (status === 400 || status === 422) {
    return payloadMessage || USER_FRIENDLY_MESSAGES.validation;
  }

  if (status === 401) {
    if (path.startsWith("/auth/login") || path.startsWith("/auth/register")) {
      return payloadMessage || "Login yoki parol noto'g'ri.";
    }
    return USER_FRIENDLY_MESSAGES.sessionExpired;
  }

  if (status === 403) {
    return USER_FRIENDLY_MESSAGES.forbidden;
  }

  if (status === 404) {
    return USER_FRIENDLY_MESSAGES.notFound;
  }

  if (status === 409) {
    return payloadMessage || USER_FRIENDLY_MESSAGES.conflict;
  }

  if (status === 429) {
    return USER_FRIENDLY_MESSAGES.rateLimited;
  }

  if (status >= 500) {
    return USER_FRIENDLY_MESSAGES.serviceUnavailable;
  }

  return payloadMessage || fallback;
}

function unwrapPayload(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function emitAuthSessionChanged() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

function isFormData(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

async function rawRequest(path, options = {}) {
  const hasBody = Object.prototype.hasOwnProperty.call(options, "body");
  const headers = {
    ...(hasBody && !isFormData(options.body)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers ?? {}),
  };

  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(USER_FRIENDLY_MESSAGES.network);
  }

  let payload = null;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  return { response, payload };
}

function normalizeSessionPayload(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const user =
    session.user && typeof session.user === "object"
      ? session.user
      : {
          id: session.id,
          email: session.email,
          fullName: session.fullName,
          firstName: session.firstName,
          lastName: session.lastName,
          phone: session.phone,
          address: session.address,
          region: session.region,
          city: session.city,
          district: session.district,
          profession: session.profession,
          role: session.role,
          createdAt: session.createdAt,
        };

  const id = typeof user.id === "string" ? user.id : "";
  const email = typeof user.email === "string" ? user.email : "";
  const fullName = typeof user.fullName === "string" ? user.fullName : "";
  const firstName = typeof user.firstName === "string" ? user.firstName : "";
  const lastName = typeof user.lastName === "string" ? user.lastName : "";
  const phone = typeof user.phone === "string" ? user.phone : "";
  const address = typeof user.address === "string" ? user.address : "";
  const region = typeof user.region === "string" ? user.region : "";
  const city = typeof user.city === "string" ? user.city : "";
  const district = typeof user.district === "string" ? user.district : "";
  const profession = typeof user.profession === "string" ? user.profession : "";
  const role = user.role === "admin" || user.role === "user" ? user.role : "user";
  const createdAt =
    typeof user.createdAt === "string" && user.createdAt.trim()
      ? user.createdAt
      : null;
  const accessToken =
    typeof session.accessToken === "string" ? session.accessToken : null;
  const refreshToken =
    typeof session.refreshToken === "string" ? session.refreshToken : null;

  if (!id || !email || !fullName || !accessToken || !refreshToken) {
    return null;
  }

  const now = Date.now();
  const accessTokenExpiresIn = Number(session.accessTokenExpiresIn || 0);
  const refreshTokenExpiresIn = Number(session.refreshTokenExpiresIn || 0);

  return {
    id,
    email,
    fullName,
    firstName,
    lastName,
    phone,
    address,
    region,
    city,
    district,
    profession,
    role,
    createdAt,
    accessToken,
    refreshToken,
    tokenType:
      typeof session.tokenType === "string" && session.tokenType
        ? session.tokenType
        : "Bearer",
    loggedInAt:
      typeof session.loggedInAt === "string"
        ? session.loggedInAt
        : new Date().toISOString(),
    accessTokenExpiresAt:
      accessTokenExpiresIn > 0
        ? new Date(now + accessTokenExpiresIn * 1000).toISOString()
        : null,
    refreshTokenExpiresAt:
      refreshTokenExpiresIn > 0
        ? new Date(now + refreshTokenExpiresIn * 1000).toISOString()
        : null,
  };
}

export function saveAuthSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeSessionPayload(session);
  if (!normalized) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    emitAuthSessionChanged();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  emitAuthSessionChanged();
}

export function getAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeSessionPayload(parsed);
    if (!normalized) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return normalized;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthSessionChanged();
}

export function isAuthenticated() {
  const session = getAuthSession();
  return Boolean(session?.accessToken);
}

export async function refreshAccessToken() {
  const currentSession = getAuthSession();

  if (!currentSession?.refreshToken) {
    clearAuthSession();
    throw new Error(USER_FRIENDLY_MESSAGES.sessionExpired);
  }

  let response;
  let payload;
  try {
    ({ response, payload } = await rawRequest("/auth/token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
    }));
  } catch (error) {
    throw new Error(error?.message || USER_FRIENDLY_MESSAGES.network);
  }

  if (!response.ok) {
    clearAuthSession();
    throw new Error(
      parseErrorMessage(
        payload,
        response.status,
        USER_FRIENDLY_MESSAGES.sessionExpired,
        "/auth/token",
      ),
    );
  }

  const nextSession = unwrapPayload(payload);
  saveAuthSession(nextSession);
  const parsedSession = getAuthSession();

  if (!parsedSession?.accessToken) {
    clearAuthSession();
    throw new Error(USER_FRIENDLY_MESSAGES.sessionExpired);
  }

  return parsedSession;
}

export async function apiRequest(path, options = {}, config = {}) {
  const { auth = false, retryAuth = true } = config;

  const execute = async (accessToken) => {
    const headers = {
      ...(options.headers ?? {}),
      ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    return rawRequest(path, {
      ...options,
      headers,
    });
  };

  const session = auth ? getAuthSession() : null;
  if (auth && !session?.accessToken) {
    throw new Error(USER_FRIENDLY_MESSAGES.authRequired);
  }

  let response;
  let payload;
  try {
    ({ response, payload } = await execute(session?.accessToken));
  } catch (error) {
    throw new Error(error?.message || USER_FRIENDLY_MESSAGES.network);
  }

  if (auth && response.status === 401 && retryAuth) {
    const refreshed = await refreshAccessToken();
    try {
      ({ response, payload } = await execute(refreshed.accessToken));
    } catch (error) {
      throw new Error(error?.message || USER_FRIENDLY_MESSAGES.network);
    }
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, response.status, undefined, path));
  }

  return unwrapPayload(payload);
}

export async function registerUser(payload) {
  try {
    const session = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, user: session };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function loginUser({ email, password }) {
  try {
    const session = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { ok: true, user: session };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
