import { useDashboard } from '../context/DashboardContext';

export default function Sidebar() {
  const { mostrarHome, mostrarMidias } = useDashboard();

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav className="space-y-4">
        <button
          onClick={mostrarHome}
          className="block w-full text-left hover:bg-gray-700 p-2 rounded"
        >
          Home
        </button>
        <button
          onClick={mostrarMidias}
          className="block w-full text-left hover:bg-gray-700 p-2 rounded"
        >
          Mídias
        </button>
        <button
          disabled
          className="block w-full text-left hover:bg-gray-700 p-2 rounded text-gray-400 cursor-not-allowed"
        >
          Usuários
        </button>
        <button
          disabled
          className="block w-full text-left hover:bg-gray-700 p-2 rounded text-gray-400 cursor-not-allowed"
        >
          Configurações
        </button>
      </nav>
    </aside>
  );
}
