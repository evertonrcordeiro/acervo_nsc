import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;



// import { Navigate } from 'react-router-dom';

// export default function PrivateRoute({ children }) {
//   const isAuthenticated = !!localStorage.getItem('access_token'); // corrigido para a chave certa

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }