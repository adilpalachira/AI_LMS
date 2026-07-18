import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Grid, 
  Users as UsersIcon,
  BookOpen, 
  FileText, 
  GraduationCap, 
  CalendarRange, 
  BrainCircuit, 
  LineChart, 
  Calendar, 
  FolderOpen, 
  MessageSquare, 
  Trophy, 
  Settings,
  Sun,
  Moon,
  ChevronsUpDown
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic menu items based on role
  const menuItems = [
    { name: 'Dashboard', icon: Grid, path: '/dashboard' },
    ...(user?.role === 'Admin' ? [{ name: 'Users', icon: UsersIcon, path: '/admin/users' }] : []),
    { name: 'Courses', icon: BookOpen, path: '/courses' },
    ...(user?.role === 'Student' ? [{ name: 'My Courses', icon: GraduationCap, path: '/my-courses' }] : []),
    ...(['Admin', 'Faculty'].includes(user?.role) ? [{ name: 'Manage Courses', icon: FolderOpen, path: '/manage-courses' }] : []),
    ...(user?.role === 'Admin' ? [{ name: 'Categories', icon: Settings, path: '/admin/categories' }] : []),
    { name: 'Assignments', icon: FileText, path: '/assignments' },
    { name: 'Exams', icon: GraduationCap, path: '#' },
    { name: 'Study Planner', icon: CalendarRange, path: '#' },
    { name: 'AI Tutor', icon: BrainCircuit, path: '/ai-tutor' },
    { name: 'Analytics', icon: LineChart, path: '#' },
    { name: 'Calendar', icon: Calendar, path: '#' },
    { name: 'Messages', icon: MessageSquare, path: '#' },
    { name: 'Achievements', icon: Trophy, path: '#' },
    { name: 'Settings', icon: Settings, path: '#' },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#F8FAFC] border-r border-gray-200/80 flex flex-col justify-between py-6 px-4 shrink-0 sticky top-0 font-sans">
      {/* Top Section: Logo */}
      <div className="flex flex-col space-y-8">
        <div className="flex items-center gap-3 px-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg select-none">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-gray-900 leading-none">
              AI-LMS
            </h1>
            <p className="text-[11px] font-medium text-gray-400 mt-1">
              Learn Smarter
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-[2px]">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive && item.path !== '#'
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={16} strokeWidth={2} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Student Profile Card & Theme Switch */}
      <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200/60">
        {/* Student Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors select-none cursor-pointer">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 text-sm font-semibold overflow-hidden shrink-0">
              {user?.profileImage ? (
                <img 
                  src={`http://localhost:5000/${user.profileImage}`} 
                  alt={user.name} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate leading-none">
                {user?.name || 'Adil M'}
              </p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">
                {user?.role || 'Student'}
              </p>
            </div>
          </div>
          <ChevronsUpDown size={14} className="text-gray-400 shrink-0 ml-1" />
        </div>

        {/* Theme Switch */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
          <span className="text-[11px] font-medium text-gray-500 flex items-center gap-2">
            {isDarkMode ? <Moon size={13} className="text-gray-400" /> : <Sun size={13} className="text-gray-400" />}
            Theme mode
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-6 bg-gray-200 rounded-full p-[2px] transition-colors focus:outline-none relative"
          >
            <div 
              className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                isDarkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
