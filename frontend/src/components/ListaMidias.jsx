import { useEffect, useState } from 'react';
import useFiltroMidias from '../hooks/useFiltroMidias';
import LoadingSkeleton from './_LoadingSkeleton';
import ErrorMessage from './_ErrorMessage';
import Paginacao from './_Paginacao';
import useResumoMidia from '../hooks/useResumoMidia';
import useLocaisProgramas from '../hooks/useLocaisProgramas';

export default function ListaMidias() {
  // Hook de filtros e paginação
  const {
    filtro, setFiltro,
    idLocal, setIdLocal,
    idPrograma, setIdPrograma,
    dataInclusaoAfter, setDataInclusaoAfter,
    dataInclusaoBefore, setDataInclusaoBefore,
    ordenarPor, setOrdenarPor,
    ordem, setOrdem,
    filtroTipoResultado, setFiltroTipoResultado,
    currentUrl, setCurrentUrl,
    currentPage, totalPages, setTotalPages,
    construirUrl, atualizarUrl,
    limparFiltros
  } = useFiltroMidias({ pageSize: 10 });

  // Dados e estados
  const [midias, setMidias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [selectedMidia, setSelectedMidia] = useState(null);
  const { resumo, loadingResumo, erroResumo } = useResumoMidia(selectedMidia);
  const { locais, programas } = useLocaisProgramas();

  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  const [countOr, setCountOr] = useState(0);
  const [countAnd, setCountAnd] = useState(0);
  const [countPorTermo, setCountPorTermo] = useState({});

  // Buscar mídias quando currentUrl muda
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const fetchMidias = async () => {
      setLoading(true);
      setErro('');
      setMidias([]);
      try {
        const response = await fetch(currentUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar mídias');

        const data = await response.json();
        setMidias(data.results || []);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
        setTotalPages(Math.ceil((data.count || 0) / 10));
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
  }, [currentUrl, setTotalPages]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Lista de Mídias</h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          placeholder="Buscar..."
          className="flex-grow p-2 border rounded"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && atualizarUrl(1)}
        />

        <select value={idLocal} onChange={e => setIdLocal(e.target.value)} className="p-2 border rounded">
          <option value="">Todos os locais</option>
          {locais.map(l => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </select>

        <select value={idPrograma} onChange={e => setIdPrograma(e.target.value)} className="p-2 border rounded">
          <option value="">Todos os programas</option>
          {programas.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <input type="date" value={dataInclusaoAfter} onChange={e => setDataInclusaoAfter(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={dataInclusaoBefore} onChange={e => setDataInclusaoBefore(e.target.value)} className="p-2 border rounded" />

        <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} className="p-2 border rounded">
          <option value="">Ordenar por</option>
          <option value="data_inclusao">Data de inclusão</option>
          <option value="id_local">Local</option>
          <option value="id_programa">Programa</option>
        </select>

        <select value={ordem} onChange={e => setOrdem(e.target.value)} className="p-2 border rounded">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        <select value={filtroTipoResultado} onChange={e => setFiltroTipoResultado(e.target.value)} className="p-2 border rounded max-w-[100px]">
          <option value="todos">Todos</option>
          <option value="ou">OU</option>
          <option value="e">E</option>
        </select>

        <button onClick={() => atualizarUrl(1)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Buscar
        </button>
        <button onClick={limparFiltros} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
          Limpar Filtros
        </button>
      </div>

      {/* Tipo de resultado info */}
      <div className="mb-4 flex gap-4 text-sm text-gray-700">
        <div>Resultados (OU): {countOr}</div>
        <div>Resultados (E): {countAnd}</div>
      </div>

      {/* Paginação acima */}
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
        <Paginacao
          prevUrl={prevUrl}
          nextUrl={nextUrl}
          onPrev={() => prevUrl && setCurrentUrl(prevUrl)}
          onNext={() => nextUrl && setCurrentUrl(nextUrl)}
          loading={loading}
        />
      </div>

      {/* Erro */}
      {erro && <ErrorMessage message={erro} />}

      {/* Loading */}
      {loading && <LoadingSkeleton count={6} />}

      {/* Lista vazia */}
      {!loading && !erro && midias.length === 0 && <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>}

      {/* Lista mídias */}
      <ul className="space-y-2">
        {midias.map(midia => {
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
                  <p><strong>Programa:</strong> {midia.id_programa?.nome || '—'}</p>
                  <p><strong>Resumo:</strong> {loadingResumo ? 'Carregando...' : erroResumo ? erroResumo : resumo}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Paginação abaixo */}
      <div className="mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
        <Paginacao
          prevUrl={prevUrl}
          nextUrl={nextUrl}
          onPrev={() => prevUrl && setCurrentUrl(prevUrl)}
          onNext={() => nextUrl && setCurrentUrl(nextUrl)}
          loading={loading}
        />
      </div>

      {/* Jump to page */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <span>Página {currentPage} de {totalPages}</span>
          <input
            type="number"
            value={currentPage}
            min="1"
            max={totalPages}
            onChange={e => {
              const novaPagina = Number(e.target.value);
              if (!isNaN(novaPagina) && novaPagina >= 1 && novaPagina <= totalPages) {
                setCurrentPage(novaPagina);
                const novaUrl = construirUrl(novaPagina);
                setCurrentUrl(novaUrl);
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const novaPagina = Number(e.currentTarget.value);
                if (!isNaN(novaPagina) && novaPagina >= 1 && novaPagina <= totalPages) {
                  setCurrentPage(novaPagina);
                  const novaUrl = construirUrl(novaPagina);
                  setCurrentUrl(novaUrl);
                }
              }
            }}
            className="p-1 border rounded w-20 text-center"
          />
        </div>
      )}
    </div>
  );
}
