import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clapperboard } from 'lucide-react';

const ROLES = [
  { value: 'actor', label: 'שחקן/ית' },
  { value: 'director', label: 'במאי/ת' },
  { value: 'producer', label: 'מפיק/ה' },
  { value: 'writer', label: 'תסריטאי/ת' },
  { value: 'cinematographer', label: 'צלם/ת' },
  { value: 'editor', label: 'עורך/ת' },
  { value: 'agent', label: 'סוכן/ת' },
  { value: 'other', label: 'אחר' },
];

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'actor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Clapperboard className="w-10 h-10 text-amber-400" />
            <span className="text-4xl font-black text-white tracking-tighter">
              ShowZ<span className="text-amber-400">.</span>
            </span>
          </div>
          <p className="text-indigo-200 text-lg">הצטרפו לקהילת הבידור הגדולה בישראל</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">יצירת חשבון</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm text-center animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-indigo-200 text-sm font-medium mb-2">שם מלא</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                placeholder="השם שלך"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-200 text-sm font-medium mb-2">אימייל</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-200 text-sm font-medium mb-2">סיסמה</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                placeholder="לפחות 6 תווים"
                required
              />
            </div>

            <div>
              <label className="block text-indigo-200 text-sm font-medium mb-2">תפקיד בתעשייה</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} className="bg-indigo-900 text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'נרשם...' : 'הירשם'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-indigo-200">
              כבר יש לך חשבון?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors"
              >
                התחבר
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
