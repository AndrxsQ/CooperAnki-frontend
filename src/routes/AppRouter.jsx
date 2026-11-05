import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Dashboard from '../features/territorial/pages/Dashboard';
import DetailedView from '../features/territorial/pages/DetailedView';
import EconomicUnitProfile from '../features/economic-units/pages/EconomicUnitProfile';
import Login from '../features/auth/pages/Login';
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
        <Route path="/survey" element={<Survey />}/>
        <Route path="/survey-admin" element={<SurveyAdmin />}/>
        <Route element={<ProtectedRoute />}>
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
      </Routes>
    </>
  );
};
