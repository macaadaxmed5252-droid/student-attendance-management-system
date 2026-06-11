import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { studentAPI } from '../../services/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ studentId: '', fullName: '', className: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification framework caught validation formatting mismatch errors.');
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

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">{error}</div>}

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
          <input 
            type="text" required value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition text-slate-800"
          />
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

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10">
          Save Student Profile Record
        </button>
      </form>
    </div>
  );
};

export default AddStudent;