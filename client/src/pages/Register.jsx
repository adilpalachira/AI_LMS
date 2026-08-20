import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, GraduationCap, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-[90vh] bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">

      <div className="max-w-lg w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black text-white shadow-sm mb-1">
            <Sparkles size={13} className="text-white animate-pulse" />
            EduAI LMS Platform
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Join EduAI LMS to access personalized study paths and AI tools
          </p>
        </div>

        {/* Dashboard Card Container */}
        <div className="bg-white border border-gray-200/90 rounded-[24px] p-8 sm:p-10 shadow-sm relative overflow-hidden space-y-6">

          {/* Form Error Banner */}
          {formError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold animate-shake">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            
            {/* Account Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 border border-gray-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'Student'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 font-medium'
                  }`}
                >
                  <GraduationCap size={15} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Faculty')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'Faculty'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-950 font-medium'
                  }`}
                >
                  <ShieldCheck size={15} />
                  Faculty
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-white border ${getFieldError('name') ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-black focus:ring-black/10'} focus:ring-2 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm`}
                  placeholder="John Doe"
                />
              </div>
              {getFieldError('name') && (
                <p className="text-xs text-red-600 font-medium">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Address <span className="text-red-500">*</span>
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
                  className={`w-full bg-white border ${getFieldError('email') ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-black focus:ring-black/10'} focus:ring-2 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm`}
                  placeholder="johndoe@university.edu"
                />
              </div>
              {getFieldError('email') && (
                <p className="text-xs text-red-600 font-medium">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-white border ${getFieldError('phone') ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-black focus:ring-black/10'} focus:ring-2 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm`}
                  placeholder="+1234567890"
                />
              </div>
              {getFieldError('phone') && (
                <p className="text-xs text-red-600 font-medium">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white border ${getFieldError('password') ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-black focus:ring-black/10'} focus:ring-2 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm`}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-xs text-red-600 font-medium">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-white border ${getFieldError('confirmPassword') ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-black focus:ring-black/10'} focus:ring-2 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm`}
                  placeholder="Confirm password"
                />
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-xs text-red-600 font-medium">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 active:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-bold text-gray-950 hover:text-black transition-colors underline"
              >
                Sign in to your account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;


