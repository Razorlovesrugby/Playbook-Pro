import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-white/30 text-6xl font-bold mb-4">404</p>
        <h1 className="text-white text-xl font-semibold mb-2">
          This play is not available.
        </h1>
        <p className="text-white/50 text-sm mb-8">
          It may have been removed or the link is incorrect.
        </p>
        <Link
          to="/moves"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0a0f1a] rounded font-medium text-sm hover:bg-white/90 transition-colors"
        >
          ← Back to Moves Library
        </Link>
      </div>
    </div>
  );
}
