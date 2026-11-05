import { useNavigate } from "react-router-dom";
import { Header } from "../../../components/Header";
import { RegisterForm } from '../components/RegisterForm';
import { useTheme } from "../../../context/useTheme";

const Register = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`auth-page${isDark ? " is-dark" : ""}`}>
      <Header
        variant="landing"
        loginLabel="Volver al panel"
        isDark={isDark}
        onLogin={() => navigate("/")}
        onToggleTheme={toggleTheme}
      />
      <RegisterForm />
    </div>
  );
};

export default Register