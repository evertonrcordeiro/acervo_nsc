export default function ErrorMessage({ message }) {
  return (
    <div
      role="alert"
      className="max-w-md mx-auto my-4 flex items-center space-x-3 bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-3 shadow-md animate-fadeIn"
    >
      <svg
        className="w-6 h-6 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
        />
      </svg>
      <p className="text-sm font-semibold">{message}</p>

      <style>{`
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
