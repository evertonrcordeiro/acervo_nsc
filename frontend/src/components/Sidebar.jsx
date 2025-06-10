import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav className="space-y-4">
        <Link to="/dashboard" className="block hover:bg-gray-700 p-2 rounded">Home</Link>
        <Link to="/midias" className="block hover:bg-gray-700 p-2 rounded">Mídias</Link>
        <Link to="/usuarios" className="block hover:bg-gray-700 p-2 rounded">Usuários</Link>
        <Link to="/configuracoes" className="block hover:bg-gray-700 p-2 rounded">Configurações</Link>
      </nav>
    </aside>
  );
}
