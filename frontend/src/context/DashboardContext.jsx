import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [view, setView] = useState('home');

  const mostrarMidias = () => setView('midias');
  const mostrarHome = () => setView('home');
  const mostrarNormalizacao = () => setView('normalizacao')

  return (
    <DashboardContext.Provider value={{ view, mostrarMidias, mostrarHome, mostrarNormalizacao }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
