import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white border border-gray-200/90 rounded-[20px] shadow-xl w-full max-w-md p-6 overflow-hidden z-10 animate-scaleUp font-sans">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Modal content */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl">
            <AlertCircle size={24} />
          </div>

          <div className="space-y-1 px-2">
            <h3 className="text-sm font-bold text-gray-900">Delete user account?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This action is permanent and cannot be undone. All user data, enrollment records, and logs will be deleted from the system.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 font-semibold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeleteUserModal;
