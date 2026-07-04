import axios from 'axios';

// Phase 1 runs fully on mock data (see characters.ts). When auth lands,
// flip this off and the axios client below talks to the real API with a
// Clerk Bearer token attached by the request interceptor.
export const USE_MOCK = true;

const BASE_URL = 'https://lunastories-dev-api.cortexlumora.com/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  // TODO(auth phase): attach the Clerk session token.
  // const token = await getClerkToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The API wraps payloads in { data, message, error } — unwrap like the
// Swift APIClient's APIEnvelope does.
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message;
    return Promise.reject(new Error(message));
  },
);
