import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ListaMidias from '../components/ListaMidias';
import Normalizacao from '../components/Normalizacao'; // importe o componente novo
import { useDashboard } from '../context/DashboardContext';

export default function Dashboard() {
  const { view } = useDashboard();

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar fixa no topo */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Navbar />
      </div>

      <div className="flex flex-1 pt-16"> {/* pt-16 para compensar altura do Navbar */}
        {/* Sidebar fixa */}
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-10">
          <Sidebar />
        </div>

        {/* Conteúdo com rolagem */}
        <main className="ml-64 mt-0 flex-1 bg-gray-100 p-6 overflow-auto h-[calc(100vh-4rem)]">
          {view === 'home' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard</h2>
              <p>Use o menu ou o botão acima para navegar.</p>
            </div>
          )}
          {view === 'midias' && <ListaMidias />}
          {view === 'normalizacao' && <Normalizacao />}
        </main>
      </div>
    </div>
  );
}
