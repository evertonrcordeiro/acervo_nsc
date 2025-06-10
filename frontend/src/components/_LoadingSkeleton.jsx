export default function LoadingSkeleton({ count = 5 }) {
  return (
    <ul className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <li
          key={i}
          className="border border-gray-300 rounded-lg p-5 bg-gray-200 animate-pulse"
        >
          <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-400 rounded w-1/3"></div>
        </li>
      ))}
    </ul>
  );
}
