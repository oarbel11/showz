import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, chatApi } from '../services/api';
import { MapPin, Video, Star, MessageSquare, ArrowRight } from 'lucide-react';

const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

export default function UserProfile({ userId, onNavigate, onBack }) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    usersApi.get(userId)
      .then(data => {
        setProfile(data.user);
        if (data.user.credits) setCredits(data.user.credits);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const startChat = async () => {
    setStartingChat(true);
    try {
      await chatApi.startConversation(userId);
      onNavigate('messages');
    } catch (err) { alert(err.message); }
    finally { setStartingChat(false); }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-gray-400 animate-pulse-soft"><p className="text-lg">טוען פרופיל...</p></div>;
  }
  if (!profile) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-gray-500"><p className="text-lg">פרופיל לא נמצא</p><button onClick={onBack} className="mt-4 text-indigo-600 hover:underline">חזרה</button></div>;
  }

  const skillsList = (profile.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const isOwnProfile = currentUser?.id === profile.id;
  const isActor = profile.role === 'actor';
  const hasShowreel = ['actor', 'director', 'cinematographer', 'editor'].includes(profile.role);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
        <ArrowRight className="w-4 h-4" /> חזרה לתוצאות
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        {/* Cover */}
        <div className="h-56 w-full relative bg-gradient-to-l from-indigo-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-md relative z-10 overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : profile.name?.charAt(0) || '?'}
            </div>
            {!isOwnProfile && (
              <button onClick={startChat} disabled={startingChat}
                className="mb-2 flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                <MessageSquare className="w-4 h-4" />
                {startingChat ? 'מתחבר...' : 'שלח הודעה'}
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-lg text-indigo-600 font-medium mb-1">{ROLE_LABELS[profile.role] || profile.role}</p>
          {profile.company_name && <p className="text-gray-600 text-sm mb-1">{profile.company_name}</p>}
          {profile.location && <p className="text-gray-500 flex items-center gap-1.5 mb-4 text-sm"><MapPin className="w-4 h-4" /> {profile.location}</p>}
          <p className="text-gray-800 leading-relaxed max-w-2xl">{profile.bio || 'אין תיאור.'}</p>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Content */}
        <div className="flex flex-col md:flex-row p-8 gap-8">
          {/* Left Column */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Showreel */}
            {hasShowreel && profile.showreel && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" /> Showreel
                </h2>
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  <iframe src={profile.showreel.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="Showreel" />
                </div>
              </section>
            )}

            {/* Credits — actors */}
            {isActor && credits.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-600" /> ניסיון מקצועי (Credits)
                </h2>
                <div className="space-y-3">
                  {credits.map(credit => (
                    <div key={credit.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                      <div className="w-14 shrink-0 text-center text-gray-400 font-bold text-lg pt-1">{credit.year || '—'}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{credit.title}</h3>
                        {credit.credit_role && <p className="text-indigo-600 text-sm">{credit.credit_role}</p>}
                        {credit.credit_type && <p className="text-gray-500 text-xs">{credit.credit_type}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact */}
            {(profile.email || profile.website) && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">פרטי קשר</h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  {profile.email && <p><strong>אימייל:</strong> {profile.email}</p>}
                  {profile.website && <p><strong>אתר:</strong> <a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{profile.website}</a></p>}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Skills */}
            {skillsList.length > 0 && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">כישורים</h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">{skill}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Actor Physical Attributes */}
            {isActor && (profile.height || profile.eye_color || profile.hair_color || profile.languages) && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">נתונים פיזיים</h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  {profile.height && <DetailRow label="גובה" value={profile.height} />}
                  {profile.eye_color && <DetailRow label="צבע עיניים" value={profile.eye_color} />}
                  {profile.hair_color && <DetailRow label="צבע שיער" value={profile.hair_color} />}
                  {profile.languages && <DetailRow label="שפות" value={profile.languages} />}
                </ul>
              </section>
            )}

            {/* Director/Writer Genres */}
            {(profile.role === 'director' || profile.role === 'writer') && profile.genres && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">ז'אנרים</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.split(',').map((g, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">{g.trim()}</span>
                  ))}
                </div>
              </section>
            )}

            {/* DOP/Editor Equipment */}
            {(profile.role === 'cinematographer' || profile.role === 'editor') && profile.equipment && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">ציוד</h2>
                <p className="text-gray-700 text-sm">{profile.equipment}</p>
              </section>
            )}

            {/* General Info */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">פרטים</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <DetailRow label="תפקיד" value={ROLE_LABELS[profile.role] || profile.role} />
                {profile.location && <DetailRow label="מיקום" value={profile.location} />}
                {profile.company_name && <DetailRow label="חברה" value={profile.company_name} />}
                <li className="flex justify-between pb-2">
                  <span className="text-gray-500">הצטרף/ה</span>
                  <span className="font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleDateString('he-IL') : '—'}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <li className="flex justify-between border-b border-gray-200 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </li>
  );
}
