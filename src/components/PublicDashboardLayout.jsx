import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { Header } from "./Header";
import Sidebar from "./Sidebar";

const PublicDashboardLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showPublicGroups
      />

      <div className="ml-0 min-h-screen min-w-0 md:ml-64">
        <Header
          variant="landing"
          user={isAuthenticated ? user : null}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mx-auto grid max-w-screen-2xl gap-12 px-4 pb-8 pt-[92px] sm:px-6 md:gap-14 md:px-9 md:pt-28">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicDashboardLayout;
