import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ListaMidias from '../components/ListaMidias';
import { useDashboard } from '../context/DashboardContext';

export default function Dashboard() {
  const { view } = useDashboard();

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          {view === 'home' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard</h2>
              <p>Use o menu ou o botão acima para navegar.</p>
            </div>
          )}
          {view === 'midias' && <ListaMidias />}
        </main>
      </div>
    </div>
  );
}
