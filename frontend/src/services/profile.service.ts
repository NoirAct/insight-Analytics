import { api } from "@/api/client";
import type { User } from "@/types/auth";

export type SessionItem = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
  active: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type CompanySettings = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export const profileApi = {
  updateMe(data: {
    name?: string;
    email?: string;
    theme?: "dark" | "light";
    locale?: "pt-BR" | "en-US";
    currentPassword?: string;
    newPassword?: string;
  }) {
    return api.patch<{ user: User }>("/profile/me", data);
  },

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return api.post<{ user: User }>("/profile/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  listSessions() {
    return api.get<{ sessions: SessionItem[] }>("/profile/sessions");
  },

  revokeSession(id: string) {
    return api.delete<{ ok: boolean }>(`/profile/sessions/${id}`);
  },

  listNotifications() {
    return api.get<{ notifications: NotificationItem[] }>("/profile/notifications");
  },

  markNotificationRead(id: string) {
    return api.patch<{ notification: NotificationItem }>(
      `/profile/notifications/${id}/read`,
    );
  },

  getCompany() {
    return api.get<{ company: CompanySettings }>("/profile/company");
  },

  updateCompany(data: { name?: string }) {
    return api.patch<{ company: CompanySettings }>("/profile/company", data);
  },

  uploadCompanyLogo(file: File) {
    const form = new FormData();
    form.append("logo", file);
    return api.post<{ company: CompanySettings }>("/profile/company/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
