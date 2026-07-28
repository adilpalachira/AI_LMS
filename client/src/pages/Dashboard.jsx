import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Clock, 
  Upload, 
  BookOpen, 
  Layers,
  HelpCircle,
  Activity,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pending works checklist
  const pendingWorks = [
    { id: 1, type: 'Assignment', title: 'CN Assignment – Subnetting', subject: 'Computer Networks', due: 'Due Tomorrow', priority: 'High', color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 2, type: 'Quiz', title: 'DBMS Quiz – Normal Forms', subject: 'Database Management Systems', due: 'Due in 2 days', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 3, type: 'Lab', title: 'OS Lab Report – File System', subject: 'Operating Systems', due: 'Due in 3 days', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 4, type: 'Reading', title: 'Read: Indexing Techniques', subject: 'DBMS Notes', due: 'Due in 4 days', priority: 'Low', color: 'text-green-600 bg-green-50 border-green-200' },
    { id: 5, type: 'Quiz', title: 'CN Quiz – Transport Layer', subject: 'Computer Networks', due: 'Due in 5 days', priority: 'Low', color: 'text-green-600 bg-green-50 border-green-200' }
  ];

  // Today's schedule timeline items
  const schedule = [
    { time: '09:00 AM', duration: '1h 30m', title: 'DBMS Lecture – Normalization', detail: 'Room 301', color: 'border-blue-600' },
    { time: '11:00 AM', duration: '1h', title: 'OS Tutorial', detail: 'Lab 2', color: 'border-emerald-600' },
    { time: '02:00 PM', duration: '1h 30m', title: 'CN Lecture – Routing Concepts', detail: 'Room 205', color: 'border-amber-600' },
    { time: '04:00 PM', duration: '2h', title: 'Study Time', detail: 'Library', color: 'border-purple-600' }
  ];

  // Upcoming Exams data
  const upcomingExams = [
    { title: 'DBMS Internal Exam', date: '28 June 2025', time: '10:00 AM', daysLeft: 15 },
    { title: 'OS Practical Assessment', date: '04 July 2025', time: '02:00 PM', daysLeft: 21 }
  ];

  // Recent Activity data
  const activities = [
    { text: 'Completed: Relational Algebra Quiz', time: 'Yesterday, 08:45 PM', iconColor: 'text-green-600 bg-green-50 border-green-100' },
    { text: 'Studied: Database Keys', time: 'Yesterday, 06:30 PM', iconColor: 'text-blue-600 bg-blue-50 border-blue-100' },
    { text: 'Submitted: OS Lab Report', time: '21 May 2025, 11:20 AM', iconColor: 'text-purple-600 bg-purple-50 border-purple-100' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* 260px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 80px Fixed Header */}
        <Header />

        {/* Dashboard Grid Container */}
        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-12">
          
          {/* HERO SECTION */}
          <section className="bg-white border border-gray-200/80 rounded-[20px] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
            {/* Background design accents (Notion style) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-3 z-10 md:max-w-2xl">
              <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Good morning, {user?.name?.split(' ')[0] || 'Adil'} 👋
              </h2>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Today’s focus shapes your future.
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Stay consistent and make progress every day.
              </p>
            </div>

            {/* Premium minimal SVG book & plant illustration (No AI floating style) */}
            <div className="shrink-0 z-10 hidden md:block">
              <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800">
                {/* Shelf line */}
                <line x1="10" y1="110" x2="210" y2="110" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
                
                {/* Stacked books */}
                {/* Book 1 (Bottom) */}
                <rect x="110" y="94" width="80" height="15" rx="3" fill="#1E293B" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="120" y1="101" x2="180" y2="101" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                {/* Book 2 (Middle) */}
                <rect x="115" y="78" width="72" height="15" rx="3" fill="#475569" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="125" y1="85" x2="175" y2="85" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Book 3 (Top) */}
                <rect x="105" y="62" width="85" height="15" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
                <line x1="115" y1="69" x2="180" y2="69" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

                {/* Minimal Plant Pot */}
                <path d="M45 110L42 80H68L65 110H45Z" fill="#F1F5F9" stroke="#E5E7EB" strokeWidth="1.5" />
                {/* Soil */}
                <ellipse cx="55" cy="80" rx="12" ry="2" fill="#94A3B8" />
                {/* Plant Leaves */}
                <path d="M55 80C55 80 40 60 42 50C44 40 55 52 55 80Z" fill="#10B981" fillOpacity="0.8" />
                <path d="M55 80C55 80 70 65 68 55C66 45 55 58 55 80Z" fill="#059669" />
                <path d="M55 80C55 80 50 65 48 58C46 51 55 64 55 80Z" fill="#34D399" />
              </svg>
            </div>
          </section>

          {/* FIRST ROW: 3 Large Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Today's Topic */}
            <div className="premium-card flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <BookOpen size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Today's Topic</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-blue-600">DBMS – Unit 2</p>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug">
                    Database Normalization
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                    Learn the rules of normalization and how to reduce redundancy in databases.
                  </p>
                </div>
              </div>

              {/* Action layout */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Progress ring SVG */}
                  <div className="relative h-11 w-11 flex items-center justify-center">
                    <svg className="absolute transform -rotate-90" width="44" height="44">
                      <circle cx="22" cy="22" r="18" stroke="#F1F5F9" strokeWidth="3" fill="transparent" />
                      <circle cx="22" cy="22" r="18" stroke="#2563EB" strokeWidth="3" fill="transparent" strokeDasharray="113" strokeDashoffset="113" strokeLinecap="round" />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-500">0%</span>
                  </div>
                  
                  <div className="text-[11px] font-medium text-gray-400">
                    <p className="text-gray-950 font-bold">Estimated time</p>
                    <p className="mt-0.5">45 min</p>
                  </div>
                </div>

                <button className="bg-black hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm">
                  Start Learning
                </button>
              </div>
            </div>

            {/* Card 2: Next Exam Countdown */}
            <div className="premium-card flex flex-col justify-between h-72">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Days Until Next Exam</span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">15</span>
                  <span className="text-xs font-medium text-gray-400">days left</span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900">DBMS Internal Exam</p>
                  <p className="text-[11px] font-medium text-gray-400">28 June 2025</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                  Preparation needed
                </span>
                
                <button className="text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                  View Syllabus
                </button>
              </div>
            </div>

            {/* Card 3: Pending Works */}
            <div className="premium-card h-72 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckSquare size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pending Works</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-150 px-2 py-0.5 rounded-full">
                    5 tasks
                  </span>
                </div>

                {/* Items List (max 4 per spec) */}
                <div className="space-y-2">
                  {pendingWorks.slice(0, 4).map((work) => (
                    <div key={work.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate leading-tight">
                          {work.title}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                          {work.due}
                        </p>
                      </div>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${work.color}`}>
                        {work.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 text-center">
                <button className="w-full text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                  View all pending work
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

          </section>

          {/* SECOND ROW: Schedule (Left) & Quick Actions (Right) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Today's Schedule */}
            <div className="premium-card lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={18} />
                  <h2 className="text-base font-bold text-gray-900">Today's Schedule</h2>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium">
                  View Calendar
                </button>
              </div>

              {/* Timeline Layout */}
              <div className="space-y-6 relative pl-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {schedule.map((item, idx) => (
                  <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Timeline bullet dot */}
                    <div className={`absolute left-[-21px] h-3.5 w-3.5 rounded-full border-4 border-white bg-white shadow-sm ring-2 ring-gray-100 z-10 flex items-center justify-center`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-amber-500' : 'bg-purple-500'}`} />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-900 w-16 shrink-0">{item.time}</span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.detail}</p>
                      </div>
                    </div>

                    <div className="text-[10px] font-semibold text-gray-400 sm:text-right">
                      {item.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="premium-card lg:col-span-4 flex flex-col justify-between h-[360px] lg:h-auto">
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/ai-tutor')}
                    className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-600" />
                      Ask AI Tutor
                    </span>
                    <ArrowRight size={12} className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate('/personalized-learning')}
                    className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                  >
                    <span className="flex items-center gap-2">
                      <BrainCircuit size={14} className="text-purple-600" />
                      Personalized Learning
                    </span>
                    <ArrowRight size={12} className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate('/study-planner')}
                    className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-600" />
                      Open Study Planner
                    </span>
                    <ArrowRight size={12} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="pt-4 text-center border-t border-gray-50">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors">
                  Configure shortcuts
                </button>
              </div>
            </div>

          </section>

          {/* THIRD ROW: Upcoming Exams (Left) & Recent Activity (Right) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Upcoming Exams */}
            <div className="premium-card space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={18} />
                  <h2 className="text-base font-bold text-gray-900">Upcoming Exams</h2>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {upcomingExams.map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/85 rounded-2xl">
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className="bg-white border border-gray-200 text-center w-12 py-1.5 rounded-xl shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Jun</p>
                        <p className="text-base font-extrabold text-gray-900 mt-1 leading-none">28</p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-900">{exam.title}</p>
                        <p className="text-[10px] font-medium text-gray-400">
                          {exam.date} • {exam.time}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{exam.daysLeft}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Days Left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recent Activity */}
            <div className="premium-card space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-gray-400" size={18} />
                  <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${act.iconColor}`}>
                      <FileText size={13} />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-gray-800">{act.text}</p>
                      <p className="text-[10px] text-gray-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
