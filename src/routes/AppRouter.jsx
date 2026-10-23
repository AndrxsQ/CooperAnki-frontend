import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Dashboard from '../pages/Dashboard';
import DetailedView from '../pages/DetailedView';
import EconomicUnitProfile from '../pages/EconomicUnitProfile';
import Login from '../pages/Login';
import Landing from '../pages/Landing';
import CallProposal from '../pages/CallProposal';
import Searching from '../pages/Searching';
import Payments from '../pages/Payments';
import { ProtectedRoute } from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';
import PublicDashboardLayout from '../components/PublicDashboardLayout';
import LegalClients from '../pages/LegalClients';
import LegalCases from '../pages/LegalCases';
import LegalHome from '../pages/LegalHome';
import Survey from '../pages/Survey';

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
