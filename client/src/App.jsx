import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FeedView from './pages/Feed';
import JobsView from './pages/Jobs';
import MessagesView from './pages/Messages';
import ProfileView from './pages/Profile';
import DiscoverView from './pages/Discover';
import UserProfile from './pages/UserProfile';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('feed');
  const [authPage, setAuthPage] = useState('login');
  const [globalSearch, setGlobalSearch] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <span className="text-4xl font-black text-white tracking-tighter">
            ShowZ<span className="text-amber-400">.</span>
          </span>
          <p className="text-indigo-200 mt-4">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authPage === 'register') {
      return <Register onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthPage('register')} />;
  }

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    setViewingUserId(null);
    setCurrentTab('discover');
  };

  const handleNavigate = (tab) => {
    setViewingUserId(null);
    setCurrentTab(tab);
  };

  const handleViewProfile = (userId) => {
    setViewingUserId(userId);
  };

  const renderContent = () => {
    // If viewing another user's profile
    if (viewingUserId) {
      return (
        <UserProfile
          userId={viewingUserId}
          onNavigate={handleNavigate}
          onBack={() => setViewingUserId(null)}
        />
      );
    }

    switch (currentTab) {
      case 'feed': return <FeedView />;
      case 'jobs': return <JobsView onViewProfile={handleViewProfile} />;
      case 'messages': return <MessagesView />;
      case 'profile': return <ProfileView />;
      case 'discover': return <DiscoverView onNavigate={handleNavigate} initialSearch={globalSearch} onViewProfile={handleViewProfile} />;
      default: return <FeedView />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F3F4F6] font-sans text-right">
      <Navbar currentTab={currentTab} setCurrentTab={handleNavigate} onSearch={handleGlobalSearch} />
      <main className="px-4 pb-20 md:pb-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
