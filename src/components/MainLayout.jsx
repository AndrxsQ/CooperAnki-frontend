import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { Header } from "./Header";
import Sidebar from "./Sidebar";
import { useToast } from "../context/useToast";
import { getUserFacingErrorMessage } from "../api/httpErrors";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      addToast({
        message: getUserFacingErrorMessage(
          error,
          "No fue posible cerrar la sesión en el servidor.",
        ),
      });
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="ml-0 min-h-screen md:ml-64">
        <Header
          user={user}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="p-6 md:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
