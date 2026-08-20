import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, GraduationCap, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // Get user avatar initials or full path
  const getAvatar = () => {
    if (user?.profileImage) {
      return `http://localhost:5000/${user.profileImage}`;
    }
    return null;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-950">
              <span className="flex items-center gap-2">
                <span className="h-7 w-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold select-none shadow-sm">
                  ⚡
                </span>
                <span className="text-gray-950 font-extrabold">
                  EduAI LMS
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-950 px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/courses"
                    className="text-gray-600 hover:text-gray-950 px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    Courses
                  </Link>

                  {user.role === 'Student' && (
                    <Link
                      to="/my-courses"
                      className="text-gray-600 hover:text-gray-950 px-3 py-2 text-xs font-semibold transition-colors"
                    >
                      My Courses
                    </Link>
                  )}

                  {['Admin', 'Faculty'].includes(user.role) && (
                    <Link
                      to="/manage-courses"
                      className="text-gray-600 hover:text-gray-950 px-3 py-2 text-xs font-semibold transition-colors"
                    >
                      Manage Courses
                    </Link>
                  )}

                  {user.role === 'Admin' && (
                    <Link
                      to="/admin/categories"
                      className="text-gray-600 hover:text-gray-950 px-3 py-2 text-xs font-semibold transition-colors"
                    >
                      Categories
                    </Link>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-900 overflow-hidden text-xs font-bold">
                        {getAvatar() ? (
                          <img
                            src={getAvatar()}
                            alt={user.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-gray-600 hover:text-gray-950 text-xs font-semibold flex items-center gap-1 transition-colors">
                        {user.name.split(' ')[0]}
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-52 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-lg shadow-gray-200/50 z-50 animate-fadeIn">
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{user.name}</p>
                          <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-900 border border-gray-200">
                            {user.role}
                          </span>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium transition-all"
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
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-950 text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-black hover:bg-slate-800 text-white px-4.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white md:hidden px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-150 mb-2">
                <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-900 font-bold overflow-hidden">
                  {getAvatar() ? (
                    <img src={getAvatar()} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-950">{user.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{user.role}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-gray-950 px-3 py-2 rounded-xl hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-gray-950 px-3 py-2 rounded-xl hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50/50 text-xs font-semibold transition-colors text-left"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-gray-600 hover:text-gray-950 px-3 py-2 rounded-xl hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-black hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

