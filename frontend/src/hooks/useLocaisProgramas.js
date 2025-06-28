// hooks/useLocaisProgramas.js
import { useEffect, useState } from 'react';

export default function useLocaisProgramas() {
  const [locais, setLocais] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setErro('Token não encontrado');
      return;
    }

    const fetchLocais = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/locais/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar locais');
        const data = await res.json();
        setLocais(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error('Erro ao carregar locais:', err);
        setLocais([]);
      }
    };

    const fetchProgramas = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/programas/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar programas');
        const data = await res.json();
        setProgramas(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error('Erro ao carregar programas:', err);
        setProgramas([]);
      }
    };

    fetchLocais();
    fetchProgramas();
  }, []);

  return { locais, programas, erro };
}
