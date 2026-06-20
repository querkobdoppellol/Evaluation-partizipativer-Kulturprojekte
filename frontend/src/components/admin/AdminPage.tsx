import { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminProjekte } from './AdminProjekte';
import { clearAdminToken, getAdminToken } from '../../api/client';

export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => !!getAdminToken());

  function handleLogout() {
    clearAdminToken();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Projektverwaltung</h1>
          <p className="text-blue-200 text-sm">WertApp – Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            ← Zur App
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-xl text-sm
              font-medium transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <AdminProjekte />
      </main>
    </div>
  );
}
