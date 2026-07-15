import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Student'); // Default: Student
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all required fields');
      return false;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setFormError('Please enter a valid phone number (e.g. +1234567890)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors([]);

    if (!validateForm()) return;

    setLoading(true);
    const result = await register(name, email, password, confirmPassword, phone, role);
    setLoading(false);

    if (!result.success) {
      if (result.errors) {
        setFieldErrors(result.errors);
      } else {
        setFormError(result.error);
      }
    }
  };

  // Helper to find specific field error
  const getFieldError = (field) => {
    const found = fieldErrors.find((err) => err.field === field);
    return found ? found.message : '';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel max-w-lg w-full space-y-8 p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Decorative Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Student Registration
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Create your student account to access courses and AI features
          </p>
        </div>

        {formError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} autoComplete="off">

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`form-input pl-10 ${getFieldError('name') ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {getFieldError('name') && (
                <p className="text-xs text-red-400 mt-1">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input pl-10 ${getFieldError('email') ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                  placeholder="johndoe@university.edu"
                />
              </div>
              {getFieldError('email') && (
                <p className="text-xs text-red-400 mt-1">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`form-input pl-10 ${getFieldError('phone') ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                  placeholder="+1234567890"
                />
              </div>
              {getFieldError('phone') && (
                <p className="text-xs text-red-400 mt-1">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input pl-10 pr-10 ${getFieldError('password') ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                  placeholder="Min. 8 characters with upper, number, symbol"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-xs text-red-400 mt-1">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input pl-10 pr-10 ${getFieldError('confirmPassword') ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                  placeholder="Confirm password"
                />
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-xs text-red-400 mt-1">{getFieldError('confirmPassword')}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-950/20 transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Register
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
