import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { teacherAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Teachers = () => {
  const navigate = useNavigate();
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
    Swal.fire({
      title: 'Delete faculty profile?',
      text: 'This permanently removes the educator record from the registry.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Profile',
      cancelButtonText: 'Keep Profile',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl mx-1',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl mx-1',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await teacherAPI.delete(id);
          fetchTeachers();
          Swal.fire({
            icon: 'success',
            title: 'Faculty Removed',
            text: 'The educator profile has been cleared.',
            confirmButtonColor: '#4f46e5',
          });
        } catch (err) {
          Swal.fire('Error', 'Operation failed to process.', 'error');
        }
      }
    });
  };

  const handleEdit = (teacher) => {
    Swal.fire({
      title: 'Open faculty editor?',
      text: `You are about to edit ${teacher?.fullName || 'this educator'}'s profile.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Open Editor',
      cancelButtonText: 'Cancel',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl mx-1',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl mx-1',
      },
    }).then((result) => {
      if (result.isConfirmed) navigate(`/teachers/edit/${teacher?._id}`);
    });
  };

  const filtered = (teachers ?? []).filter(t => t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()));

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

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/40 text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
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
                  <tr key={t._id} className="hover:bg-indigo-50/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.teacherId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.fullName}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {t.academicSpecialty || 'No specialty set'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{t.email}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(t)} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><FiEdit2 size={14} /></button>
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
