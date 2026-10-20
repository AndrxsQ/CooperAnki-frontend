import { Routes, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Landing from '../pages/Landing';
import CallProposal from '../pages/CallProposal';
import Searching from '../pages/Searching';
import Payments from '../pages/Payments';
import { ProtectedRoute } from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Única ruta pública */}
      <Route path="/" element={<Dashboard />}/>

      <Route element={<ProtectedRoute />}>
        <Route path="/landing" element={<Landing />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>

        <Route element={<MainLayout />}>
          <Route path="/callProposal" element={<CallProposal />}/>
          <Route path="/searching" element={<Searching />}/>
          <Route path="/payments" element={<Payments />}/>
        </Route>

        <Route path="*" element={<h2>Página no encontrada (404)</h2>} />
      </Route>
    </Routes>
  );
};
