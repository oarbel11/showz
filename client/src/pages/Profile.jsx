import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { MapPin, Video, Star, Camera, X, Save, Plus, Trash2 } from 'lucide-react';

const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

// Role-specific fields config
const ROLE_CONFIGS = {
  actor: {
    label: 'שחקן/ית',
    sections: ['showreel', 'credits', 'physical', 'skills'],
    editFields: ['height', 'eye_color', 'hair_color', 'languages'],
  },
  director: {
    label: 'במאי/ת',
    sections: ['showreel', 'skills'],
    editFields: ['genres'],
  },
  producer: {
    label: 'מפיק/ה',
    sections: ['skills'],
    editFields: ['company_name'],
  },
  writer: {
    label: 'תסריטאי/ת',
    sections: ['skills'],
    editFields: ['genres'],
  },
  cinematographer: {
    label: 'צלם/ת',
    sections: ['showreel', 'skills'],
    editFields: ['equipment'],
  },
  editor: {
    label: 'עורך/ת',
    sections: ['showreel', 'skills'],
    editFields: ['equipment'],
  },
  agent: {
    label: 'סוכן/ת',
    sections: ['skills'],
    editFields: ['company_name'],
  },
};

export default function ProfileView() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState([]);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditForm, setCreditForm] = useState({ year: '', title: '', credit_role: '', credit_type: '' });

  const [form, setForm] = useState({
    name: '', bio: '', skills: '', location: '', showreel: '', website: '', phone: '', role: 'actor',
    height: '', eye_color: '', hair_color: '', languages: '', company_name: '', equipment: '', genres: '',
  });

  // Sync form with user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', bio: user.bio || '', skills: user.skills || '',
        location: user.location || '', showreel: user.showreel || '', website: user.website || '',
        phone: user.phone || '', role: user.role || 'actor', height: user.height || '',
        eye_color: user.eye_color || '', hair_color: user.hair_color || '', languages: user.languages || '',
        company_name: user.company_name || '', equipment: user.equipment || '', genres: user.genres || '',
      });
      if (user.credits) setCredits(user.credits);
    }
  }, [user]);

  // Load credits
  useEffect(() => {
    if (user?.role === 'actor') {
      usersApi.getCredits(user.id).then(d => setCredits(d.credits)).catch(() => {});
    }
  }, [user?.id, user?.role]);

  const roleConfig = ROLE_CONFIGS[user?.role] || ROLE_CONFIGS.actor;
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await usersApi.update(user.id, form);
      updateUser(data.user);
      setEditing(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await usersApi.uploadAvatar(user.id, file);
      updateUser({ ...user, avatar: data.avatar });
    } catch (err) { alert(err.message); }
  };

  const handleAddCredit = async (e) => {
    e.preventDefault();
    try {
      const data = await usersApi.addCredit(user.id, { ...creditForm, year: creditForm.year ? Number(creditForm.year) : null });
      setCredits(prev => [data.credit, ...prev]);
      setCreditForm({ year: '', title: '', credit_role: '', credit_type: '' });
      setShowAddCredit(false);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteCredit = async (creditId) => {
    try {
      await usersApi.deleteCredit(user.id, creditId);
      setCredits(prev => prev.filter(c => c.id !== creditId));
    } catch (err) { alert(err.message); }
  };

  const skillsList = (user?.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        {/* Cover */}
        <div className="h-64 w-full relative bg-gradient-to-l from-indigo-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Header */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-md relative z-10 overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || '?'}
              </div>
              <label className="absolute inset-0 z-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex gap-3 mb-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <X className="w-4 h-4" /> ביטול
                  </button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'שומר...' : 'שמור'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">ערוך פרופיל</button>
              )}
            </div>
          </div>

          {/* Edit Mode */}
          {editing ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="שם" name="name" value={form.name} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                  <select name="role" value={form.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <EditField label="מיקום" name="location" value={form.location} onChange={handleChange} placeholder="תל אביב" />
                <EditField label="טלפון" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ביוגרפיה</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ספר/י על עצמך..." />
              </div>
              <EditField label="כישורים (מופרדים בפסיק)" name="skills" value={form.skills} onChange={handleChange} placeholder="דרמה, קומדיה, שירה" />

              {/* Role-specific edit fields */}
              {(form.role === 'actor' || form.role === 'director' || form.role === 'cinematographer' || form.role === 'editor') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="קישור שואוריל" name="showreel" value={form.showreel} onChange={handleChange} placeholder="https://youtube.com/..." />
                  <EditField label="אתר אינטרנט" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
                </div>
              )}

              {form.role === 'actor' && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mt-6 border-t border-gray-200 pt-4">נתונים פיזיים</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <EditField label="גובה" name="height" value={form.height} onChange={handleChange} placeholder='1.68 ס"מ' />
                    <EditField label="צבע עיניים" name="eye_color" value={form.eye_color} onChange={handleChange} placeholder="חום" />
                    <EditField label="צבע שיער" name="hair_color" value={form.hair_color} onChange={handleChange} placeholder="חום כהה" />
                    <EditField label="שפות" name="languages" value={form.languages} onChange={handleChange} placeholder="עברית, אנגלית" />
                  </div>
                </>
              )}

              {(form.role === 'director' || form.role === 'writer') && (
                <EditField label="ז'אנרים" name="genres" value={form.genres} onChange={handleChange} placeholder="דרמה, קומדיה, מתח" />
              )}

              {(form.role === 'agent' || form.role === 'producer') && (
                <EditField label="שם חברה / סוכנות" name="company_name" value={form.company_name} onChange={handleChange} placeholder="סוכנות טאלנטים VIP" />
              )}

              {(form.role === 'cinematographer' || form.role === 'editor') && (
                <EditField label="ציוד" name="equipment" value={form.equipment} onChange={handleChange} placeholder="Sony FX9, RED Komodo" />
              )}
            </div>
          ) : (
            /* View Mode */
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-lg text-indigo-600 font-medium mb-1">{ROLE_LABELS[user?.role] || user?.role}</p>
              {user?.company_name && <p className="text-gray-600 text-sm mb-1">{user.company_name}</p>}
              {user?.location && <p className="text-gray-500 flex items-center gap-1.5 mb-4 text-sm"><MapPin className="w-4 h-4" /> {user.location}</p>}
              <p className="text-gray-800 leading-relaxed max-w-2xl">{user?.bio || 'לחץ על "ערוך פרופיל" כדי להוסיף תיאור...'}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Content Sections */}
        <div className="flex flex-col md:flex-row p-8 gap-8">
          {/* Left Column */}
          <div className="w-full md:w-2/3 space-y-8">
            {/* Showreel — actors, directors, cinematographers, editors */}
            {roleConfig.sections.includes('showreel') && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" /> שואוריל (Showreel)
                </h2>
                {user?.showreel ? (
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    <iframe src={user.showreel.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="Showreel" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-gray-400">הוסף קישור לשואוריל בעריכת הפרופיל</p>
                  </div>
                )}
              </section>
            )}

            {/* Credits — actors only */}
            {roleConfig.sections.includes('credits') && (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-600" /> ניסיון מקצועי (Credits)
                  </h2>
                  <button onClick={() => setShowAddCredit(!showAddCredit)} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> הוסף קרדיט
                  </button>
                </div>

                {showAddCredit && (
                  <form onSubmit={handleAddCredit} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 animate-fadeIn border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="שנה" value={creditForm.year} onChange={e => setCreditForm(p => ({ ...p, year: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" placeholder="שם ההפקה *" required value={creditForm.title} onChange={e => setCreditForm(p => ({ ...p, title: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" placeholder="תפקיד" value={creditForm.credit_role} onChange={e => setCreditForm(p => ({ ...p, credit_role: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" placeholder="סוג (קולנוע, טלוויזיה...)" value={creditForm.credit_type} onChange={e => setCreditForm(p => ({ ...p, credit_type: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowAddCredit(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ביטול</button>
                      <button type="submit" className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">הוסף</button>
                    </div>
                  </form>
                )}

                {credits.length > 0 ? (
                  <div className="space-y-3">
                    {credits.map(credit => (
                      <div key={credit.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 group">
                        <div className="w-14 shrink-0 text-center text-gray-400 font-bold text-lg pt-1">{credit.year || '—'}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{credit.title}</h3>
                          {credit.credit_role && <p className="text-indigo-600 text-sm">{credit.credit_role}</p>}
                          {credit.credit_type && <p className="text-gray-500 text-xs">{credit.credit_type}</p>}
                        </div>
                        <button onClick={() => handleDeleteCredit(credit.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-6">עדיין לא הוספת קרדיטים. לחץ "הוסף קרדיט" למעלה.</p>
                )}
              </section>
            )}

            {/* Contact */}
            {(user?.email || user?.phone || user?.website) && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">פרטי קשר</h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  {user?.email && <p><strong>אימייל:</strong> {user.email}</p>}
                  {user?.phone && <p><strong>טלפון:</strong> {user.phone}</p>}
                  {user?.website && <p><strong>אתר:</strong> <a href={user.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{user.website}</a></p>}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Skills */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">כישורים</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.length > 0 ? skillsList.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">{skill}</span>
                )) : <p className="text-gray-400 text-sm">הוסף כישורים בעריכת הפרופיל</p>}
              </div>
            </section>

            {/* Actor Physical Attributes */}
            {user?.role === 'actor' && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">נתונים פיזיים</h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  <DetailRow label="גובה" value={user?.height} />
                  <DetailRow label="צבע עיניים" value={user?.eye_color} />
                  <DetailRow label="צבע שיער" value={user?.hair_color} />
                  <DetailRow label="שפות" value={user?.languages} />
                </ul>
              </section>
            )}

            {/* Director/Writer Genres */}
            {(user?.role === 'director' || user?.role === 'writer') && user?.genres && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">ז'אנרים</h2>
                <div className="flex flex-wrap gap-2">
                  {user.genres.split(',').map((g, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">{g.trim()}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Cinematographer/Editor Equipment */}
            {(user?.role === 'cinematographer' || user?.role === 'editor') && user?.equipment && (
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">ציוד</h2>
                <p className="text-gray-700 text-sm">{user.equipment}</p>
              </section>
            )}

            {/* Info */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">פרטים</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <DetailRow label="תפקיד" value={ROLE_LABELS[user?.role] || user?.role} />
                <DetailRow label="מיקום" value={user?.location} />
                {user?.company_name && <DetailRow label="חברה" value={user.company_name} />}
                <li className="flex justify-between pb-2">
                  <span className="text-gray-500">הצטרף/ה</span>
                  <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('he-IL') : '—'}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function EditField({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
