import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // Ou spinner, ou null, conforme preferir
  }

  return user ? children : <Navigate to="/login" replace />;
}
