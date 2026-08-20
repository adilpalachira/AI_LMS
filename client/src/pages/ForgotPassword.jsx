import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testResetUrl, setTestResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setTestResetUrl('');

    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSuccessMsg(response.data.message);
        
        // Expose reset url locally to simplify testing
        if (response.data.data?.resetUrl) {
          const formattedUrl = response.data.data.resetUrl;
          setTestResetUrl(formattedUrl);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">

      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-950 transition-colors mb-2 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Enter your account email and we'll send you reset instructions
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

          {successMsg ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold">
                <CheckCircle size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">Request Sent!</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">{successMsg}</p>
                </div>
              </div>

              {testResetUrl && (
                <div className="bg-gray-100 border border-gray-300 p-5 rounded-2xl space-y-2.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 bg-black text-white rounded-bl-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles size={10} />
                    Dev Helper
                  </div>
                  <p className="text-xs text-gray-950 font-bold">Testing Password Reset Link:</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Click the link below to directly open the password reset page:
                  </p>
                  <a
                    href={testResetUrl}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-950 hover:text-black font-bold underline break-all"
                  >
                    Open Reset Password Form
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}

              <button
                onClick={() => {
                  setSuccessMsg('');
                  setEmail('');
                  setTestResetUrl('');
                }}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold py-3 rounded-xl text-xs transition-all shadow-sm"
              >
                Request Again
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-slate-800 active:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send Reset Link
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

export default ForgotPassword;


