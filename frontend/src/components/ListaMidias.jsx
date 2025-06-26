import { useEffect, useState } from 'react';
import LoadingSkeleton from './_LoadingSkeleton';
import ErrorMessage from './_ErrorMessage';
import Modal from './Modal';
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch da lista de mídias
  useEffect(() => {
    const fetchMidias = async () => {
      setLoading(true);
      setErro('');
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch(currentUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Erro ao buscar mídias');

        const data = await response.json();

        if (data.results) {
          setMidias(data.results);
          setNextUrl(data.next);
          setPrevUrl(data.previous);

          const total = data.count || 0;
          setTotalPages(Math.ceil(total / pageSize));

          // Atualiza página atual a partir da URL
          const urlObj = new URL(currentUrl);
          const page = urlObj.searchParams.get('page');
          setCurrentPage(page ? parseInt(page) : 1);
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

  // Fetch do resumo
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 404) {
          setResumo('Resumo ainda não foi cadastrado.');
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
        Lista de Mídias
      </h2>

      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por título, código ou fita..."
          className="w-full p-2 border rounded shadow-sm"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCurrentUrl(`http://localhost:8000/api/midias/?search=${encodeURIComponent(filtro)}`);
            }
          }}
        />
      </div>

      {/* Lista ou mensagens */}
      {loading && <LoadingSkeleton count={6} />}
      {erro && <ErrorMessage message={erro} />}
      {!loading && !erro && midias.length === 0 && (
        <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>
      )}
      {!loading && !erro && midias.length > 0 && (
        <ul className="space-y-2">
          {midias.map((midia) => (
            <li
              key={midia.cod_documento}
              className="border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gray-50 cursor-pointer select-none"
              title={midia.titulo}
              onClick={() => setSelectedMidia(midia)}
            >
              <h3 className="font-semibold text-x text-blue-700 mb-1 truncate">
                Doc.: <strong>{midia.cod_documento}</strong> - Num. Fita: <strong>{midia.num_fita}</strong>
              </h3>
              <p className="text-sm text-gray-600">
                Data Inclusão: <strong>{midia.data_inclusao}</strong>
              </p>
              <p className="text-sm text-gray-600">{midia.titulo}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Controles de paginação */}
      <Paginacao
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        onPrev={() => setCurrentUrl(prevUrl)}
        onNext={() => setCurrentUrl(nextUrl)}
        loading={loading}
      />

      {/* Mostrar página atual e pular página */}
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
              const page = parseInt(e.target.value);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = new URL(currentUrl);
                url.searchParams.set('page', currentPage);
                setCurrentUrl(url.toString());
              }
            }}
            className="w-20 p-1 border rounded text-center"
          />
        </div>
      )}

      {/* Modal com detalhes */}
      <Modal isOpen={!!selectedMidia} onClose={() => setSelectedMidia(null)}>
        {selectedMidia && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedMidia.titulo}</h2>
            <p><strong>Código do Documento:</strong> {selectedMidia.cod_documento}</p>
            <p><strong>Número da Fita:</strong> {selectedMidia.num_fita}</p>
            <p><strong>Data Inclusão:</strong> {selectedMidia.data_inclusao}</p>
            <p><strong>Local:</strong> {selectedMidia.id_local?.nome || 'Não informado'}</p>
            <p>
              <strong>Resumo:</strong>{' '}
              {loadingResumo ? 'Carregando...' : erroResumo ? erroResumo : resumo}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}



// import { useEffect, useState } from 'react';
// import LoadingSpinner from './_LoadingSpinner';
// import LoadingSkeleton from './_LoadingSkeleton';
// import ErrorMessage from './_ErrorMessage';
// import Modal from './Modal';

// export default function ListaMidias() {
//   const [midias, setMidias] = useState([]);
//   const [erro, setErro] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedMidia, setSelectedMidia] = useState(null);
//   const [resumo, setResumo] = useState('');
//   const [loadingResumo, setLoadingResumo] = useState(false);
//   const [erroResumo, setErroResumo] = useState('');
//   const [currentUrl, setCurrentUrl] = useState('http://localhost:8000/api/midias/');
//   const [nextUrl, setNextUrl] = useState(null);
//   const [prevUrl, setPrevUrl] = useState(null);

// useEffect(() => {
//   const fetchMidias = async () => {
//     setLoading(true);
//     setErro('');
//     const token = localStorage.getItem('access_token');

//     try {
//       const response = await fetch(currentUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Erro ao buscar mídias');
//       }

//       const data = await response.json();

