export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  theme: string;
  locale: string;
  status: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
