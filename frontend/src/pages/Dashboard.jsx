import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ListaMidias from '../components/ListaMidias';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p>Conteúdo principal aqui.</p>
          <ListaMidias />
        </main>
      </div>
    </div>
  );
}