//       if (data.results) {
//         setMidias(data.results);
//         setNextUrl(data.next);
//         setPrevUrl(data.previous);
//       } else {
//         setErro('Formato de resposta inválido');
//       }
//     } catch (err) {
//       setErro(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchMidias();
// }, [currentUrl]);


//   // useEffect(() => {
//   //   const fetchMidias = async () => {
//   //     setLoading(true);
//   //     setErro('');
//   //     const token = localStorage.getItem('access_token');

//   //     try {
//   //       const response = await fetch('http://localhost:8000/api/midias/', {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       });

//   //       if (!response.ok) {
//   //         throw new Error('Erro ao buscar mídias');
//   //       }

//   //       const data = await response.json();
//   //       if (Array.isArray(data)) {
//   //         setMidias(data);
//   //       } else if (data.results) {
//   //         setMidias(data.results);
//   //       } else {
//   //         setErro('Formato de resposta desconhecido');
//   //       }
//   //     } catch (err) {
//   //       setErro(err.message);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchMidias();
//   // }, []);

//   // Busca resumo sempre que selectedMidia muda
// useEffect(() => {
//   if (!selectedMidia) {
//     setResumo('');
//     setErroResumo('');
//     setLoadingResumo(false);
//     return;
//   }

//   console.log('selectedMidia:', selectedMidia);

//   const fetchResumo = async () => {
//     setLoadingResumo(true);
//     setErroResumo('');
//     setResumo('');
//     const token = localStorage.getItem('access_token');

//     try {
//       const response = await fetch(
//         `http://localhost:8000/api/resumos/por_documento/?cod_documento=${selectedMidia.cod_documento}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Erro ao buscar resumo');
//       }

//       const data = await response.json();

//       // Aqui consideramos que a API sempre retorna um objeto com o campo resumo
//       if (data.resumo) {
//         setResumo(data.resumo);
//       } else {
//         setResumo('Resumo não disponível');
//       }
//     } catch (err) {
//       setErroResumo(err.message);
//     } finally {
//       setLoadingResumo(false);
//     }
//   };

//   fetchResumo();

// }, [selectedMidia]);


  


//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow-sm">
//         Lista de Mídias
//       </h2>

//       {loading && <LoadingSkeleton count={6} />}
//       {erro && <ErrorMessage message={erro} />}

//       {!loading && !erro && midias.length === 0 && (
//         <p className="text-center text-gray-600">Nenhuma mídia encontrada.</p>
//       )}

//       {!loading && !erro && midias.length > 0 && (
//         <ul className="space-y-2">
//           {midias.map((midia) => (
//             <li
//               key={midia.cod_documento}
//               className="border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gray-50 cursor-pointer select-none"
//               title={midia.titulo}
//               onClick={() => setSelectedMidia(midia)}
//             >
//               <h3 className="font-semibold text-x text-blue-700 mb-1 truncate">
//                 Doc.: <strong>{midia.cod_documento}</strong> -  Num. Fita: <strong>{midia.num_fita}</strong>
//               </h3>
//               <p className="text-sm text-gray-600">
//                 Data Inclusão: <strong>{midia.data_inclusao}</strong>
//               </p>               
                          
//               <p className="text-sm text-gray-600">
//                 {midia.titulo} 
//               </p>

//             </li>
//           ))}
//         </ul>
                
//       )}
//       <Paginacao
//         prevUrl={prevUrl}
//         nextUrl={nextUrl}
//         onPrev={() => setCurrentUrl(prevUrl)}
//         onNext={() => setCurrentUrl(nextUrl)}
//         loading={loading}
//       />      

//       <Modal isOpen={!!selectedMidia} onClose={() => setSelectedMidia(null)}>
//         {selectedMidia && (
//           <div>
//             <h2 className="text-2xl font-bold mb-4">{selectedMidia.titulo}</h2>
//             <p>
//               <strong>Código do Documento:</strong> {selectedMidia.cod_documento}
//             </p>
//             <p>
//               <strong>Número da Fita:</strong> {selectedMidia.num_fita}
//             </p>
//             <p>
//               <strong>Data Inclusão:</strong> {selectedMidia.data_inclusao}
//             </p> 
//             <p>
//               <strong>Local:</strong> {selectedMidia.id_local}
//             </p> 
//             <p>
//               <strong>Resumo:</strong>{' '}
//               {/* {loadingResumo
//                 ? 'Carregando...'
//                 : erroResumo
//                 ? erroResumo
//                 : resumo} */
//                 selectedMidia.resumo || 'Resumo não disponível'}
//             </p>
         
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }
