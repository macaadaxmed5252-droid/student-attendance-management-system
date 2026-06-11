import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { teacherAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
  try {
    const res = await teacherAPI.getAll();
    setTeachers(res.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete faculty account permanently across institutional data blocks?')) {
      try {
        await teacherAPI.delete(id);
        fetchTeachers();
      } catch (err) {
        alert('Operation failed to process.');
      }
    }
  };

  const filtered = teachers.filter(t => t.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Staff Registry</h1>
          <p className="text-sm text-slate-500">Manage institutional educators</p>
        </div>
        <Link to="/teachers/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition">
          <FiPlus />
          <span>Onboard Faculty Staff</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80">
          <FiSearch className="text-slate-400" />
          <input type="text" placeholder="Search faculty profiles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm outline-none text-slate-700 w-full" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3">ID Code</th>
                <th className="px-6 py-3">Educator Name</th>
                <th className="px-6 py-3">Academic Specialty</th>
                <th className="px-6 py-3">Email Matrix</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400 font-medium">No active educators discovered</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.teacherId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.fullName}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{t.subject}</td>
                    <td className="px-6 py-4 text-xs font-mono">{t.email}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link to={`/teachers/edit/${t._id}`} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><FiEdit2 size={14} /></Link>
                      <button onClick={() => handleDelete(t._id)} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;