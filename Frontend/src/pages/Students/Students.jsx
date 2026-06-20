import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { studentAPI } from '../../services/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const canManageStudents = user?.role === 'admin';

  const fetchStudents = async () => {
    try {
      const res = await studentAPI.getAll();
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Delete student profile?',
      text: 'This permanently removes the student record from the registry.',
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
          await studentAPI.delete(id);
          fetchStudents();
          Swal.fire({
            icon: 'success',
            title: 'Student Removed',
            text: 'The registry entry has been cleared.',
            confirmButtonColor: '#4f46e5',
          });
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || 'Execution fault mapping processing matrix.', 'error');
        }
      }
    });
  };

  const handleEdit = (student) => {
    Swal.fire({
      title: 'Open student editor?',
      text: `You are about to edit ${student?.fullName || 'this student'}'s profile.`,
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
      if (result.isConfirmed) navigate(`/students/edit/${student?._id}`);
    });
  };

  const filteredStudents = (students ?? []).filter(s => 
    s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Index Registry</h1>
          <p className="text-sm text-slate-500">Manage institutional profile data models</p>
        </div>
        {canManageStudents && (
          <Link to="/students/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition">
            <FiPlus />
            <span>Enroll New Profile</span>
          </Link>
        )}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-80">
          <FiSearch className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by index keys or structural name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none text-slate-700 w-full"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/40 text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3">ID Key</th>
                <th className="px-6 py-3">Full Legal Name</th>
                <th className="px-6 py-3">Class Allocation</th>
                <th className="px-6 py-3">Email Reference</th>
                {canManageStudents && <th className="px-6 py-3 text-right">Actions Management</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={canManageStudents ? 5 : 4} className="text-center py-8 text-slate-400 font-medium">No matching student targets found</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-indigo-50/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{student.studentId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{student.fullName}</td>
                    <td className="px-6 py-4">{student.className}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{student.email}</td>
                    {canManageStudents && (
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(student)} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(student._id)} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    )}
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

export default Students;
