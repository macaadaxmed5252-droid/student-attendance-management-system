import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-center p-6">
      <div className="space-y-4">
        <h1 className="text-8xl font-black tracking-tight text-indigo-600">404</h1>
        <h2 className="text-2xl font-bold text-slate-900">Unmapped Navigation Boundary</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">The target application route mapping path is missing or has been moved within registry hierarchies.</p>
        <Link to="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md transition">
          Return to Dashboard Metrics
        </Link>
      </div>
    </div>
  );
};

export default NotFound;