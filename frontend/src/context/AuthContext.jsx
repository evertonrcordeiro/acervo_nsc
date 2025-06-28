import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setLogout } from '../api/api';

const AuthContext = createContext();

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // <-- novo estado

  const inactivityTimeout = useRef(null);
  const refreshInterval = useRef(null);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario_nome');
    localStorage.removeItem('login_horario');
    setUser(null);
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
  };

  const startTokenRefresh = () => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    refreshInterval.current = setInterval(async () => {
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
    }, 25 * 60 * 1000);
  };

  const startInactivityWatcher = () => {
    const resetTimer = () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);
    };

    ['click', 'keydown', 'mousemove'].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      ['click', 'keydown', 'mousemove'].forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    };
  };

  useEffect(() => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const nome = localStorage.getItem('usuario_nome');
    const loginHorario = localStorage.getItem('login_horario');

    if (access && refresh) {
      const decoded = decodeJWT(access);
      const agora = Math.floor(Date.now() / 1000);
      console.log('Token decodificado:', decoded);
      console.log('Expira em:', decoded?.exp, 'Agora:', agora);

      if (decoded && decoded.exp && decoded.exp > agora) {
        console.log('Token válido, mantendo login');
        setUser({ accessToken: access, nome, loginHorario });
        startTokenRefresh();
        startInactivityWatcher();
      } else {
        console.log('Token inválido/expirado, fazendo logout');
        logout();
      }
    }
    setLoading(false);  // <-- sinaliza que terminou a checagem
  }, []);

  useEffect(() => {
    setLogout(logout);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
