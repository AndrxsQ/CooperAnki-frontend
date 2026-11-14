import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Dashboard from '../features/territorial/pages/Dashboard';
import DetailedView from '../features/territorial/pages/DetailedView';
import EconomicUnitProfile from '../features/economic-units/pages/EconomicUnitProfile';
import Login from '../features/auth/pages/Login';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import EmailConfirmation from '../features/auth/pages/EmailConfirmation';
import Register from '../features/auth/pages/Register';
import { ProjectWizard } from '../features/projects/components/ProjectWizard';
import CooperationHome from '../features/projects/pages/CooperationHome';
import Landing from '../features/landing/pages/Landing';
import CallProposal from '../features/calls/pages/CallProposal';
import Searching from '../features/calls/pages/Searching';
import ConvocatoriasCatalog from '../features/calls/pages/ConvocatoriasCatalog';
import Payments from '../features/calls/pages/Payments';
import { ProtectedRoute, RolNotEnabled } from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';
import LegalClients from '../features/legal-management/pages/LegalClients';
import LegalCases from '../features/legal-management/pages/LegalCases';
import LegalHome from '../features/legal-management/pages/LegalHome';
import Survey from '../features/surveys/pages/Survey';
import SurveyAdmin from '../features/surveys/pages/SurveyAdmin';
import ClientLayout from '../features/client-account/components/ClientLayout';
import ClientAccount from '../features/client-account/pages/ClientAccount';
import ClientLegalInformation from '../features/client-account/pages/ClientLegalInformation';
import { useAuth } from '../context/useAuth';
import { getDefaultHome } from '../config/subsystems';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// La raíz redirige al subsistema predeterminado del rol autenticado.
const RoleRedirect = () => {
  const { user } = useAuth();
  const home = getDefaultHome(user?.role);

  if (!home) {
    return <RolNotEnabled />;
  }

  return <Navigate to={home} replace />;
};

const NotFound = () => (
  <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950">
    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
      Página no encontrada (404)
    </h2>
  </main>
);

export const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/email-confirmation" element={<EmailConfirmation />}/>
        <Route path="/survey" element={<Survey />}/>
        <Route path="/landing" element={<Landing />}/>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleRedirect />}/>

          {/* Subsistema 1: Sistema de cooperación */}
          <Route element={<ProtectedRoute subsystem="COOPERATION" />}>
            <Route element={<MainLayout />}>
              <Route path="/cooperacion" element={<CooperationHome />}/>
              <Route path="/cooperacion/convocatorias" element={<Searching />}/>
              <Route path="/cooperacion/convocatorias/catalogo" element={<ConvocatoriasCatalog />}/>
              <Route path="/cooperacion/propuestas" element={<CallProposal />}/>
              <Route path="/cooperacion/pagos" element={<Payments />}/>
              <Route path="/cooperacion/proyectos/nuevo" element={<ProjectWizard />}/>
              <Route path="/cooperacion/proyectos/:id/editar" element={<ProjectWizard />}/>
            </Route>
          </Route>

          {/* Subsistema 2: Sistema de gestión de información */}
          <Route element={<ProtectedRoute subsystem="INFORMATION" />}>
            <Route element={<MainLayout />}>
              <Route path="/informacion" element={<Dashboard />}/>
              <Route path="/informacion/territorio" element={<DetailedView />}/>
              <Route path="/informacion/unidades/:id" element={<EconomicUnitProfile mode="territorial" />}/>
              <Route path="/informacion/juridica" element={<LegalHome />}/>
              <Route path="/informacion/juridica/clientes" element={<LegalClients />}/>
              <Route path="/informacion/juridica/clientes/:id" element={<EconomicUnitProfile mode="legal" />}/>
              <Route path="/informacion/juridica/expedientes/*" element={<LegalCases />}/>
            </Route>
          </Route>

          {/* Subsistema 3: Sistema de cuenta personal */}
          <Route element={<ProtectedRoute subsystem="ACCOUNT" />}>
            <Route element={<ClientLayout />}>
              <Route path="/cuenta" element={<ClientAccount />} />
              <Route path="/cuenta/informacion-juridica" element={<ClientLegalInformation />} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/cuenta/cuentas" element={<Register />} />
                <Route path="/cuenta/encuestas" element={<SurveyAdmin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};
