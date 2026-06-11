import React, { useEffect, useState } from 'react';
import { studentAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({});
  const [classFilter, setClassFilter] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const res = await studentAPI.getAll();
        setStudents(res.data || []);
        
        // Initialize state vectors for each student
        const initialSheet = {};
        res.data?.forEach(s => { initialSheet[s._id] = 'Present'; });
        setAttendanceSheet(initialSheet);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      return setMessage({ text: 'Access Forbidden: Only educators can log attendance.', type: 'error' });
    }
    
    try {
      setMessage({ text: '', type: '' });
      let successCount = 0;
      let conflictCount = 0;

      const filtered = classFilter ? students.filter(s => s.className === classFilter) : students;

      for (const s of filtered) {
        try {
          await attendanceAPI.mark({
            student: s._id,
            date: targetDate,
            status: attendanceSheet[s._id]
          });
          successCount++;
        } catch (err) {
          if (err.response?.status === 400) conflictCount++;
        }
      }

      setMessage({
        text: `Attendance processing finished. Logs saved: ${successCount}. Conflicts found: ${conflictCount}.`,
        type: successCount > 0 ? 'success' : 'error'
      });
    } catch (err) {
      setMessage({ text: 'Global infrastructure synchronization fault.', type: 'error' });
    }
  };

  const uniqueClasses = [...new Set(students.map(s => s.className))];
  const filteredStudents = classFilter ? students.filter(s => s.className === classFilter) : students;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Register</h1>
        <p className="text-sm text-slate-500">Mark daily attendance for enrolled students</p>
      </div>

      {message.text && (
        <div className={`p-4 text-sm font-semibold border rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-1.5 w-full sm:w-1/3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select Date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 transition" />
        </div>
        <div className="space-y-1.5 w-full sm:w-1/3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter Class Group</label>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 transition">
            <option value="">All Available Groups</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button onClick={handleSaveAttendance} className="w-full sm:w-1/3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10">
            Commit Attendance Sheet
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3">ID Code</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Class Group</th>
                <th className="px-6 py-3 text-right">Status State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No target arday found for selection</td></tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{s.studentId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="px-6 py-4">{s.className}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
                        {['Present', 'Absent', 'Late'].map((status) => (
                          <button
                            key={status}
                            disabled={user?.role !== 'teacher' && user?.role !== 'admin'}
                            onClick={() => handleStatusChange(s._id, status)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              attendanceSheet[s._id] === status
                                ? status === 'Present' ? 'bg-green-600 text-white shadow' :
                                  status === 'Absent' ? 'bg-red-600 text-white shadow' : 'bg-amber-500 text-white shadow'
                                : 'text-slate-600 hover:bg-slate-200/60 disabled:hover:bg-transparent'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
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

export default Attendance;