export default function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center space-y-2 py-8">
      <div
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        aria-label="Loading spinner"
      ></div>
      <span className="text-blue-600 font-medium select-none">{message}</span>
    </div>
  );
}
