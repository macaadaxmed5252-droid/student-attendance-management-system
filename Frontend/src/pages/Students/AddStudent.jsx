import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { studentAPI, classAPI } from '../../services/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ studentId: '', fullName: '', className: '', email: '', phone: '', password: '' });
  const [availableClasses, setAvailableClasses] = useState([]);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await classAPI.getAll();
        setAvailableClasses(res.data || []);
      } catch (err) {
        console.error('Failed to fetch classes', err);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await studentAPI.create(formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Account Onboarded',
        text: 'Profile database entry committed successfully!',
        confirmButtonColor: '#4f46e5',
      });
      navigate('/students');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Verification framework caught validation formatting mismatch errors.',
        confirmButtonColor: '#e11d48',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Student Profile</h1>
          <p className="text-sm text-slate-500">Establish unique system profile index records</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student ID Key</label>
            <input 
              type="text" required value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Legal Name</label>
            <input 
              type="text" required value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Allocation Group</label>
          <select 
            required value={formData.className}
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
            <input 
              type="email" required value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Mobile Contact</label>
            <input 
              type="text" required value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Secure Password</label>
          <input 
            type="password" required value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10">
          Save Student Profile Record
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
