import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { studentAPI, classAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ studentId: '', fullName: '', className: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classesRes] = await Promise.all([
          studentAPI.getById(id),
          classAPI.getAll()
        ]);
        setFormData(studentRes.data);
        setAvailableClasses(classesRes.data || []);
      } catch (err) {
        Swal.fire('Error', 'Failed to fetch the target profile record.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.update(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'The student profile was successfully updated.',
        confirmButtonColor: '#4f46e5',
      });
      navigate('/students');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Validation system error structural collision occurred.',
        confirmButtonColor: '#e11d48',
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modify Student Profile</h1>
          <p className="text-sm text-slate-500">Edit existing system documentation data models</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student ID Key (Immutable)</label>
            <input type="text" disabled value={formData.studentId} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-500 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Legal Name</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Allocation Group</label>
          <select
            required
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
          >
            <option value="" disabled>Select a class</option>
            {availableClasses.map(cls => (
              <option key={cls._id} value={cls.className}>
                {cls.className} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Mobile Contact</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10">
          Commit Parameter Changes
        </button>
      </form>
    </div>
  );
};

export default EditStudent;
