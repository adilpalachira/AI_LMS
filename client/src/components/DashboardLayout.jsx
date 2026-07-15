import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* 260px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 80px Fixed Header */}
        <Header />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
