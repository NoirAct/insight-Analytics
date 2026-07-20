import {
  Boxes,
  FileSpreadsheet,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/users", label: "Usuários", icon: Users },
  { to: "/app/products", label: "Produtos", icon: Boxes },
  { to: "/app/reports", label: "Relatórios", icon: FileSpreadsheet },
  { to: "/app/settings", label: "Configurações", icon: Settings },
];

export const profileNav: NavItem = {
  to: "/app/profile",
  label: "Perfil",
  icon: UserRound,
};
