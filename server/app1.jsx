import React, { useState } from 'react';
import {
    Home,
    Briefcase,
    MessageSquare,
    User,
    Bell,
    Search,
    Clapperboard,
    Video,
    Image as ImageIcon,
    Send,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Share2,
    MapPin,
    Calendar,
    Star,
    CheckCircle2
} from 'lucide-react';

// --- Mock Data ---

const CURRENT_USER = {
    id: 1,
    name: "יעל כהן",
    role: "שחקנית | יוצרת",
    avatar: "https://i.pravatar.cc/150?img=47",
    cover: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80&w=1000",
    bio: "בוגרת הסטודיו למשחק. ניסיון בתיאטרון, טלוויזיה וקולנוע עצמאי. אוהבת אתגרים ותפקידים דרמטיים.",
    location: "תל אביב - יפו",
    skills: ["דרמה", "קומדיה", "שירה", "ריקוד מודרני", "דיבוב"],
    credits: [
        { year: 2023, title: "הסודות של אתמול", role: "מיכל (תפקיד ראשי)", type: "סרט גמר - אוניברסיטת תל אביב" },
        { year: 2022, title: "פרסומת לבנק", role: "לקוחה מרוצה", type: "טלוויזיה / מסחרי" },
        { year: 2021, title: "רומיאו ויוליה", role: "יוליה", type: "תיאטרון הפרינג'" }
    ]
};

const POSTS = [
    {
        id: 1,
        author: { name: "דניאל לוי", role: "במאי קולנוע", avatar: "https://i.pravatar.cc/150?img=11" },
        time: "לפני שעתיים",
        content: "סיימנו אתמול את ימי הצילום לסרט הקצר החדש שלנו! תודה לכל הצוות המדהים ולשחקנים שנתנו את הלב והנשמה על הסט. עכשיו מתחילים את שלב העריכה 🎬✨",
        likes: 124,
        comments: 18,
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        author: { name: "סוכנות טאלנטים VIP", role: "סוכנות שחקנים", avatar: "https://i.pravatar.cc/150?img=50" },
        time: "לפני 5 שעות",
        content: "גאים להכריז על פתיחת ההרשמה לסדנת המאסטר-קלאס הקרובה שלנו עם המלהקת המובילה בארץ. מספר המקומות מוגבל! לפרטים נוספים כנסו ללינק.",
        likes: 45,
        comments: 3
    },
    {
        id: 3,
        author: { name: "רועי אברהם", role: "צלם ראשי (DOP)", avatar: "https://i.pravatar.cc/150?img=68" },
        time: "אתמול ב-14:30",
        content: "מחפש עוזר/ת צלם (AC) לפרויקט דוקומנטרי שיצולם בדרום בשבוע הבא. ציוד: Sony FX9. ימי צילום בתשלום מלא כמובן. הצעות בפרטי.",
        likes: 32,
        comments: 5
    }
];

const JOBS = [
    {
        id: 1,
        title: "שחקנית ראשית לסדרת רשת",
        production: "כאן דיגיטל",
        type: "בתשלום",
        location: "תל אביב",
        category: "שחקנים",
        description: "מחפשים שחקנית בגילאי 20-25, בעלת יכולות קומיות מעולות, לסדרת רשת חדשה שעוסקת בחיי הרווקות בעיר. ימי צילום באפריל."
    },
    {
        id: 2,
        title: "דרוש במאי/ת לקליפ מוזיקלי",
        production: "לייבל אינדי",
        type: "תקציב עצמאי",
        location: "מרכז הארץ",
        category: "במאים",
        description: "להקת רוק אלטרנטיבית מחפשת במאי/ת עם חזון ויזואלי ייחודי לצילום קליפ לסינגל החדש. רפרנסים יינתנו למתאימים."
    },
    {
        id: 3,
        title: "ניצבים לסרט קולנוע תקופתי",
        production: "סרטי ירושלים",
        type: "התנדבות/קרדיט",
        location: "ירושלים",
        category: "ניצבים",
        description: "לסרט סטודנטים המתרחש בשנות ה-60, מחפשים ניצבים בכל הגילאים לסצנת רחוב המונית. תסופק ארוחת צהריים והסעות."
    }
];

const CHATS = [
    { id: 1, name: "דניאל לוי", avatar: "https://i.pravatar.cc/150?img=11", lastMessage: "היי יעל, רציתי לדעת אם את פנויה לאודישן ביום חמישי?", time: "10:30", unread: 2 },
    { id: 2, name: "סוכנות טאלנטים VIP", avatar: "https://i.pravatar.cc/150?img=50", lastMessage: "שלחנו את השואוריל שלך למלהקת.", time: "אתמול", unread: 0 },
    { id: 3, name: "רועי אברהם", avatar: "https://i.pravatar.cc/150?img=68", lastMessage: "תודה רבה! נתראה על הסט.", time: "יום ב'", unread: 0 },
];

