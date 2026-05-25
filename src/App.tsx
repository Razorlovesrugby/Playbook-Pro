import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayViewerPage } from './viewer';

// ── Temporary demo route (Spec 02 + 03) ────────────────────────────────────
// Will be replaced by the Play Library (Module 06).
import { DemoPage } from './DemoPage';

export function App() {
  return (
    <Routes>
      <Route path="/"              element={<DemoPage />} />
      <Route path="/moves/:slug"   element={<PlayViewerPage />} />
      {/* Placeholder redirects for future modules */}
      <Route path="/moves"         element={<Navigate to="/" replace />} />
      <Route path="/editor"        element={<Navigate to="/" replace />} />
      <Route path="/my-plays"      element={<Navigate to="/" replace />} />
      <Route path="/team"          element={<Navigate to="/" replace />} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  );
}
