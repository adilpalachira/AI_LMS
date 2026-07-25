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
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#F8FAFC]">
        <div className="bg-white max-w-md w-full p-8 rounded-[20px] text-center border border-gray-200/80 shadow-sm space-y-4">
          <div className="inline-flex p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <ShieldAlert size={36} />
          </div>
          
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Access Denied
          </h2>
          
          <p className="text-gray-500 text-xs leading-relaxed">
            Your role as <span className="text-blue-600 font-bold">{user.role}</span> does not have permissions to access this module. Please contact the administrator for authorization.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