// --- Components ---

const Navbar = ({ currentTab, setCurrentTab }) => {
    const navItems = [
        { id: 'feed', icon: Home, label: 'ראשי' },
        { id: 'jobs', icon: Clapperboard, label: 'אודישנים' },
        { id: 'network', icon: Briefcase, label: 'קולגות' },
        { id: 'messages', icon: MessageSquare, label: 'הודעות', badge: 2 },
        { id: 'profile', icon: User, label: 'פרופיל' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Logo & Search */}
                    <div className="flex items-center gap-6 flex-1">
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter cursor-pointer" onClick={() => setCurrentTab('feed')}>
                            ShowZ<span className="text-amber-500">.</span>
                        </span>
                        <div className="hidden md:flex relative max-w-md w-full">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="חיפוש שחקנים, במאים, סוכנויות..."
                                className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-1 md:gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentTab(item.id)}
                                    className={`relative flex flex-col items-center justify-center w-16 h-16 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`h-6 w-6 ${isActive ? 'fill-indigo-50 stroke-indigo-600' : ''}`} />
                                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-t-full"></span>
                                    )}
                                    {item.badge && (
                                        <span className="absolute top-2 right-3 flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* User Dropdown Trigger */}
                        <div className="ml-2 pl-4 border-l border-gray-200 hidden md:flex items-center">
                            <img className="h-9 w-9 rounded-full object-cover border-2 border-transparent hover:border-indigo-500 cursor-pointer" src={CURRENT_USER.avatar} alt="User" onClick={() => setCurrentTab('profile')} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const FeedView = () => {
    return (
        <div className="max-w-2xl mx-auto py-6 space-y-6">
            {/* Create Post Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-4">
                    <img src={CURRENT_USER.avatar} alt="User" className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                        <textarea
                            placeholder="מה חדש בתעשייה? שתפו אודישנים, תפקידים או פרויקטים..."
                            className="w-full resize-none border-none focus:ring-0 p-2 text-gray-700 bg-gray-50 rounded-lg min-h-[80px]"
                        ></textarea>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <div className="flex gap-2 text-gray-500">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-500" /> <span className="hidden sm:inline text-sm">תמונה/וידאו</span></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"><Video className="w-5 h-5 text-red-500" /> <span className="hidden sm:inline text-sm">שואוריל</span></button>
                            </div>
                            <button className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                                פרסם
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {POSTS.map(post => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
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

                        {post.image && (
                            <img src={post.image} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
                        )}

                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-gray-500 text-sm">
                            <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                <Heart className="w-5 h-5" />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments} תגובות</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5" />
                                <span>שתף</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const JobsView = () => {
    return (
        <div className="max-w-4xl mx-auto py-6 flex flex-col md:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                    <h2 className="font-bold text-lg mb-4 text-gray-900">סינון משרות</h2>
                    <div className="space-y-2">
                        {['הכל', 'שחקנים', 'במאים', 'ניצבים', 'צוות טכני', 'הפקות סטודנטים'].map((category, idx) => (
                            <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <input type="radio" name="job_category" defaultChecked={idx === 0} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                <span className="text-gray-700">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">לוח אודישנים ומשרות</h1>
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">פרסם משרה +</button>
                </div>

                {JOBS.map(job => (
                    <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{job.category}</span>
                            </div>
                            <p className="text-indigo-600 font-medium text-sm mb-3">{job.production}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                                <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.type}</div>
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                        </div>

                        <div className="w-full md:w-auto mt-4 md:mt-0">
                            <button className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                                הגש מועמדות
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MessagesView = () => {
    return (
        <div className="max-w-6xl mx-auto py-6 h-[calc(100vh-6rem)]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex h-full overflow-hidden">
                {/* Chats List Sidebar */}
                <div className="w-full md:w-80 border-l border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">הודעות</h2>
                        <div className="mt-4 relative">
                            <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="חיפוש באנשי קשר..."
                                className="w-full bg-white border border-gray-300 rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {CHATS.map((chat, idx) => (
                            <div key={chat.id} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${idx === 0 ? 'bg-indigo-50/50' : ''}`}>
                                <div className="relative">
                                    <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                                    {chat.unread > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`font-medium truncate ${chat.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>{chat.name}</h4>
                                        <span className="text-xs text-gray-400">{chat.time}</span>
                                    </div>
                                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Chat Area */}
                <div className="hidden md:flex flex-1 flex-col bg-[#F8F9FA]">
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={CHATS[0].avatar} alt={CHATS[0].name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h3 className="font-bold text-gray-900">{CHATS[0].name}</h3>
                                <p className="text-xs text-green-500 font-medium">מחובר/ת כעת</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    {/* Chat Messages (Mock) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="flex gap-3 max-w-[80%]">
                            <img src={CHATS[0].avatar} alt="User" className="w-8 h-8 rounded-full object-cover mt-auto" />
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-br-sm px-4 py-2 shadow-sm">
                                <p className="text-gray-800 text-sm">היי יעל, ראיתי את השואוריל שלך במערכת והוא מעולה!</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">10:28</span>
                            </div>
                        </div>
                        <div className="flex gap-3 max-w-[80%]">
                            <div className="w-8"></div> {/* Spacer for alignment */}
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-br-sm px-4 py-2 shadow-sm">
                                <p className="text-gray-800 text-sm">רציתי לדעת אם את פנויה לאודישן ביום חמישי הקרוב לסדרה חדשה של 'קשת'?</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">10:30</span>
                            </div>
                        </div>

                        {/* My Message */}
                        <div className="flex gap-3 max-w-[80%] self-end mr-auto flex-row-reverse">
                            <img src={CURRENT_USER.avatar} alt="Me" className="w-8 h-8 rounded-full object-cover mt-auto" />
                            <div className="bg-indigo-600 text-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                                <p className="text-white text-sm">היי דניאל! תודה רבה 😊 אני פנויה ביום חמישי בבוקר. איפה האודישן מתקיים?</p>
                                <span className="text-[10px] text-indigo-200 mt-1 flex items-center justify-end gap-1">
                                    10:35 <CheckCircle2 className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex items-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <textarea
                                    placeholder="הקלד הודעה..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none min-h-[44px] max-h-32"
                                    rows="1"
                                ></textarea>
                            </div>
                            <button className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition-colors shrink-0 shadow-sm flex items-center justify-center">
                                <Send className="w-5 h-5 rtl:rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileView = () => {
    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cover Photo */}
                <div className="h-64 w-full relative">
                    <img src={CURRENT_USER.cover} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 relative">
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <img
                            src={CURRENT_USER.avatar}
                            alt={CURRENT_USER.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md relative z-10"
                        />
                        <div className="flex gap-3 mb-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                ערוך פרופיל
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                                הוסף לשואוריל
                            </button>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{CURRENT_USER.name}</h1>
                        <p className="text-lg text-indigo-600 font-medium mb-2">{CURRENT_USER.role}</p>
                        <p className="text-gray-500 flex items-center gap-1.5 mb-4 text-sm">
                            <MapPin className="w-4 h-4" /> {CURRENT_USER.location}
                        </p>
                        <p className="text-gray-800 leading-relaxed max-w-2xl">
                            {CURRENT_USER.bio}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Sections */}
                <div className="flex flex-col md:flex-row p-8 gap-8">
                    {/* Left Column */}
                    <div className="w-full md:w-2/3 space-y-8">
                        {/* Showreel Section */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Video className="w-5 h-5 text-indigo-600" /> שואוריל (Showreel)
                            </h2>
                            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800" alt="Showreel Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-2"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Experience / Credits */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-indigo-600" /> ניסיון מקצועי (Credits)
                            </h2>
                            <div className="space-y-4">
                                {CURRENT_USER.credits.map((credit, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                        <div className="w-16 shrink-0 text-center text-gray-400 font-bold text-lg pt-1">{credit.year}</div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{credit.title}</h3>
                                            <p className="text-indigo-600">{credit.role}</p>
                                            <p className="text-gray-500 text-sm">{credit.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="w-full md:w-1/3 space-y-8">
                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">כישורים מיוחדים</h2>
                            <div className="flex flex-wrap gap-2">
                                {CURRENT_USER.skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">נתונים פיזיים</h2>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">גובה</span> <span className="font-medium">1.68 ס"מ</span>
                                </li>
                                <li className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">צבע עיניים</span> <span className="font-medium">חום</span>
                                </li>
                                <li className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">צבע שיער</span> <span className="font-medium">חום כהה</span>
                                </li>
                                <li className="flex justify-between pb-2">
                                    <span className="text-gray-500">שפות</span> <span className="font-medium">עברית, אנגלית</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Container ---

export default function App() {
    const [currentTab, setCurrentTab] = useState('feed');

    // View Router
    const renderContent = () => {
        switch (currentTab) {
            case 'feed': return <FeedView />;
            case 'jobs': return <JobsView />;
            case 'messages': return <MessagesView />;
            case 'profile': return <ProfileView />;
            case 'network': return <div className="p-8 text-center text-gray-500">עמוד קולגות (Network) בבנייה...</div>;
            default: return <FeedView />;
        }
    };

    return (
        // Set explicit RTL direction for Hebrew
        <div dir="rtl" className="min-h-screen bg-[#F3F4F6] font-sans text-right">
            <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <main className="px-4 pb-20 md:pb-8">
                {renderContent()}
            </main>
        </div>
    );
}