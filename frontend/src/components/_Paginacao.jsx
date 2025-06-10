export default function Paginacao({ prevUrl, nextUrl, onPrev, onNext, loading }) {
  return (
    <div className="flex justify-center mt-8 gap-4">
      <button
        onClick={onPrev}
        disabled={!prevUrl || loading}
        className={`px-5 py-2 rounded-md font-semibold transition
          ${prevUrl && !loading ? 
            'bg-blue-600 text-white hover:bg-blue-700' : 
            'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        &larr; Anterior
      </button>

      <button
        onClick={onNext}
        disabled={!nextUrl || loading}
        className={`px-5 py-2 rounded-md font-semibold transition
          ${nextUrl && !loading ? 
            'bg-blue-600 text-white hover:bg-blue-700' : 
            'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        Próximo &rarr;
      </button>
    </div>
  );
}
