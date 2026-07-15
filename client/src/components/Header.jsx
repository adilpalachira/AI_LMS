import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, MessageSquare, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Command Search Bar */}
      <div className="w-96 max-w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-blue-500/80 focus:bg-white text-xs rounded-xl pl-9 pr-12 py-2.5 transition-all text-gray-900 placeholder-gray-400"
            placeholder="Search for courses, lessons, assignments..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-semibold text-gray-400 bg-gray-200/60 border border-gray-300/40 rounded px-1.5 py-0.5 select-none font-sans">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Messages, Profile Dropdown */}
      <div className="flex items-center gap-5">
        {/* Messages */}
        <button className="text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 transition-all relative">
          <MessageSquare size={17} strokeWidth={2} />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-blue-600 border border-white"></span>
        </button>

        {/* Notifications */}
        <button className="text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 transition-all relative">
          <Bell size={17} strokeWidth={2} />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white"></span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-semibold overflow-hidden text-xs">
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
            <div className="hidden sm:block">
              <p className="text-[12px] font-semibold text-gray-900 leading-none">
                {user?.name || 'Adil M'}
              </p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-gray-200/80 rounded-2xl p-1.5 shadow-lg shadow-gray-200/50 z-50 animate-fadeIn">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium transition-all"
              >
                <UserIcon size={14} />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl px-3 py-2 text-xs font-medium transition-all text-left"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
