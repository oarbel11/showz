import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, chatApi } from '../services/api';
import { Search, MapPin, MessageSquare, User } from 'lucide-react';

const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

const ROLE_FILTERS = [
  { value: '', label: 'הכל' },
  { value: 'actor', label: 'שחקנים' },
  { value: 'director', label: 'במאים' },
  { value: 'producer', label: 'מפיקים' },
  { value: 'writer', label: 'תסריטאים' },
  { value: 'cinematographer', label: 'צלמים' },
  { value: 'agent', label: 'סוכנויות' },
];

export default function DiscoverView({ onNavigate, initialSearch = '', onViewProfile }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(initialSearch);

  // Sync with external search
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await usersApi.list(params);
      // Filter out current user
      setUsers(data.users.filter(u => u.id !== user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const startChat = async (userId) => {
    setStartingChat(userId);
    try {
      await chatApi.startConversation(userId);
      onNavigate('messages');
    } catch (err) {
      alert(err.message);
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">גלה קולגות מהתעשייה</h1>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש לפי שם, כישורים..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 flex-wrap">
            {ROLE_FILTERS.map(r => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  roleFilter === r.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse-soft">
          <p className="text-lg">מחפש קולגות...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">לא נמצאו תוצאות</p>
          <p className="text-gray-400">נסה חיפוש אחר או שנה את הסינון</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const skills = (u.skills || '').split(',').map(s => s.trim()).filter(Boolean);
            return (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all animate-slideUp group cursor-pointer" onClick={() => onViewProfile && onViewProfile(u.id)}>
                {/* Card Header gradient */}
                <div className="h-20 bg-gradient-to-l from-indigo-500 to-purple-600 relative">
                  <div className="absolute -bottom-8 right-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold border-4 border-white shadow-sm overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.name?.charAt(0) || '?'
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-10 px-4 pb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{u.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium">{ROLE_LABELS[u.role] || u.role}</p>
                  {u.location && (
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {u.location}
                    </p>
                  )}
                  {u.bio && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{u.bio}</p>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-400">+{skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(u.id); }}
                      className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      <User className="w-4 h-4" />
                      צפה בפרופיל
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startChat(u.id); }}
                      disabled={startingChat === u.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {startingChat === u.id ? 'מתחבר...' : 'הודעה'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
