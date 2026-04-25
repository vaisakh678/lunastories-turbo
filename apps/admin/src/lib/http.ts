import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>): void {
  tokenProvider = fn;
}

http.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface APIEnvelope<T> {
  data?: T;
  message?: string;
  error?: string;
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await http.get<APIEnvelope<T>>(path, { params });
  if (res.data.error) throw new Error(res.data.error);
  if (res.data.data === undefined) throw new Error("Empty response");
  return res.data.data;
}
