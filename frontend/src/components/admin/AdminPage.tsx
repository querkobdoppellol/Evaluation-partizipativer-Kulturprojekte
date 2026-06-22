import { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminProjekte } from './AdminProjekte';
import { AdminAntworten } from './AdminAntworten';
import { clearAdminToken, getAdminToken } from '../../api/client';

type Tab = 'projekte' | 'antworten';

export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => !!getAdminToken());
  const [tab, setTab] = useState<Tab>('projekte');

  function handleLogout() {
    clearAdminToken();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">WertApp – Admin</h1>
          <p className="text-blue-200 text-sm">Jederkann e.V. Erfurt</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-blue-200 hover:text-white text-sm transition-colors">
            ← Zur App
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-xl text-sm font-medium transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-2xl mx-auto flex gap-1">
          {([
            ['projekte',   'Projekte'],
            ['antworten',  'Einreichungen'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {tab === 'projekte'  && <AdminProjekte />}
        {tab === 'antworten' && <AdminAntworten />}
      </main>
    </div>
  );
}
