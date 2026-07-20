export type UserStatus = "ACTIVE" | "INACTIVE" | "INVITED";

export type Permission = {
  id: string;
  key: string;
  description: string | null;
};

export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  theme: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  role: Role | null;
};

export type UsersListResponse = {
  data: ManagedUser[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type UsersQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus | "";
  roleId?: string;
};
