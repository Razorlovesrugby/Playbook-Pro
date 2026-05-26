import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayViewerPage } from './viewer';
import { EditorPage } from './editor';
import { LibraryPage } from './library';

export function App() {
  return (
    <Routes>
      <Route path="/"               element={<Navigate to="/moves" replace />} />
      <Route path="/moves"          element={<LibraryPage />} />
      <Route path="/moves/:slug"    element={<PlayViewerPage />} />
      <Route path="/editor"         element={<EditorPage />} />
      <Route path="/editor/:playId" element={<EditorPage />} />
      <Route path="/my-plays"       element={<Navigate to="/moves" replace />} />
      <Route path="/team"           element={<Navigate to="/moves" replace />} />
      <Route path="*"               element={<Navigate to="/moves" replace />} />
    </Routes>
  );
}
