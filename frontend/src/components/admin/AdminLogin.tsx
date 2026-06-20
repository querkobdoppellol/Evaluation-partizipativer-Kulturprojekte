import { useState } from 'react';
import { adminLogin } from '../../api/projekte';
import { setAdminToken } from '../../api/client';

interface Props {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      onLogin();
    } catch {
      setError('Falsches Passwort');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin-Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            autoFocus
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg
              focus:outline-none focus:border-blue-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="py-3 rounded-xl bg-blue-600 text-white text-lg font-bold
              hover:bg-blue-700 disabled:opacity-40 transition-all"
          >
            {loading ? 'Anmelden …' : 'Anmelden'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-6 text-center">
          Standard-Passwort: <code>admin</code> (via ADMIN_PASSWORD ändern)
        </p>
      </div>
    </div>
  );
}
