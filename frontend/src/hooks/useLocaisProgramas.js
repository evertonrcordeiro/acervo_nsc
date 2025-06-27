// hooks/useLocaisProgramas.js
import { useEffect, useState } from 'react';

export default function useLocaisProgramas() {
  const [locais, setLocais] = useState([]);
  const [programas, setProgramas] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const fetchLocais = async () => {
      const res = await fetch('http://localhost:8000/api/locais/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLocais((await res.json()).results || []);
    };

    const fetchProgramas = async () => {
      const res = await fetch('http://localhost:8000/api/programas/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProgramas((await res.json()).results || []);
    };

    fetchLocais();
    fetchProgramas();
  }, []);

  return { locais, programas };
}
