import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import TutorPage from './pages/TutorPage';
import UploadPage from './pages/UploadPage';
import PlanPage from './pages/PlanPage';
import StudyPage from './pages/StudyPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="tutor" element={<TutorPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
