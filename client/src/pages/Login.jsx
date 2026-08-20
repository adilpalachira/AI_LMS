import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck, UserCheck } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse URL search parameters to check if redirect was due to session expiration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpired(true);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    setSessionExpired(false);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="min-h-[88vh] bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black text-white shadow-sm mb-1">
            <Sparkles size={13} className="text-white animate-pulse" />
            AI-Powered Portal
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Sign in to access your customized AI learning dashboard
          </p>
        </div>

        {/* Dashboard Card Container */}
        <div className="bg-white border border-gray-200/90 rounded-[24px] p-8 sm:p-10 shadow-sm relative overflow-hidden space-y-6">
          
          {/* Session Expired Banner */}
          {sessionExpired && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200/80 text-amber-900 p-4 rounded-2xl text-xs font-semibold">
              <AlertCircle size={18} className="shrink-0 text-amber-700" />
              <span>Your session has expired. Please log in again.</span>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold animate-shake">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-gray-900 hover:text-black transition-colors underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 active:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Demo Badges */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Quick Demo Login
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@example.com', 'Student@123')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-3.5 py-1.5 rounded-lg border border-gray-300 transition-all flex items-center gap-1.5"
              >
                <UserCheck size={13} className="text-gray-900" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@example.com', 'Admin@123')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-3.5 py-1.5 rounded-lg border border-gray-300 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck size={13} className="text-gray-900" />
                Admin Demo
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-gray-950 hover:text-black transition-colors underline"
              >
                Create student account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;


