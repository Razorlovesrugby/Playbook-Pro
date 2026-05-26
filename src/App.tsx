import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayViewerPage } from './viewer';
import { EditorPage } from './editor';
import { LibraryPage } from './library';
import { AuthPage, AuthCallback, MyPlaysPage, ProtectedRoute } from './auth';
import { TeamPage, TeamPlaybookPage } from './teams';

export function App() {
  return (
    <Routes>
      <Route path="/"                element={<Navigate to="/moves" replace />} />
      <Route path="/moves"           element={<LibraryPage />} />
      <Route path="/moves/:slug"     element={<PlayViewerPage />} />
      <Route path="/editor"          element={<EditorPage />} />
      <Route path="/editor/:playId"  element={<EditorPage />} />
      <Route path="/auth"            element={<AuthPage />} />
      <Route path="/auth/callback"   element={<AuthCallback />} />
      <Route path="/my-plays"        element={<ProtectedRoute><MyPlaysPage /></ProtectedRoute>} />
      <Route path="/team"            element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="/team/:teamSlug"  element={<TeamPlaybookPage />} />
      <Route path="*"                element={<Navigate to="/moves" replace />} />
    </Routes>
  );
}
