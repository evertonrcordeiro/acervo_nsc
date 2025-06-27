// hooks/useResumoMidia.js
import { useEffect, useState } from 'react';

export default function useResumoMidia(midiaSelecionada) {
  const [resumo, setResumo] = useState('');
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState('');

  useEffect(() => {
    if (!midiaSelecionada) {
      setResumo('');
      return;
    }

    const fetchResumo = async () => {
      setLoadingResumo(true);
      setErroResumo('');
      const token = localStorage.getItem('access_token');

      try {
        const res = await fetch(
          `http://localhost:8000/api/resumos/por_documento/?cod_documento=${midiaSelecionada.cod_documento}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 404) return setResumo('Resumo ainda não foi cadastrado.');
        if (!res.ok) throw new Error('Erro ao buscar resumo');

        const data = await res.json();
        setResumo(data.resumo || 'Resumo não disponível');
      } catch (err) {
        setErroResumo(err.message);
      } finally {
        setLoadingResumo(false);
      }
    };

    fetchResumo();
  }, [midiaSelecionada]);

  return { resumo, loadingResumo, erroResumo };
}
