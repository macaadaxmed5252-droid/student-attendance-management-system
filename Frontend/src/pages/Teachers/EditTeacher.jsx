import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { teacherAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ teacherId: '', fullName: '', subject: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await teacherAPI.getById(id);
        setFormData(res.data);
      } catch (err) {
        setError('Failed to fetch the target record data parameters.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.update(id, formData);
      navigate('/teachers');
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing record update payload modification steps.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teachers" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"><FiArrowLeft /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modify Faculty Record Details</h1>
          <p className="text-sm text-slate-500">Update system context data profiles</p>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teacher ID (Immutable)</label>
            <input type="text" disabled value={formData.teacherId} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-500 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Specialization Subject</label>
          <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address Contact</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Primary Telephone Numbers</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800" />
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10">Commit Structural Profile Changes</button>
      </form>
    </div>
  );
};

export default EditTeacher;