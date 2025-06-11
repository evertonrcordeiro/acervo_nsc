import { createContext, useContext, useState, useEffect } from 'react';
import { setLogout } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  let inactivityTimeout = null;
  let refreshInterval = null;

  // Recupera tokens salvos ao iniciar
  useEffect(() => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const nome = localStorage.getItem('usuario_nome');
    const loginHorario = localStorage.getItem('login_horario');

    if (access && refresh) {
      setUser({ accessToken: access, nome, loginHorario });
      startTokenRefresh(); // começa a renovação automática
      startInactivityWatcher(); // começa a vigiar inatividade
    }
  }, []);

  const login = (tokens, userInfo) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('usuario_nome', userInfo.nome);
    localStorage.setItem('login_horario', userInfo.loginHorario);

    setUser({
      accessToken: tokens.access,
      nome: userInfo.nome,
      loginHorario: userInfo.loginHorario,
    });

    startTokenRefresh();
    startInactivityWatcher();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario_nome');
    localStorage.removeItem('login_horario');
    setUser(null);
    clearInterval(refreshInterval);
    clearTimeout(inactivityTimeout);
  };

  // Renova token a cada 25 minutos
  const startTokenRefresh = () => {
    clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return logout();

      try {
        const res = await fetch('http://localhost:8000/api/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });

        if (!res.ok) throw new Error('Token expirado');
        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        setUser((prev) => ({ ...prev, accessToken: data.access }));
      } catch {
        logout();
      }
    }, 25 * 60 * 1000); // a cada 25 minutos
  };

  // Reseta contador de inatividade a cada evento do usuário
  const startInactivityWatcher = () => {
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        logout(); // 30 min sem interação
      }, 30 * 60 * 1000); // 30 minutos
    };

    ['click', 'keydown', 'mousemove'].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // inicia o contador

    return () => {
      ['click', 'keydown', 'mousemove'].forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(inactivityTimeout);
    };
  };

  useEffect(() => {
    setLogout(logout);
  }, []);

  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
