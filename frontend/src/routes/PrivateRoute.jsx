import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('access_token'); // corrigido para a chave certa

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}