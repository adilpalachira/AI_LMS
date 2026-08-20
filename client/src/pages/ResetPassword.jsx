import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid password reset request. Missing token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('No token found. Cannot reset password.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">

      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black text-white shadow-sm mb-1">
            <Sparkles size={13} className="text-white animate-pulse" />
            Security & Authentication
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Set your new security credentials for EduAI LMS
          </p>
        </div>

        {/* Dashboard Card Container */}
        <div className="bg-white border border-gray-200/90 rounded-[24px] p-8 sm:p-10 shadow-sm relative overflow-hidden space-y-6">

          {errorMsg && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="inline-flex p-4 bg-gray-100 border border-gray-300 text-gray-900 rounded-full mb-1">
                <CheckCircle size={36} className="animate-pulse text-gray-950" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-950">Password Updated!</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Your password has been updated successfully. You can now use your new credentials to sign in.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm"
              >
                Go to Sign In
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  New Password
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
                    className="w-full bg-white border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm"
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Confirm New Password
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
                    className="w-full bg-white border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-black hover:bg-slate-800 active:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


