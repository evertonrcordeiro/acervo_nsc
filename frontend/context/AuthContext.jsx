import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setTokens } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // Checa se tem token no localStorage ao montar o contexto
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: buscar dados do usuário usando o token
      setUser({}); // Pode chamar api para pegar user info
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      setTokens({ accessToken, refreshToken });
      setUser(user);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
