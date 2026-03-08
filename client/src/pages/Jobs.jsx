import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsApi, applicationsApi } from '../services/api';
import { MapPin, Briefcase, X, Plus, Upload, FileText, ExternalLink, Users } from 'lucide-react';

const CATEGORIES = ['הכל', 'acting', 'directing', 'production', 'writing', 'cinematography', 'crew', 'extras'];
const CATEGORY_LABELS = {
  'הכל': 'הכל', acting: 'שחקנים', directing: 'במאים', production: 'הפקה',
  writing: 'כתיבה', cinematography: 'צילום', crew: 'צוות טכני', extras: 'ניצבים'
};
const JOB_TYPES = {
  'full-time': 'משרה מלאה', 'part-time': 'משרה חלקית', freelance: 'פרילנס',
  contract: 'חוזה', volunteer: 'התנדבות'
};
const ROLE_LABELS = {
  actor: 'שחקן/ית', director: 'במאי/ת', producer: 'מפיק/ה', writer: 'תסריטאי/ת',
  cinematographer: 'צלם/ת', editor: 'עורך/ת', agent: 'סוכן/ת', other: 'אחר',
};

export default function JobsView({ onViewProfile }) {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent' || user?.role === 'producer';
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', category: 'acting', location: '',
    job_type: 'freelance', compensation: '', requirements: '', contact_email: ''
  });
  const [creating, setCreating] = useState(false);

  // Apply modal
  const [applyJob, setApplyJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Agent: view applicants
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'הכל') params.category = selectedCategory;
      const data = await jobsApi.list(params);
      setJobs(data.jobs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadJobs(); }, [selectedCategory]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await jobsApi.create(form);
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'acting', location: '', job_type: 'freelance', compensation: '', requirements: '', contact_email: '' });
      loadJobs();
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsApi.apply(applyJob.id, cvFile, applyMessage);
      setApplySuccess(true);
      setTimeout(() => { setApplyJob(null); setApplySuccess(false); setCvFile(null); setApplyMessage(''); }, 2000);
    } catch (err) { alert(err.message); }
    finally { setApplying(false); }
  };

  const handleViewApplicants = async (job) => {
    setViewApplicantsJob(job);
    setLoadingApplicants(true);
    try {
      const data = await applicationsApi.getApplications(job.id);
      setApplicants(data.applications);
    } catch (err) { alert(err.message); }
    finally { setLoadingApplicants(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
          <h2 className="font-bold text-lg mb-4 text-gray-900">סינון משרות</h2>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <input type="radio" name="job_category" checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-gray-700">{CATEGORY_LABELS[category]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">לוח אודישנים ומשרות</h1>
          {isAgent && (
            <button onClick={() => setShowCreate(true)} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
              <Plus className="w-4 h-4" /> פרסם משרה
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400"><div className="animate-pulse-soft text-lg">טוען אודישנים...</div></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-2">אין אודישנים כרגע</p>
            <p className="text-gray-400">היה הראשון לפרסם! 🎬</p>
          </div>
        ) : (
          jobs.map(job => {
            const isMyJob = job.user_id === user?.id;
            return (
              <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors animate-fadeIn">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{CATEGORY_LABELS[job.category] || job.category}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{JOB_TYPES[job.job_type] || job.job_type}</span>
                    </div>
                    {job.poster_name && <p className="text-indigo-600 font-medium text-sm mb-3">פורסם ע"י {job.poster_name}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {job.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>}
                      {job.compensation && <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.compensation}</div>}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                    {job.requirements && <p className="text-gray-500 text-sm mt-2"><strong>דרישות:</strong> {job.requirements}</p>}
                  </div>

                  <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-col gap-2">
                    {isMyJob ? (
                      <button onClick={() => handleViewApplicants(job)}
                        className="w-full md:w-auto bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> צפה במועמדים
                      </button>
                    ) : (
                      <button onClick={() => { setApplyJob(job); setApplySuccess(false); setCvFile(null); setApplyMessage(''); }}
                        className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                        הגש מועמדות
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Modal */}
      {applyJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !applying && setApplyJob(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">הגשת מועמדות</h2>
              <button onClick={() => setApplyJob(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">המועמדות הוגשה בהצלחה!</h3>
                <p className="text-gray-500">הסוכן/ת יקבל/תקבל הודעה על המועמדות שלך</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900">{applyJob.title}</h3>
                  <p className="text-sm text-gray-500">פורסם ע"י {applyJob.poster_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">קורות חיים (PDF / DOC)</label>
                  <label className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">{cvFile ? cvFile.name : 'לחץ לבחירת קובץ'}</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הודעה למגייס (אופציונלי)</label>
                  <textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)} rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ספר/י למה את/ה מתאים/ה לתפקיד..." />
                </div>

                <button type="submit" disabled={applying}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {applying ? 'שולח...' : 'שלח מועמדות'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Applicants Modal (Agent view) */}
      {viewApplicantsJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewApplicantsJob(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">מועמדים</h2>
                <p className="text-sm text-gray-500">{viewApplicantsJob.title}</p>
              </div>
              <button onClick={() => setViewApplicantsJob(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingApplicants ? (
                <div className="text-center py-8 text-gray-400 animate-pulse-soft">טוען מועמדים...</div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg mb-2">אין מועמדויות עדיין</p>
                  <p className="text-sm">מועמדים יופיעו כאן לאחר שיגישו מועמדות</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="text-right py-3 px-2 font-medium">שם</th>
                        <th className="text-right py-3 px-2 font-medium">תפקיד</th>
                        <th className="text-right py-3 px-2 font-medium">אימייל</th>
                        <th className="text-right py-3 px-2 font-medium">תאריך</th>
                        <th className="text-right py-3 px-2 font-medium">קו"ח</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map(app => (
                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <button onClick={() => { setViewApplicantsJob(null); onViewProfile && onViewProfile(app.user_id); }}
                              className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1">
                              {app.name} <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="py-3 px-2 text-gray-600">{ROLE_LABELS[app.role] || app.role}</td>
                          <td className="py-3 px-2 text-gray-600">{app.email}</td>
                          <td className="py-3 px-2 text-gray-500">{new Date(app.created_at).toLocaleDateString('he-IL')}</td>
                          <td className="py-3 px-2">
                            {app.cv_file ? (
                              <a href={app.cv_file} download target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                                <FileText className="w-3 h-3" /> הורד
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">לא צורף</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Applicant messages */}
                  {applicants.some(a => a.message) && (
                    <div className="mt-6 space-y-3">
                      <h3 className="font-bold text-gray-900">הודעות מהמועמדים</h3>
                      {applicants.filter(a => a.message).map(app => (
                        <div key={app.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-1">{app.name}:</p>
                          <p className="text-sm text-gray-600">{app.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">פרסם אודישן/משרה חדשה</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
                <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="למשל: שחקנית ראשית לסדרת רשת" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור *</label>
                <textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="תיאור מפורט של המשרה/אודישן" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {CATEGORIES.filter(c => c !== 'הכל').map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
                  <select value={form.job_type} onChange={e => setForm(p => ({ ...p, job_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(JOB_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="תל אביב" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">תגמול</label>
                <input type="text" value={form.compensation} onChange={e => setForm(p => ({ ...p, compensation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="בתשלום / התנדבות / קרדיט" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">דרישות</label>
                <input type="text" value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="גיל: 20-25, ניסיון בתיאטרון" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">אימייל ליצירת קשר</label>
                <input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="casting@example.com" /></div>
              <button type="submit" disabled={creating}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {creating ? 'מפרסם...' : 'פרסם משרה'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
