import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../services/api';
import {
  Image as ImageIcon, Video, Heart, MessageCircle, Share2, MoreHorizontal, Send
} from 'lucide-react';

// For the feed, we'll show mock posts + real jobs as announcements
export default function FeedView() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [postText, setPostText] = useState('');

  useEffect(() => {
    jobsApi.list({ limit: 3 }).then(data => setRecentJobs(data.jobs)).catch(() => {});
  }, []);

  const MOCK_POSTS = [
    {
      id: 'mock-1',
      author: { name: user?.name || 'אורח', role: 'חבר/ה חדש/ה ב-ShowZ', avatar: null },
      time: 'עכשיו',
      content: `ברוך/ה הבא/ה ל-ShowZ! 🎬 כאן תוכל/י למצוא אודישנים, להתחבר עם קולגות מהתעשייה ולקדם את הקריירה שלך.`,
      likes: 0, comments: 0
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Create Post Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fadeIn">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || '?'
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="מה חדש בתעשייה? שתפו אודישנים, תפקידים או פרויקטים..."
              className="w-full resize-none border-none focus:ring-0 p-2 text-gray-700 bg-gray-50 rounded-lg min-h-[80px] focus:outline-none"
            ></textarea>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-2 text-gray-500">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" /> <span className="hidden sm:inline text-sm">תמונה/וידאו</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" /> <span className="hidden sm:inline text-sm">שואוריל</span>
                </button>
              </div>
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                פרסם
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs as Cards */}
      {recentJobs.length > 0 && (
        <div className="bg-gradient-to-l from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 animate-slideUp">
          <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            🎬 אודישנים חדשים
          </h3>
          <div className="space-y-2">
            {recentJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg p-3 border border-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer">
                <p className="font-bold text-gray-900">{job.title}</p>
                <p className="text-sm text-gray-500">{job.location} · {job.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {MOCK_POSTS.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slideUp">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                    {post.author.avatar ? (
                      <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      post.author.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 hover:text-indigo-600 cursor-pointer">{post.author.name}</h3>
                    <p className="text-xs text-gray-500">{post.author.role}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.time}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <p className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed">{post.content}</p>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-gray-500 text-sm">
              <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Heart className="w-5 h-5" /> <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" /> <span>{post.comments} תגובות</span>
              </button>
              <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" /> <span>שתף</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
