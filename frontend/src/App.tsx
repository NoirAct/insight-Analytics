import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import { AppHomePage } from "@/pages/AppHomePage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { FoundationPage } from "@/pages/FoundationPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

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
        <Route path="/app" element={<AppHomePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
