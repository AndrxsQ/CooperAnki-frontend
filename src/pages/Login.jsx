import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { LoginForm } from "../components/LoginForm";
import { useTheme } from "../context/useTheme";

const Login = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`auth-page${isDark ? " is-dark" : ""}`}>
      <Header
        variant="landing"
        loginLabel="Crear cuenta"
        isDark={isDark}
        onLogin={() => navigate("/register")}
        onToggleTheme={toggleTheme}
      />
      <LoginForm />
    </div>
  );
};

export default Login