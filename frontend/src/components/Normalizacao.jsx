import { useState, useEffect } from 'react';
import BuscaTermos from './normalizacao/BuscaTermos';
import ListaTermos from './normalizacao/ListaTermos';
import ConfirmarNormalizacao from './normalizacao/ConfirmarNormalizacao';

export default function NormalizacaoTermos() {
  const [entidade, setEntidade] = useState('locais');
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [termoCorreto, setTermoCorreto] = useState(null);
  const [termosSelecionados, setTermosSelecionados] = useState([]);

  // Quando termoCorreto muda, seleciona automaticamente todos os outros termos
  useEffect(() => {
    if (!termoCorreto) {
      setTermosSelecionados([]);
      return;
    }
    const outrosTermos = resultados.filter((r) => r.id !== termoCorreto.id);
    setTermosSelecionados(outrosTermos);
  }, [termoCorreto, resultados]);

  const handleBuscar = async () => {
    if (termo.trim().length < 3) return;

    const token = localStorage.getItem('access_token');
    const url = `http://localhost:8000/api/admin/${entidade}-admin/termos_similares/?termo=${encodeURIComponent(termo)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setResultados(data);
      setTermoCorreto(null);
      setTermosSelecionados([]);
    } else {
      alert('Erro ao buscar termos');
      setResultados([]);
      setTermoCorreto(null);
      setTermosSelecionados([]);
    }
  };

  const handleSucesso = () => {
    alert('Normalização concluída!');
    setResultados([]);
    setTermo('');
    setTermoCorreto(null);
    setTermosSelecionados([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Normalização de Termos</h1>

      <div className="flex gap-4">
        <select
          value={entidade}
          onChange={(e) => setEntidade(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="locais">Locais</option>
          <option value="programas">Programas</option>
          <option value="fontes">Fontes</option>
        </select>

        <BuscaTermos termo={termo} setTermo={setTermo} onBuscar={handleBuscar} />
      </div>

      <ListaTermos
        termos={resultados}
        termoCorreto={termoCorreto}
        setTermoCorreto={setTermoCorreto}
        termosSelecionados={termosSelecionados}
        setTermosSelecionados={setTermosSelecionados}
      />

      {termoCorreto && termosSelecionados.length > 0 && (
        <ConfirmarNormalizacao
          termoCorreto={termoCorreto}
          termosParaSubstituir={termosSelecionados}
          onSucesso={handleSucesso}
          entidade={entidade}
        />
      )}
    </div>
  );
}
