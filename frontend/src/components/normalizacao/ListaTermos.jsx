import { useState, useEffect } from 'react';

export default function ListaTermos({ termos, termoCorreto, setTermoCorreto, termosSelecionados, setTermosSelecionados }) {
  useEffect(() => {
    // Ao trocar o termo correto, limpa seleção de substituição
    const novosSelecionados = termos
      .filter((t) => t.id !== termoCorreto?.id)
      .map((t) => t.id);
    setTermosSelecionados(novosSelecionados);
  }, [termoCorreto, termos, setTermosSelecionados]);

  const toggleSelecionado = (id) => {
    setTermosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Resultados encontrados:</h2>
      {termos.length === 0 ? (
        <p className="text-gray-500">Nenhum termo similar encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {termos.map((r) => (
            <li
              key={r.id}
              className={`p-2 rounded border flex items-center justify-between ${
                termoCorreto?.id === r.id
                  ? 'bg-blue-200 border-blue-700 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span
                className="flex-1 cursor-pointer"
                onClick={() => setTermoCorreto(r)}
              >
                {r.nome}
              </span>

              {termoCorreto?.id !== r.id && (
                <input
                  type="checkbox"
                  checked={termosSelecionados.includes(r.id)}
                  onChange={() => toggleSelecionado(r.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
