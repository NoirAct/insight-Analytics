import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { FoundationPage } from "@/pages/FoundationPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { UsersPage } from "@/pages/users/UsersPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
