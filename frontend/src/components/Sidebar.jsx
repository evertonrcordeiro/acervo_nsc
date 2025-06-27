import { useDashboard } from '../context/DashboardContext';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const { mostrarHome, mostrarMidias, mostrarNormalizacao, CadastrarMidia } = useDashboard();

  const linkClasses =
    'block w-full text-left hover:bg-gray-700 p-2 rounded transition';

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav className="space-y-4">
        <button onClick={mostrarHome} className={linkClasses}>
          Home
        </button>
        <button onClick={mostrarMidias} className={linkClasses}>
          Mídias
        </button>
        <button onClick={mostrarNormalizacao} className={linkClasses}>
          Normalização
        </button>
        <button onClick={CadastrarMidia} className={linkClasses}>
          Cadastro De Mídias
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
