import { useEffect, useState } from 'react';
import LoadingSpinner from './_LoadingSpinner';
import LoadingSkeleton from './_LoadingSkeleton';
import ErrorMessage from './_ErrorMessage';
import Modal from './Modal';

export default function ListaMidias() {
  const [midias, setMidias] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [resumo, setResumo] = useState('');
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState('');

  useEffect(() => {
    const fetchMidias = async () => {
      setLoading(true);
      setErro('');
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch('http://localhost:8000/api/midias/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar mídias');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setMidias(data);
        } else if (data.results) {
          setMidias(data.results);
        } else {
          setErro('Formato de resposta desconhecido');
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMidias();
  }, []);

  // Busca resumo sempre que selectedMidia muda
  useEffect(() => {
    if (!selectedMidia) {
      setResumo('');
      setErroResumo('');
      setLoadingResumo(false);
      return;
    }
    console.log('selectedMidia:', selectedMidia); // DEBUG: veja o conteúdo aqui

    const fetchResumo = async () => {
      setLoadingResumo(true);
      setErroResumo('');
      setResumo('');
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(
          `http://localhost:8000/api/resumos/?cod_documento=${selectedMidia.cod_documento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar resumo');
        }

        const data = await response.json();

        // Ajuste conforme o formato da sua API
        if (Array.isArray(data) && data.length > 0) {
          setResumo(data[0].resumo);
        } else if (data.resumo) {
          setResumo(data.resumo);
        } else {
          setResumo('Resumo não disponível');
        }
      } catch (err) {
        setErroResumo(err.message);
      } finally {
        setLoadingResumo(false);
      }
    };

    fetchResumo();
  }, [selectedMidia]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
        Lista de Mídias
      </h2>

      {loading && <LoadingSkeleton count={6} />}
      {erro && <ErrorMessage message={erro} />}

      {!loading && !erro && midias.length === 0 && (
        <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>
      )}

      {!loading && !erro && midias.length > 0 && (
        <ul className="space-y-4">
          {midias.map((midia) => (
            <li
              key={midia.cod_documento}
              className="border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gray-50 cursor-pointer select-none"
              title={midia.titulo}
              onClick={() => setSelectedMidia(midia)}
            >
              <h3 className="font-semibold text-xl text-blue-700 mb-1 truncate">
                {midia.titulo}
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Código:</strong> {midia.cod_documento}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Num. Fita:</strong> {midia.num_fita}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={!!selectedMidia} onClose={() => setSelectedMidia(null)}>
        {selectedMidia && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedMidia.titulo}</h2>
            <p>
              <strong>Código do Documento:</strong> {selectedMidia.cod_documento}
            </p>
            <p>
              <strong>Número da Fita:</strong> {selectedMidia.num_fita}
            </p>
            <p>
              <strong>Resumo:</strong>{' '}
              {loadingResumo
                ? 'Carregando...'
                : erroResumo
                ? erroResumo
                : resumo}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
