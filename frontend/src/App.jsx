import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListaMidias from './components/ListaMidias';
import Normalizacao from './components/Normalizacao';
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/midias"
        element={
          <PrivateRoute>
            <ListaMidias />
          </PrivateRoute>
        }
      />
      <Route
        path="/normalizacao"
        element={
          <PrivateRoute>
            <Normalizacao />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
