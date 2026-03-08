import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import {
  Home, Clapperboard, MessageSquare, User, Search, LogOut, Users, Bell
} from 'lucide-react';

const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

export default function Navbar({ currentTab, setCurrentTab, onSearch }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = () => notificationsApi.list().then(d => { setNotifications(d.notifications); setUnreadCount(d.unreadCount); }).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { id: 'feed', icon: Home, label: 'ראשי' },
    { id: 'jobs', icon: Clapperboard, label: 'אודישנים' },
    { id: 'discover', icon: Users, label: 'קולגות' },
    { id: 'messages', icon: MessageSquare, label: 'הודעות' },
    { id: 'profile', icon: User, label: 'פרופיל' },
  ];

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      onSearch(searchText.trim());
      setCurrentTab('discover');
    }
  };

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <span className="text-xl md:text-2xl font-black text-indigo-600 tracking-tighter cursor-pointer shrink-0" onClick={() => setCurrentTab('feed')}>
              ShowZ<span className="text-amber-500">.</span>
            </span>

            {/* Search — full width on mobile */}
            <div className="flex-1 mx-3 relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={handleSearchKeyDown}
                placeholder="חיפוש..."
                className="block w-full pl-3 pr-9 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Desktop nav items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button key={item.id} onClick={() => setCurrentTab(item.id)}
                    className={`relative flex flex-col items-center justify-center w-14 h-14 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'stroke-indigo-600' : ''}`} />
                    <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                    {isActive && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
                  </button>
                );
              })}
            </div>

            {/* Right side: Notification + User menu */}
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <div className="relative">
                <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) notificationsApi.markRead().then(() => setUnreadCount(0)).catch(() => {}); }}
                  className="relative flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">{unreadCount}</span>
                  )}
                </button>
                {showNotifs && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
                    <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fadeIn overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900 text-sm">התראות</h3></div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-gray-400 text-sm">אין התראות חדשות</p>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${n.is_read ? '' : 'bg-indigo-50/40'}`}>
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('he-IL')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar + Menu */}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold border-2 border-transparent hover:border-indigo-500 transition-colors overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || '?'}
                  </div>
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
                      </div>
                      <button onClick={() => { setCurrentTab('profile'); setShowMenu(false); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <User className="w-4 h-4" /> הפרופיל שלי
                      </button>
                      <button onClick={() => { logout(); setShowMenu(false); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> התנתק
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex justify-around items-center h-14">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-indigo-600' : ''}`} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
