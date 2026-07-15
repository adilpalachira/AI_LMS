import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Access guard based on User Role (Admin, Faculty, Student)
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center border-red-500/20 shadow-xl shadow-red-950/10">
          <div className="inline-flex p-4 bg-red-500/10 text-red-400 rounded-2xl mb-6">
            <ShieldAlert size={36} className="animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-100 mb-2 font-display">
            Access Denied
          </h2>
          
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your role as <span className="text-brand-400 font-semibold">{user.role}</span> does not have permissions to access this module. Please contact the administrator for authorization.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:border-brand-500 hover:text-brand-400 text-slate-300 font-medium py-3 rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
