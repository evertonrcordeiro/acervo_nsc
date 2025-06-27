import { useEffect, useState } from 'react';
import LoadingSkeleton from './_LoadingSkeleton';
import ErrorMessage from './_ErrorMessage';
import Paginacao from './_Paginacao';

export default function ListaMidias() {
  // Estados principais
  const [midias, setMidias] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [resumo, setResumo] = useState('');
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState('');

  // Estados para paginação e filtro
  const [currentUrl, setCurrentUrl] = useState('http://localhost:8000/api/midias/');
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Filtros adicionais
  const [idLocal, setIdLocal] = useState('');
  const [idPrograma, setIdPrograma] = useState('');
  const [dataInclusaoAfter, setDataInclusaoAfter] = useState('');
  const [dataInclusaoBefore, setDataInclusaoBefore] = useState('');

  // Dados para selects de filtro
  const [locais, setLocais] = useState([]);
  const [programas, setProgramas] = useState([]);

  // Paginação detalhada
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Contadores e filtros de tipo resultado
  const [countOr, setCountOr] = useState(0);
  const [countAnd, setCountAnd] = useState(0);
  const [countPorTermo, setCountPorTermo] = useState({});
  const [filtroTipoResultado, setFiltroTipoResultado] = useState('todos'); // 'todos', 'ou', 'e'

  // --- Função para construir URL com parâmetros de filtro/paginação ---
  const construirUrl = (
    page = 1,
    search = filtro,
    tipoResultado = filtroTipoResultado,
    local = idLocal,
    programa = idPrograma,
    after = dataInclusaoAfter,
    before = dataInclusaoBefore
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

    return baseUrl + (params.toString() ? `?${params.toString()}` : '');
  };

  // --- Buscar locais e programas para filtros ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const fetchLocais = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/locais/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLocais(data.results || data);
        }
      } catch (e) {
        // Opcional: log ou tratamento
      }
    };

    const fetchProgramas = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/programas/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProgramas(data.results || data);
        }
      } catch (e) {
        // Opcional: log ou tratamento
      }
    };

    fetchLocais();
    fetchProgramas();
  }, []);

  // --- Buscar mídias (listagem) sempre que currentUrl muda ---
  useEffect(() => {
    const fetchMidias = async () => {
      setLoading(true);
      setErro('');
      setMidias([]);
      setCountOr(0);
      setCountAnd(0);
      setCountPorTermo({});
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(currentUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro ao buscar mídias');

        const data = await response.json();

        if (data.results) {
          setMidias(data.results);
          setNextUrl(data.next);
          setPrevUrl(data.previous);
          setTotalPages(Math.ceil((data.count || 0) / pageSize));

          const urlObj = new URL(currentUrl);
          const page = urlObj.searchParams.get('page');
          setCurrentPage(page ? parseInt(page, 10) : 1);

          setCountOr(data.count_or || 0);
          setCountAnd(data.count_and || 0);
          setCountPorTermo(data.count_por_termo || {});
        } else {
          setErro('Formato de resposta inválido');
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMidias();
  }, [currentUrl]);

  // --- Atualizar URL ao mudar filtros ---
  useEffect(() => {
    setCurrentUrl(
      construirUrl(
        1,
        filtro,
        filtroTipoResultado,
        idLocal,
        idPrograma,
        dataInclusaoAfter,
        dataInclusaoBefore
      )
    );
  }, [filtro, filtroTipoResultado, idLocal, idPrograma, dataInclusaoAfter, dataInclusaoBefore]);

  // --- Buscar resumo ao selecionar mídia ---
  useEffect(() => {
    if (!selectedMidia) {
      setResumo('');
      setErroResumo('');
      setLoadingResumo(false);
      return;
    }

    const fetchResumo = async () => {
      setLoadingResumo(true);
      setErroResumo('');
      setResumo('');
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(
          `http://localhost:8000/api/resumos/por_documento/?cod_documento=${selectedMidia.cod_documento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 404) {
          setResumo('Resumo ainda não foi cadastrado.');
          setLoadingResumo(false);
          return;
        }

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

  // --- Handlers para busca e paginação ---
  const handleBuscar = () => {
    setCurrentUrl(
      construirUrl(
        1,
        filtro,
        filtroTipoResultado,
        idLocal,
        idPrograma,
        dataInclusaoAfter,
        dataInclusaoBefore
      )
    );
  };

  const handlePularPagina = () => {
    if (currentPage >= 1 && currentPage <= totalPages) {
      setCurrentUrl(
        construirUrl(
          currentPage,
          filtro,
          filtroTipoResultado,
          idLocal,
          idPrograma,
          dataInclusaoAfter,
          dataInclusaoBefore
        )
      );
    }
  };

  // midiasFiltradas = midias pois a API já filtra no backend
  const midiasFiltradas = midias;

  return (
    <div className="p-4 max-w-4xl mx-auto flex flex-col min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
        Lista de Mídias
      </h2>

      {/* Filtros e busca */}
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          placeholder="Buscar por título, código ou fita..."
          className="flex-grow p-2 border rounded shadow-sm min-w-[180px]"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          aria-label="Campo de busca"
        />

        <select
          value={idLocal}
          onChange={(e) => setIdLocal(e.target.value)}
          className="p-2 border rounded shadow-sm"
          aria-label="Filtro por local"
        >
          <option value="">Todos os locais</option>
          {locais.map((local) => (
            <option key={local.id} value={local.id}>
              {local.nome}
            </option>
          ))}
        </select>

        <select
          value={idPrograma}
          onChange={(e) => setIdPrograma(e.target.value)}
          className="p-2 border rounded shadow-sm"
          aria-label="Filtro por programa"
        >
          <option value="">Todos os programas</option>
          {programas.map((prog) => (
            <option key={prog.id} value={prog.id}>
              {prog.nome}
            </option>
          ))}
        </select>

        <div className="flex flex-col text-xs">
          <label htmlFor="data-inclusao-after" className="mb-1">
            Data Inclusão (de)
          </label>
          <input
            type="date"
            id="data-inclusao-after"
            value={dataInclusaoAfter}
            onChange={(e) => setDataInclusaoAfter(e.target.value)}
            className="p-1 border rounded shadow-sm"
            aria-label="Data de inclusão a partir de"
          />
        </div>

        <div className="flex flex-col text-xs">
          <label htmlFor="data-inclusao-before" className="mb-1">
            Data Inclusão (até)
          </label>
          <input
            type="date"
            id="data-inclusao-before"
            value={dataInclusaoBefore}
            onChange={(e) => setDataInclusaoBefore(e.target.value)}
            className="p-1 border rounded shadow-sm"
            aria-label="Data de inclusão até"
          />
        </div>

        <button
          onClick={handleBuscar}
          className="bg-blue-700 text-white px-4 rounded hover:bg-blue-800 transition whitespace-nowrap"
          disabled={loading}
          aria-label="Botão buscar"
        >
          Buscar
        </button>
      </div>

      {/* Resultados e filtros tipo resultado */}
      {filtro.trim() && (
        <section
          className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-h-64 overflow-y-auto"
          aria-label="Informações dos resultados"
        >
          <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
            <div className="flex gap-6 text-sm text-gray-700 font-semibold">
              <div>
                Resultados <span className="text-blue-700">OU:</span>{' '}
                <span className="text-blue-900">{countOr.toLocaleString()}</span>
              </div>
              <div>
                Resultados <span className="text-green-700">E:</span>{' '}
                <span className="text-green-900">{countAnd.toLocaleString()}</span>
              </div>
              <div>
                Total exibido:{' '}
                <span className="text-gray-900">{midiasFiltradas.length.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 text-sm" role="group" aria-label="Filtro tipo resultado">
              {['todos', 'ou', 'e'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipoResultado(tipo)}
                  className={`px-3 py-1 rounded font-medium ${
                    filtroTipoResultado === tipo
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-pressed={filtroTipoResultado === tipo}
                  type="button"
                >
                  {tipo === 'todos' ? 'Todos' : tipo.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-2">Resultados por termo:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 max-h-40 overflow-y-auto border rounded border-gray-300 p-3 bg-gray-50">
              {Object.entries(countPorTermo).length === 0 && (
                <p className="text-gray-500 col-span-full text-center">Nenhum termo encontrado</p>
              )}
              {Object.entries(countPorTermo).map(([termo, campos]) => (
                <div
                  key={termo}
                  className="bg-white p-2 rounded shadow-sm border border-gray-200"
                  aria-label={`Termo ${termo}`}
                >
                  <p className="font-semibold mb-1 text-blue-700">{termo}</p>
                  <ul className="text-xs text-gray-600 leading-tight space-y-0.5">
                    {Object.entries(campos).map(([campo, valor]) => (
                      <li key={campo}>
                        <span className="capitalize">{campo}</span>: {valor.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Estado carregando, erro e lista */}
      {loading && <LoadingSkeleton count={6} />}
      {erro && <ErrorMessage message={erro} />}
      {!loading && !erro && midiasFiltradas.length === 0 && (
        <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>
      )}

      {!loading && !erro && midiasFiltradas.length > 0 && (
        <ul className="space-y-2 flex-grow overflow-auto">
          {midiasFiltradas.map((midia) => {
            const isSelected = selectedMidia?.cod_documento === midia.cod_documento;
            return (
              <li
                key={midia.cod_documento}
                className="border border-gray-300 rounded-lg p-3 shadow-sm transition bg-white"
              >
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setSelectedMidia(isSelected ? null : midia)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedMidia(isSelected ? null : midia);
                    }
                  }}
                  aria-expanded={isSelected}
                  aria-controls={`detalhes-midia-${midia.cod_documento}`}
                >
                  <div>
                    <div className="flex justify-between items-center w-full">
                      <div className="text-sm sm:text-base font-medium text-blue-800">
                        Doc.: <strong>{midia.cod_documento}</strong> – Fita:{' '}
                        <strong>{midia.num_fita}</strong>
                      </div>
                      <div className="text-sm sm:text-base font-medium text-blue-800 text-right min-w-[550px]">
                        Data Inclusão: <strong>{midia.data_inclusao}</strong>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{midia.titulo}</p>
                  </div>

                  <div className="text-sm text-blue-600 hover:underline self-center">
                    {isSelected ? 'Ocultar' : 'Detalhes'}
                  </div>
                </div>

                {isSelected && (
                  <div
                    id={`detalhes-midia-${midia.cod_documento}`}
                    className="mt-3 border-t pt-3 text-sm text-gray-800 space-y-1"
                  >
                    <p>
                      <strong>Data de Inclusão:</strong> {midia.data_inclusao}
                    </p>
                    <p>
                      <strong>Local:</strong> {midia.id_local?.nome || 'Não informado'}
                    </p>
                    <p>
                      <strong>Resumo:</strong>{' '}
                      {loadingResumo ? 'Carregando...' : erroResumo ? erroResumo : resumo}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs">
                        Ver mídia
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs">
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Paginação com botões anterior/próximo */}
      <Paginacao
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        onPrev={() => prevUrl && setCurrentUrl(prevUrl)}
        onNext={() => nextUrl && setCurrentUrl(nextUrl)}
        loading={loading}
      />

      {/* Entrada para pular página específica */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4 gap-4">
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePularPagina()}
            className="w-20 p-1 border rounded text-center"
            aria-label="Número da página"
          />
        </div>
      )}
    </div>
  );
}
