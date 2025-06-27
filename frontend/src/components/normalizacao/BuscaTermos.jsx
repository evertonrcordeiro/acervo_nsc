export default function BuscaTermos({ termo, setTermo, onBuscar }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Buscar termos similares"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="border p-2 rounded flex-grow"
        aria-label="Buscar termos similares"
      />
      <button
        onClick={onBuscar}
        className="bg-blue-700 text-white px-4 rounded hover:bg-blue-800"
        disabled={termo.trim().length < 3}
      >
        Buscar
      </button>
    </div>
  );
}
