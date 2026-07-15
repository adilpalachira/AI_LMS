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
          // Convert localhost link to match the correct router format
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel max-w-md w-full space-y-8 p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we'll help you reset it
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl text-sm">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Request successful</p>
                <p className="text-xs text-slate-300 leading-relaxed">{successMsg}</p>
              </div>
            </div>

            {testResetUrl && (
              <div className="bg-brand-950/40 border border-brand-500/30 p-5 rounded-2xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 bg-brand-500/20 text-brand-300 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <Sparkles size={8} />
                  Dev Helper
                </div>
                <p className="text-xs text-brand-300 font-semibold">Testing Password Reset Flow:</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Since SMTP is mock in local development, we generated your reset link below. Click it to navigate to the reset password view:
                </p>
                <a
                  href={testResetUrl}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold underline break-all"
                >
                  Reset Password Link
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
              className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              Request Again
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
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
                  className="form-input pl-10"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-950/20 transition-all duration-200"
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
  );
};

export default ForgotPassword;
