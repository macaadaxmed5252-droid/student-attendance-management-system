import React, { useEffect, useState } from 'react';
import { FiBookOpen, FiEdit2, FiLayers, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { classAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const sectionOptions = ['Morning', 'Afternoon', 'Evening'];
const emptyForm = { className: '', section: 'Morning' };

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingClass?._id);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      className: cls?.className || '',
      section: sectionOptions.includes(cls?.section) ? cls.section : 'Morning',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing) {
        await classAPI.update(editingClass._id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Class Updated',
          text: `"${formData.className} - ${formData.section}" has been synchronized successfully.`,
          confirmButtonColor: '#4f46e5',
          timer: 2400,
          timerProgressBar: true,
        });
      } else {
        await classAPI.create(formData);
        Swal.fire({
          icon: 'success',
          title: 'Class Created',
          text: `"${formData.className} - ${formData.section}" has been added to the registry.`,
          confirmButtonColor: '#4f46e5',
          timer: 2400,
          timerProgressBar: true,
        });
      }

      closeModal();
      fetchClasses();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        text: err.response?.data?.error || err.response?.data?.message || 'The class registry request could not be completed.',
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete this class?',
      text: `"${name}" will be permanently removed from the class registry.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Class',
      cancelButtonText: 'Keep Class',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl mx-1',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl mx-1',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await classAPI.delete(id);
          fetchClasses();
          Swal.fire({
            icon: 'success',
            title: 'Class Deleted',
            text: 'The class has been removed from the registry.',
            confirmButtonColor: '#4f46e5',
          });
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || 'Failed to delete class.', 'error');
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl shadow-indigo-950/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-200">Academic Structure</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Class Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Create, edit, and organize cohorts using a clean class name plus section model.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <FiPlus />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <FiBookOpen size={28} />
          </div>
          <p className="mt-5 text-lg font-black text-slate-900">No Classes Found</p>
          <p className="mt-1 text-sm text-slate-500">Create your first academic cohort to begin mapping students and teachers.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls?._id}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 text-indigo-600 ring-1 ring-indigo-100">
                  <FiLayers size={22} />
                </div>
                <div className="flex gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(cls)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    aria-label={`Edit ${cls?.className}`}
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cls?._id, `${cls?.className} - ${cls?.section}`)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Delete ${cls?.className}`}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xl font-black tracking-tight text-slate-950">{cls?.className}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Academic cohort</p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
                  {cls?.section || 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-200">{isEditing ? 'Update Cohort' : 'New Cohort'}</p>
                  <h2 className="mt-2 text-2xl font-black">{isEditing ? 'Edit Class' : 'Create Class'}</h2>
                  <p className="mt-1 text-sm text-slate-300">Classes now use only a class name and an academic section.</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 1A, Year 2B"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Section</label>
                <select
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
