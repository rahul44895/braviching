// Every backend route lives under /api (see src/app.js) -- the frontend has its own client-side
// routes at the bare resource names (/clients, /campaigns, ...), so this prefix is what keeps a
// browser navigation to /clients from colliding with this client's own fetch('/clients') call.
// Centralized here so every page component can keep writing api.get('/clients') unprefixed.
const API_BASE = '/api';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let accessToken = null;
let onAuthFailure = () => {};

function setAccessToken(token) {
  accessToken = token;
}

function setOnAuthFailure(fn) {
  onAuthFailure = fn;
}

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new ApiError(res.status, 'Session expired');
  const data = await res.json();
  accessToken = data.accessToken;
  return accessToken;
}

async function request(path, { method = 'GET', body, retry = true } = {}) {
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const opts = { method, credentials: 'include', headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);

  const isAuthEndpoint = path === '/auth/login' || path === '/auth/refresh';
  if (res.status === 401 && retry && !isAuthEndpoint) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, retry: false });
    } catch {
      onAuthFailure();
      throw new ApiError(401, 'Session expired -- please log in again');
    }
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const message =
      (data && data.error && data.error.message) || res.statusText || 'Request failed';
    throw new ApiError(res.status, message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError, setAccessToken, setOnAuthFailure, refreshAccessToken };
