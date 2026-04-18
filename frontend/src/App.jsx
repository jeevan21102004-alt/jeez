import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LogFood from './pages/LogFood';
import Exercise from './pages/Exercise';
import History from './pages/History';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import { useUserStore } from './store/userStore';

function Shell() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log-food" element={<LogFood />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const onboarded = useUserStore((s) => s.onboarded);
  const theme = useUserStore((s) => s.profile?.theme || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--txt-main)', border: '1px solid var(--border-line)' } }} />
      <div className="relative flex min-h-screen w-full">
        <Sidebar />
        <main className="w-full">{onboarded ? <Shell /> : <Onboarding />}</main>
      </div>
    </BrowserRouter>
  );
}
