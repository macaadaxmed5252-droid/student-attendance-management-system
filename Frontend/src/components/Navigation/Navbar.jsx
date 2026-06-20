import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const loadAvatar = () => {
      if (user?.email) {
        const savedAvatar = localStorage.getItem(`userAvatar_${user.email}`);
        setAvatar(savedAvatar || null);
      }
    };
    
    loadAvatar();
    window.addEventListener('storage', loadAvatar);
    return () => window.removeEventListener('storage', loadAvatar);
  }, [user]);

  return (
    <header className="h-16 border-b border-slate-100 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 w-96 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <FiSearch className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search registry indices..." 
          className="bg-transparent text-sm w-full outline-none text-slate-700"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200" />
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center rounded-xl font-semibold shadow-sm overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() || <FiUser />
            )}
          </div>
          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-slate-800">{user?.fullName}</h4>
            <span className="text-xs font-medium text-indigo-600 capitalize bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;