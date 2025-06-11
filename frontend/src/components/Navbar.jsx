import { useDashboard } from '../context/DashboardContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { mostrarMidias } = useDashboard();
  const [usuario, setUsuario] = useState('');
  const [loginHorario, setLoginHorario] = useState('');

  useEffect(() => {
    const nome = localStorage.getItem('usuario_nome');
    const horario = localStorage.getItem('login_horario');

    if (nome) setUsuario(nome);
    if (horario) {
      const dataFormatada = new Date(horario).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
      setLoginHorario(dataFormatada);
    }
  }, []);

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Painel Administrativo</h1>

      <div className="flex items-center gap-10">
        <div className="text-sm text-right leading-tight">
          <p className="font-semibold">{usuario}</p>
          <p className="text-xs text-gray-200">Login: {loginHorario}</p>
        </div>

        <button
          onClick={mostrarMidias}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
        >
          Ver Mídias
        </button>
      </div>
    </header>
  );
}
