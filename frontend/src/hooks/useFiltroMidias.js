import { useEffect, useState } from 'react';

export default function useFiltroMidias({ pageSize = 10, baseUrl = 'http://localhost:8000/api/midias/' }) {
  const [filtro, setFiltro] = useState('');
  const [idLocal, setIdLocal] = useState('');
  const [idPrograma, setIdPrograma] = useState('');
  const [dataInclusaoAfter, setDataInclusaoAfter] = useState('');
  const [dataInclusaoBefore, setDataInclusaoBefore] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('');
  const [ordem, setOrdem] = useState('desc');
  const [filtroTipoResultado, setFiltroTipoResultado] = useState('todos');

  const [currentUrl, setCurrentUrl] = useState(baseUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Garante que `page` nunca seja NaN
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
    const params = new URLSearchParams();

    if (search && search.trim() !== '') params.append('search', search.trim());
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

  // Garante que a URL inicial seja limpa
  useEffect(() => {
    setCurrentUrl(construirUrl(1));
  }, []);

  // Atualiza a página (ex: ao navegar)
  const atualizarUrl = (pagina = 1) => {
    const novaUrl = construirUrl(pagina);
    setCurrentUrl(novaUrl);
  };

  // Atualiza URL quando filtros mudam (mas mantém busca separada)
  useEffect(() => {
    atualizarUrl(1);
  }, [idLocal, idPrograma, dataInclusaoAfter, dataInclusaoBefore, ordenarPor, ordem, filtroTipoResultado]);

  useEffect(() => {
    try {
      const urlObj = new URL(currentUrl);
      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      setCurrentPage(isNaN(page) ? 1 : page);
    } catch (e) {
      setCurrentPage(1);
    }
  }, [currentUrl]);

  const limparFiltros = () => {
    setFiltro('');
    setIdLocal('');
    setIdPrograma('');
    setDataInclusaoAfter('');
    setDataInclusaoBefore('');
    setOrdenarPor('');
    setOrdem('asc');
    setFiltroTipoResultado('todos');
    setCurrentUrl(baseUrl);
  };

  return {
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
  };
}
