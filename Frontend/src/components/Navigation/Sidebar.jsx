import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiAward, FiCheckSquare, FiPieChart, FiUser, FiLogOut, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: FiGrid, roles: ['admin', 'teacher', 'student'] },
    { path: '/students', label: 'Students', icon: FiUsers, roles: ['admin', 'teacher'] },
    { path: '/teachers', label: 'Teachers', icon: FiAward, roles: ['admin'] },
    { path: '/classes', label: 'Classes', icon: FiBookOpen, roles: ['admin'] },
    { path: '/attendance', label: 'Attendance', icon: FiCheckSquare, roles: ['admin', 'teacher', 'student'] },
    { path: '/reports', label: 'Reports', icon: FiPieChart, roles: ['admin', 'teacher'] },
    { path: '/profile', label: 'My Profile', icon: FiUser, roles: ['admin', 'teacher', 'student'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30">
      <div>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <div className="h-9 w-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20">Ω</div>
          <span className="text-white font-bold tracking-tight text-base">EduTrack Pro</span>
        </div>
        
        <nav className="p-4 flex flex-col gap-1">
          {links.map((link) => {
            if (link.roles && !link.roles.includes(user?.role)) return null;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition"
        >
          <FiLogOut size={18} />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;