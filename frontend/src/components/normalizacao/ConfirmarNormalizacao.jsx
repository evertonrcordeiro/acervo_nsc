import { useState } from 'react';

export default function ConfirmarNormalizacao({ termoCorreto, termosParaSubstituir, onSucesso, entidade }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleConfirmar = async () => {
    if (!termoCorreto || termosParaSubstituir.length === 0) return;

    setLoading(true);
    setErro('');

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/${entidade}-admin/normalizar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_destino: termoCorreto.id,
          ids_substituir: termosParaSubstituir.map((t) => t.id),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || 'Erro na normalização');
      }

      onSucesso();
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="font-semibold mb-2">Confirmar normalização</h3>
      <p>
        Termo correto: <strong>{termoCorreto.nome}</strong>
      </p>
      <p>Termos que serão substituídos:</p>
      <ul className="list-disc list-inside mb-2 max-h-40 overflow-auto">
        {termosParaSubstituir.map((t) => (
          <li key={t.id}>{t.nome}</li>
        ))}
      </ul>
      {erro && <p className="text-red-600 mb-2">{erro}</p>}
      <button
        disabled={loading}
        onClick={handleConfirmar}
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
      >
        {loading ? 'Processando...' : 'Confirmar'}
      </button>
    </div>
  );
}
