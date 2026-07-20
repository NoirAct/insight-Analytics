import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshAccessToken() {
  try {
    const { data } = await axios.post<{ accessToken: string }>(
      "/api/auth/refresh",
      {},
      { withCredentials: true },
    );
    accessToken = data.accessToken;
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthRoute = original?.url?.includes("/auth/login")
      || original?.url?.includes("/auth/register")
      || original?.url?.includes("/auth/refresh")
      || original?.url?.includes("/auth/forgot-password")
      || original?.url?.includes("/auth/reset-password");

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    original._retry = true;

    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    if (!token) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);
