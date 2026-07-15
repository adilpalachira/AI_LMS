import React from 'react';

/**
 * Premium glassmorphic loading spinner
 */
const LoadingSpinner = ({ fullScreen = true }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Outer Glow Ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-b-blue-500 border-r-blue-500 animate-spin [animation-duration:1.5s]"></div>
      </div>
      <p className="text-slate-400 font-medium tracking-widest text-xs uppercase animate-pulse">
        Loading System...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{spinnerContent}</div>;
};

export default LoadingSpinner;
