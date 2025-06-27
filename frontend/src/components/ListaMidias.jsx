import { useEffect, useState } from 'react';
import LoadingSkeleton from './_LoadingSkeleton';
import ErrorMessage from './_ErrorMessage';
import Paginacao from './_Paginacao';

export default function ListaMidias() {
  const [midias, setMidias] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [resumo, setResumo] = useState('');
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState('');

  const [currentUrl, setCurrentUrl] = useState('http://localhost:8000/api/midias/');
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [idLocal, setIdLocal] = useState('');
  const [idPrograma, setIdPrograma] = useState('');
  const [dataInclusaoAfter, setDataInclusaoAfter] = useState('');
  const [dataInclusaoBefore, setDataInclusaoBefore] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('');
  const [ordem, setOrdem] = useState('asc');

  const [locais, setLocais] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [countOr, setCountOr] = useState(0);
  const [countAnd, setCountAnd] = useState(0);
  const [countPorTermo, setCountPorTermo] = useState({});
  const [filtroTipoResultado, setFiltroTipoResultado] = useState('todos');

  const construirUrl = (
    page = 1,
    search = filtro,
    tipoResultado = filtroTipoResultado,
    local = idLocal,
    programa = idPrograma,
    after = dataInclusaoAfter,
    before = dataInclusaoBefore,
    ordenacao = ordenarPor,
    ordemDirecao = ordem
  ) => {
    const baseUrl = 'http://localhost:8000/api/midias/';
    const params = new URLSearchParams();

    if (search.trim()) params.append('search', search.trim());
    if (page > 1) params.append('page', page);
    if (tipoResultado && tipoResultado !== 'todos') params.append('tipo_resultado', tipoResultado);
    if (local) params.append('id_local', local);
    if (programa) params.append('id_programa', programa);
    if (after) params.append('data_inclusao_after', after);
    if (before) params.append('data_inclusao_before', before);
    if (ordenacao) {
      const campo = ordemDirecao === 'desc' ? `-${ordenacao}` : ordenacao;
      params.append('ordering', campo);
    }

    return baseUrl + (params.toString() ? `?${params.toString()}` : '');
  };

  const atualizarUrlSemBuscar = () => {
    const novaUrl = construirUrl(
      1,
      filtro, // este valor será o mesmo pois não mudamos
      filtroTipoResultado,
      idLocal,
      idPrograma,
      dataInclusaoAfter,
      dataInclusaoBefore,
      ordenarPor,
      ordem
    );
    setCurrentUrl(novaUrl);
  };

  // --- Carregar locais e programas ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const fetchLocais = async () => {
      const res = await fetch('http://localhost:8000/api/locais/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLocais(data.results || data);
      }
    };

    const fetchProgramas = async () => {
      const res = await fetch('http://localhost:8000/api/programas/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProgramas(data.results || data);
      }
    };

    fetchLocais();
    fetchProgramas();
  }, []);

  // --- Buscar mídias ao mudar URL ---
  useEffect(() => {
    const fetchMidias = async () => {
      setLoading(true);
      setErro('');
      setMidias([]);
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(currentUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro ao buscar mídias');

        const data = await response.json();
        setMidias(data.results || []);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
        setTotalPages(Math.ceil((data.count || 0) / pageSize));

        const urlObj = new URL(currentUrl);
        const page = urlObj.searchParams.get('page');
        setCurrentPage(page ? parseInt(page, 10) : 1);

        setCountOr(data.count_or || 0);
        setCountAnd(data.count_and || 0);
        setCountPorTermo(data.count_por_termo || {});
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMidias();
  }, [currentUrl]);

  // --- Buscar resumo ao clicar ---
  useEffect(() => {
    if (!selectedMidia) return setResumo('');

    const fetchResumo = async () => {
      setLoadingResumo(true);
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(
          `http://localhost:8000/api/resumos/por_documento/?cod_documento=${selectedMidia.cod_documento}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 404) return setResumo('Resumo ainda não foi cadastrado.');
        if (!response.ok) throw new Error('Erro ao buscar resumo');

        const data = await response.json();
        setResumo(data.resumo || 'Resumo não disponível');
      } catch (err) {
        setErroResumo(err.message);
      } finally {
        setLoadingResumo(false);
      }
    };

    fetchResumo();
  }, [selectedMidia]);

  // --- Atualizar automaticamente se filtros mudarem (exceto busca) ---
  useEffect(() => {
    atualizarUrlSemBuscar();
  }, [
    idLocal,
    idPrograma,
    dataInclusaoAfter,
    dataInclusaoBefore,
    ordenarPor,
    ordem,
    filtroTipoResultado,
  ]);

  const handleBuscar = () => {
    setCurrentUrl(
      construirUrl(
        1,
        filtro,
        filtroTipoResultado,
        idLocal,
        idPrograma,
        dataInclusaoAfter,
        dataInclusaoBefore,
        ordenarPor,
        ordem
      )
    );
  };

  const handleLimpar = () => {
    setFiltro('');
    setIdLocal('');
    setIdPrograma('');
    setDataInclusaoAfter('');
    setDataInclusaoBefore('');
    setOrdenarPor('');
    setOrdem('asc');
    setFiltroTipoResultado('todos');
    setCurrentUrl('http://localhost:8000/api/midias/');
  };

  const handlePularPagina = () => {
    setCurrentUrl(
      construirUrl(
        currentPage,
        filtro,
        filtroTipoResultado,
        idLocal,
        idPrograma,
        dataInclusaoAfter,
        dataInclusaoBefore,
        ordenarPor,
        ordem
      )
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Lista de Mídias</h2>

      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          placeholder="Buscar..."
          className="flex-grow p-2 border rounded"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
        />

        <select value={idLocal} onChange={(e) => setIdLocal(e.target.value)} className="p-2 border rounded">
          <option value="">Todos os locais</option>
          {locais.map((l) => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </select>

        <select value={idPrograma} onChange={(e) => setIdPrograma(e.target.value)} className="p-2 border rounded">
          <option value="">Todos os programas</option>
          {programas.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <input type="date" value={dataInclusaoAfter} onChange={(e) => setDataInclusaoAfter(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={dataInclusaoBefore} onChange={(e) => setDataInclusaoBefore(e.target.value)} className="p-2 border rounded" />

        <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="p-2 border rounded">
          <option value="">Ordenar por</option>
          <option value="data_inclusao">Data de inclusão</option>
          <option value="id_local">Local</option>
          <option value="id_programa">Programa</option>
        </select>

        <select value={ordem} onChange={(e) => setOrdem(e.target.value)} className="p-2 border rounded">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        <button onClick={handleBuscar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Buscar
        </button>
        <button onClick={handleLimpar} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
          Limpar Filtros
        </button>
        
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <label className="font-medium">Tipo de Resultado:</label>
        {['todos', 'ou', 'e'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipoResultado(tipo)}
            className={`px-3 py-1 rounded border ${
              filtroTipoResultado === tipo
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {tipo.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>
        <Paginacao
          prevUrl={prevUrl}
          nextUrl={nextUrl}
          onPrev={() => prevUrl && setCurrentUrl(prevUrl)}
          onNext={() => nextUrl && setCurrentUrl(nextUrl)}
          loading={loading}
        />
      </div>



      {erro && <ErrorMessage message={erro} />}
      {loading && <LoadingSkeleton count={6} />}
      {!loading && !erro && midias.length === 0 && <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>}

      <ul className="space-y-2">
        {midias.map((midia) => {
          const isSelected = selectedMidia?.cod_documento === midia.cod_documento;
          return (
            <li key={midia.cod_documento} className="border p-3 rounded bg-white shadow">
              <div onClick={() => setSelectedMidia(isSelected ? null : midia)} className="cursor-pointer">
                <div className="font-bold text-blue-800">
                  Doc: {midia.cod_documento} | Fita: {midia.num_fita}
                </div>
                <div className="text-sm text-gray-600">{midia.titulo}</div>
              </div>

              {isSelected && (
                <div className="mt-2 text-sm text-gray-800 border-t pt-2">
                  <p><strong>Data:</strong> {midia.data_inclusao}</p>
                  <p><strong>Local:</strong> {midia.id_local?.nome || '—'}</p>
                  <p><strong>Resumo:</strong> {loadingResumo ? 'Carregando...' : erroResumo ? erroResumo : resumo}</p>

                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Paginacao
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        onPrev={() => prevUrl && setCurrentUrl(prevUrl)}
        onNext={() => nextUrl && setCurrentUrl(nextUrl)}
        loading={loading}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <span>Página {currentPage} de {totalPages}</span>
          <input
            type="number"
            value={currentPage}
            min="1"
            max={totalPages}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handlePularPagina()}
            className="p-1 border rounded w-20 text-center"
          />
        </div>
      )}
    </div>
  );
}
