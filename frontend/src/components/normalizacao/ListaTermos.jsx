import { useEffect } from 'react';

export default function ListaTermos({
  termos,
  termoCorreto,
  setTermoCorreto,
  termosSelecionados,
  setTermosSelecionados,
}) {
  // Quando termoCorreto muda, seleciona todos os outros termos automaticamente
  useEffect(() => {
    if (!termoCorreto) {
      setTermosSelecionados([]);
      return;
    }
    const outros = termos.filter((t) => t.id !== termoCorreto.id);
    setTermosSelecionados(outros);
  }, [termoCorreto, termos, setTermosSelecionados]);

  // Manipula checkbox individual
  const toggleSelecionado = (termo) => {
    if (termosSelecionados.some((t) => t.id === termo.id)) {
      // desmarcar
      setTermosSelecionados(termosSelecionados.filter((t) => t.id !== termo.id));
    } else {
      // marcar
      setTermosSelecionados([...termosSelecionados, termo]);
    }
  };

  return (
    <div className="bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Resultados encontrados:</h2>
      {termos.length === 0 ? (
        <p className="text-gray-500">Nenhum termo similar encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {termos.map((r) => {
            const isCorreto = termoCorreto?.id === r.id;
            const isSelecionado = termosSelecionados.some((t) => t.id === r.id);
            return (
              <li
                key={r.id}
                onClick={() => setTermoCorreto(r)}
                className={`cursor-pointer p-2 rounded border flex items-center justify-between ${
                  isCorreto
                    ? 'bg-blue-200 border-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span>{r.nome}</span>
                {!isCorreto && (
                  <input
                    type="checkbox"
                    checked={isSelecionado}
                    onClick={(e) => e.stopPropagation()} // Evita que o clique no checkbox dispare o onClick do li
                    onChange={() => toggleSelecionado(r)}
                    aria-label={`Selecionar termo ${r.nome} para substituição`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
