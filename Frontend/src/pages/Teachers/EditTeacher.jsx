import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { teacherAPI, classAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ teacherId: '', fullName: '', academicSpecialty: '', assignedClasses: [], email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [teacherRes, classesRes] = await Promise.all([
          teacherAPI.getById(id),
          classAPI.getAll()
        ]);
        
        const teacher = teacherRes.data;
        // The API might return assignedClasses as populated objects or IDs. Map them to IDs.
        const assignedClassIds = teacher.assignedClasses ? teacher.assignedClasses.map(c => typeof c === 'object' ? c._id : c) : [];
        setFormData({ ...teacher, academicSpecialty: teacher.academicSpecialty || '', assignedClasses: assignedClassIds });
        setAvailableClasses(classesRes.data || []);
      } catch (err) {
        Swal.fire('Error', 'Failed to fetch the target record data parameters.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.update(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'The educator profile was successfully updated.',
        confirmButtonColor: '#4f46e5',
      });
      navigate('/teachers');
    } catch (err) {
      const errMsg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || 'Error executing record update payload modification steps.';
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errMsg,
        confirmButtonColor: '#e11d48',
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teachers" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"><FiArrowLeft /></Link>
        <div>
          <h1 className="text-2xl font-black text-slate-950">Modify Faculty Record Details</h1>
          <p className="text-sm text-slate-500">Update educator discipline, identity, and assigned class cohorts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-200">Faculty Profile</p>
          <h2 className="mt-2 text-xl font-black">Academic Identity Update</h2>
          <p className="mt-1 text-sm text-slate-300">Subject specialty remains independent from assigned class records.</p>
        </div>
        <div className="space-y-5 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Teacher ID (Immutable)</label>
            <input type="text" disabled value={formData.teacherId} className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Full Name</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500">Academic Specialty Discipline</label>
          <input
            type="text"
            required
            placeholder="e.g. Mathematics, Physics, English Literature"
            value={formData.academicSpecialty || ''}
            onChange={(e) => setFormData({ ...formData, academicSpecialty: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500">Assigned Classes</label>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {availableClasses.length === 0 ? (
              <p className="text-sm text-slate-500">No classes available.</p>
            ) : (
              availableClasses.map(cls => (
                <label key={cls._id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-indigo-50">
                  <input
                    type="checkbox"
                    value={cls._id}
                    checked={formData.assignedClasses.includes(cls._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assignedClasses: [...formData.assignedClasses, cls._id] });
                      } else {
                        setFormData({ ...formData, assignedClasses: formData.assignedClasses.filter(id => id !== cls._id) });
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{cls.className} - {cls.section}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Email Address Contact</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Primary Telephone Numbers</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
        </div>
        <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-3 font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">Commit Structural Profile Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;
