import { Link } from 'react-router-dom';
import { useAuth, signOut } from './auth';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <Link to="/moves" className="text-white font-bold text-lg tracking-tight">
          Playbook
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/moves" className="text-white/60 hover:text-white transition-colors">Moves</Link>
          <Link to="/editor" className="text-white/60 hover:text-white transition-colors">Editor</Link>
          {user && <Link to="/my-plays" className="text-white/60 hover:text-white transition-colors">My Plays</Link>}
          {user && <Link to="/team" className="text-white/60 hover:text-white transition-colors">Team</Link>}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/editor"
                className="hidden sm:flex items-center px-3 py-1.5 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90 min-h-11"
              >
                Create Play
              </Link>
              <button
                onClick={() => void signOut()}
                className="text-white/50 text-sm hover:text-white transition-colors min-h-11"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-white/60 text-sm hover:text-white transition-colors min-h-11 flex items-center">
                Sign in
              </Link>
              <Link
                to="/editor"
                className="flex items-center px-3 py-1.5 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90 min-h-11"
              >
                Create Play
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
