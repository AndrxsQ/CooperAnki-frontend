import { Routes, Route } from 'react-router-dom';

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
      <Route path="/" element={<Landing />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/callProposal" element={<CallProposal />}/>
          <Route path="/searching" element={<Searching />}/>
          <Route path="/payments" element={<Payments />}/>
        </Route>
      </Route>

      <Route path="*" element={<h2>Página no encontrada (404)</h2>} />
    </Routes>
  );
};