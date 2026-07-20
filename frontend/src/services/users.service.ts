import { api } from "@/api/client";
import type {
  ManagedUser,
  Role,
  UsersListResponse,
  UsersQuery,
} from "@/types/users";

export const usersApi = {
  list(params: UsersQuery) {
    return api.get<UsersListResponse>("/users", { params });
  },

  getRoles() {
    return api.get<{ roles: Role[] }>("/users/roles");
  },

  create(data: {
    name: string;
    email: string;
    password: string;
    status: string;
    roleId?: string | null;
  }) {
    return api.post<{ user: ManagedUser }>("/users", data);
  },

  update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      status?: string;
      roleId?: string | null;
    },
  ) {
    return api.patch<{ user: ManagedUser }>(`/users/${id}`, data);
  },

  remove(id: string) {
    return api.delete<{ ok: boolean }>(`/users/${id}`);
  },

  uploadAvatar(id: string, file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return api.post<{ user: ManagedUser }>(`/users/${id}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
