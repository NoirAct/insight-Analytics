import { api } from "@/api/client";
import type { AuthResponse, User } from "@/types/auth";

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return api.post<AuthResponse>("/auth/register", data);
  },

  login(data: { email: string; password: string; rememberMe?: boolean }) {
    return api.post<AuthResponse>("/auth/login", data);
  },

  refresh() {
    return api.post<AuthResponse>("/auth/refresh");
  },

  logout() {
    return api.post<{ ok: boolean }>("/auth/logout");
  },

  me() {
    return api.get<{ user: User }>("/auth/me");
  },

  forgotPassword(email: string) {
    return api.post<{
      message: string;
      resetToken?: string;
      resetUrl?: string;
    }>("/auth/forgot-password", { email });
  },

  resetPassword(token: string, password: string) {
    return api.post<{ message: string }>("/auth/reset-password", {
      token,
      password,
    });
  },
};
