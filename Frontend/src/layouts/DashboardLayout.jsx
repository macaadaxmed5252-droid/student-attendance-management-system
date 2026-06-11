import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Navigation/Sidebar';
import Navbar from '../components/Navigation/Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 pl-64">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;