export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav className="space-y-4">
        <a href="/dashboard" className="block hover:bg-gray-700 p-2 rounded">Dashboard</a>
        <a href="/usuarios" className="block hover:bg-gray-700 p-2 rounded">Usuários</a>
        <a href="/configuracoes" className="block hover:bg-gray-700 p-2 rounded">Configurações</a>
      </nav>
    </aside>
  );
}
