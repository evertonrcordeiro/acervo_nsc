// hooks/useMetadadosMidias.js
import { useEffect, useState } from 'react';

export default function useMetadadosMidias() {
  const [locais, setLocais] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setErro('Token de acesso não encontrado.');
      return;
    }

    const fetchComum = async (url, setter) => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erro ao buscar ${url}`);
        const data = await res.json();
        setter(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(`Erro ao carregar ${url}:`, err);
        setter([]); // fallback
        setErro(`Erro ao carregar dados de ${url}`);
      }
    };

    fetchComum('http://localhost:8000/api/locais/', setLocais);
    fetchComum('http://localhost:8000/api/programas/', setProgramas);
    fetchComum('http://localhost:8000/api/fontes/', setFontes);
  }, []);

  return { locais, programas, fontes, erro };
}
