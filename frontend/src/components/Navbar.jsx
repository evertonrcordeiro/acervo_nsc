import { useDashboard } from '../context/DashboardContext';

export default function Navbar() {
  const { mostrarMidias } = useDashboard();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Painel Administrativo</h1>
      <button
        onClick={mostrarMidias}
        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
      >
        Ver Mídias
      </button>
    </header>
  );
}
