import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiShield } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile Account</h1>
        <p className="text-sm text-slate-500">Manage identity configuration parameters</p>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 text-center space-y-6">
        <div className="h-24 w-24 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white text-3xl font-black rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{user?.role} Account</span>
        </div>

        <div className="border-t border-slate-100 pt-6 text-left space-y-4">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <FiUser className="text-slate-400" size={18} />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Legal Name</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{user?.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <FiMail className="text-slate-400" size={18} />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Communication Email Channel</p>
              <p className="text-sm font-mono text-slate-800 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <FiShield className="text-slate-400" size={18} />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role Matrix Access Scope</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;