import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Dashboard from '../features/territorial/pages/Dashboard';
import DetailedView from '../features/territorial/pages/DetailedView';
import EconomicUnitProfile from '../features/economic-units/pages/EconomicUnitProfile';
import Login from '../features/auth/pages/Login';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import EmailConfirmation from '../features/auth/pages/EmailConfirmation';
import Register from '../features/auth/pages/Register';
import { ProjectWizard } from '../features/projects/components/ProjectWizard';
import Landing from '../features/landing/pages/Landing';
import CallProposal from '../features/calls/pages/CallProposal';
import Searching from '../features/calls/pages/Searching';
import Payments from '../features/calls/pages/Payments';
import { ProtectedRoute } from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';
import PublicDashboardLayout from '../components/PublicDashboardLayout';
import LegalClients from '../features/legal-management/pages/LegalClients';
import LegalCases from '../features/legal-management/pages/LegalCases';
import LegalHome from '../features/legal-management/pages/LegalHome';
import Survey from '../features/surveys/pages/Survey';
import SurveyAdmin from '../features/surveys/pages/SurveyAdmin';
import ClientLayout from '../features/client-account/components/ClientLayout';
import ClientAccount from '../features/client-account/pages/ClientAccount';
import ClientLegalInformation from '../features/client-account/pages/ClientLegalInformation';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/email-confirmation" element={<EmailConfirmation />}/>
        <Route path="/survey" element={<Survey />}/>
        <Route path="/survey-admin" element={<SurveyAdmin />}/>
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedRoute requiredRole="CLIENT" />}>
            <Route element={<ClientLayout />}>
              <Route path="/account" element={<ClientAccount />} />
              <Route path="/account/legal-information" element={<ClientLegalInformation />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "EXECUTIVE"]} />}>
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/register" element={<Register />}/>
            </Route>

            <Route element={<ProtectedRoute requiredRole="ADMIN" requiredSystem="COOPERA" />}>
              <Route element={<PublicDashboardLayout />}>
                <Route path="/projects/new" element={<ProjectWizard />}/>
                <Route path="/projects/:id/edit" element={<ProjectWizard />}/>
              </Route>
            </Route>
            <Route element={<PublicDashboardLayout />}>
              <Route path="/" element={<Dashboard />}/>
              <Route path="/detailed-view" element={<DetailedView />}/>
              <Route path="/economic-units/:id" element={<EconomicUnitProfile mode="territorial" />}/>
              <Route path="/legal-management" element={<LegalHome />}/>
              <Route path="/legal-management/clients" element={<LegalClients />}/>
              <Route path="/legal-management/clients/:id" element={<EconomicUnitProfile mode="legal" />}/>
              <Route path="/legal-management/cases/*" element={<LegalCases />}/>
            </Route>
            <Route path="/landing" element={<Landing />}/>

            <Route element={<MainLayout />}>
              <Route path="/callProposal" element={<CallProposal />}/>
              <Route path="/searching" element={<Searching />}/>
              <Route path="/payments" element={<Payments />}/>
            </Route>

            <Route path="*" element={<h2>Página no encontrada (404)</h2>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};
