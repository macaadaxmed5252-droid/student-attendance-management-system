import React, { useEffect, useState } from 'react';
import { studentAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FiCheck, FiX, FiInfo, FiRefreshCw } from 'react-icons/fi';

const attendanceOptions = [
  {
    value: 'Present',
    label: 'Present',
    Icon: FiCheck,
    selectedClass: 'border-green-300 bg-green-50 text-green-700 shadow-sm ring-2 ring-green-100',
    idleClass: 'border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50/70 hover:text-green-700',
    iconClass: 'bg-green-100 text-green-700',
  },
  {
    value: 'Absent',
    label: 'Absent',
    Icon: FiX,
    selectedClass: 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm ring-2 ring-rose-100',
    idleClass: 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700',
    iconClass: 'bg-rose-100 text-rose-700',
  },
  {
    value: 'Excused',
    label: 'Excused',
    Icon: FiInfo,
    selectedClass: 'border-amber-300 bg-amber-50 text-amber-700 shadow-sm ring-2 ring-amber-100',
    idleClass: 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-700',
    iconClass: 'bg-amber-100 text-amber-700',
  },
];

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({});
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [studentMetrics, setStudentMetrics] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unmarkedStudentIds, setUnmarkedStudentIds] = useState([]);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setError('');

        if (user?.role === 'student') {
          const metricsRes = await attendanceAPI.getMyMetrics();
          setStudentMetrics(metricsRes.data || null);
          return;
        }

        const [studentsRes, logsRes] = await Promise.all([studentAPI.getAll(), attendanceAPI.getAll()]);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setAttendanceLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load attendance records right now.');
      } finally {
        setLoading(false);
      }
    };
    if (user) loadStudentData();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student' || students.length === 0) return;
    
    setAttendanceSheet({});
    setUnmarkedStudentIds([]);
  }, [students, attendanceLogs, targetDate, user?.role]);

  const handleStatusChange = (studentId, status) => {
    if (!studentId) return;
    setAttendanceSheet(prev => ({ ...prev, [studentId]: status }));
    setUnmarkedStudentIds(prev => prev.filter(id => id !== studentId));
  };

  const handleMarkAllPresent = () => {
    const nextSelections = {};
    filteredStudents.forEach(student => {
      if (student?._id) nextSelections[student._id] = 'Present';
    });

    setAttendanceSheet(prev => ({ ...prev, ...nextSelections }));
    setUnmarkedStudentIds(prev => prev.filter(id => !nextSelections[id]));
  };

  const handleClearSelections = () => {
    const visibleIds = filteredStudents.map(student => student?._id).filter(Boolean);
    setAttendanceSheet(prev => {
      const next = { ...prev };
      visibleIds.forEach(id => {
        delete next[id];
      });
      return next;
    });
    setUnmarkedStudentIds([]);
  };

  const handleSaveAttendance = async () => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      return Swal.fire({
        icon: 'error',
        title: 'Access Forbidden',
        text: 'Only educators can log attendance.',
        confirmButtonColor: '#e11d48',
      });
    }
    
    try {
      let successCount = 0;
      let conflictCount = 0;
      let failedCount = 0;
      const failureMessages = [];

      const filtered = classFilter ? students.filter(s => s.className === classFilter) : students;
      const rowsToSubmit = filtered.filter(s => s?._id);
      const unmarkedRows = rowsToSubmit.filter(s => !attendanceSheet[s._id]);

      if (rowsToSubmit.length === 0) {
        return Swal.fire({
          icon: 'info',
          title: 'No Students Found',
          text: 'There are no students available for the selected class group.',
          confirmButtonColor: '#4f46e5',
        });
      }

      if (unmarkedRows.length > 0) {
        setUnmarkedStudentIds(unmarkedRows.map(s => s._id));
        return Swal.fire({
          icon: 'warning',
          title: 'Complete Attendance Required',
          text: `Please mark ${unmarkedRows.length} unselected student${unmarkedRows.length === 1 ? '' : 's'} before committing this sheet.`,
          confirmButtonColor: '#f59e0b',
        });
      }

      for (const s of rowsToSubmit) {
        try {
          await attendanceAPI.mark({
            student: s._id,
            date: targetDate,
            status: attendanceSheet[s._id]
          });
          successCount++;
        } catch (err) {
          if (err.response?.status === 409 || err.response?.status === 400) {
            conflictCount++;
          } else {
            failedCount++;
            failureMessages.push(err.response?.data?.message || `Failed to save ${s?.fullName || 'student attendance'}`);
          }
        }
      }

      if (failedCount > 0) {
        return Swal.fire({
          icon: successCount > 0 ? 'warning' : 'error',
          title: successCount > 0 ? 'Partially Saved' : 'Attendance Not Saved',
          text: successCount > 0
            ? `Saved ${successCount}, but ${failedCount} failed. ${failureMessages[0] || ''}`
            : failureMessages[0] || 'The server rejected the attendance request.',
          confirmButtonColor: successCount > 0 ? '#f59e0b' : '#e11d48',
        });
      }

      Swal.fire({
        icon: successCount > 0 ? 'success' : 'info',
        title: 'Attendance Processed',
        text: `Logs saved: ${successCount}. Conflicts found: ${conflictCount}.`,
        confirmButtonColor: successCount > 0 ? '#10b981' : '#f59e0b',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Synchronization Fault',
        text: 'Global infrastructure synchronization fault.',
        confirmButtonColor: '#e11d48',
      });
    }
  };

  const uniqueClasses = [...new Set((students ?? []).map(s => s?.className).filter(Boolean))];
  const filteredStudents = classFilter ? (students ?? []).filter(s => s?.className === classFilter) : (students ?? []);
  const canManageAttendance = user?.role === 'teacher' || user?.role === 'admin';
  const markedCount = filteredStudents.filter(student => attendanceSheet[student?._id]).length;
  const pendingCount = Math.max(filteredStudents.length - markedCount, 0);

  if (loading) return <LoadingSpinner />;

  if (user?.role === 'student') {
    const overall = studentMetrics?.overall || {};
    const records = studentMetrics?.recentLogs || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
          <p className="text-sm text-slate-500">Review your attendance history and current standing</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <p className="text-xs uppercase font-semibold text-slate-500">Total Logs</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{overall?.total || 0}</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <p className="text-xs uppercase font-semibold text-slate-500">Present</p>
            <p className="mt-2 text-2xl font-bold text-green-700">{overall?.present || 0}</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <p className="text-xs uppercase font-semibold text-slate-500">Absent</p>
            <p className="mt-2 text-2xl font-bold text-red-700">{overall?.absent || 0}</p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <p className="text-xs uppercase font-semibold text-slate-500">Excused</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{overall?.late || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent Attendance Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No attendance records available yet</td>
                  </tr>
                ) : (
                  records?.map((record) => {
                    const displayStatus = record?.status === 'Late' ? 'Excused' : record?.status;

                    return (
                      <tr key={record?._id || `${record?.date}-${record?.subject}`} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">{record?.date ? new Date(record.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{record?.subject || 'General Tracking'}</td>
                        <td className="px-6 py-4">{record?.teacherName || 'System Admin'}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                            displayStatus === 'Present' ? 'bg-green-50 text-green-700' :
                            displayStatus === 'Absent' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {displayStatus || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Register</h1>
          <p className="text-sm text-slate-500">Select every student status before committing the sheet</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={!canManageAttendance || filteredStudents.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck size={16} />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={handleClearSelections}
            disabled={!canManageAttendance || markedCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw size={16} />
            <span>Clear Selections</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="space-y-1.5 w-full lg:w-1/3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select Date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:border-indigo-600 transition" />
        </div>
        <div className="space-y-1.5 w-full lg:w-1/3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter Class Group</label>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 transition">
            <option value="">All Available Groups</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2 lg:w-1/3">
          <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase text-slate-400">Marked</p>
            <p className="text-lg font-black text-slate-900">{markedCount}</p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase text-slate-400">Pending</p>
            <p className={`text-lg font-black ${pendingCount > 0 ? 'text-amber-600' : 'text-green-700'}`}>{pendingCount}</p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase text-slate-400">Students</p>
            <p className="text-lg font-black text-indigo-700">{filteredStudents.length}</p>
          </div>
        </div>
        </div>
        {canManageAttendance && (
          <button onClick={handleSaveAttendance} className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10">
            Commit Attendance Sheet
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sm:p-6">
        <div className="hidden grid-cols-[1fr_1.2fr_1fr_2fr] gap-4 rounded-2xl bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid">
          <span>ID Code</span>
          <span>Student Name</span>
          <span>Class Group</span>
          <span className="text-right">Mandatory Status</span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm font-medium text-slate-400">
              No target arday found for selection
            </div>
          ) : (
            filteredStudents?.map((student) => {
              const selectedStatus = attendanceSheet[student?._id];
              const isUnmarked = unmarkedStudentIds.includes(student?._id);

              return (
                <div
                  key={student?._id}
                  className={`grid gap-4 rounded-2xl border bg-white p-4 shadow-sm transition lg:grid-cols-[1fr_1.2fr_1fr_2fr] lg:items-center ${
                    isUnmarked ? 'border-amber-300 bg-amber-50/50 ring-2 ring-amber-100' : 'border-slate-100 hover:border-indigo-100 hover:shadow-md'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 lg:hidden">ID Code</p>
                    <p className="font-mono text-sm font-black text-indigo-600">{student?.studentId}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 lg:hidden">Student Name</p>
                    <p className="text-sm font-bold text-slate-950">{student?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 lg:hidden">Class Group</p>
                    <p className="text-sm font-semibold text-slate-600">{student?.className}</p>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-[11px] font-bold uppercase lg:text-right ${isUnmarked ? 'text-amber-700' : 'text-slate-400'}`}>
                      {isUnmarked ? 'Selection required' : selectedStatus || 'No status selected'}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {attendanceOptions.map(({ value, label, Icon, selectedClass, idleClass, iconClass }) => {
                        const isSelected = selectedStatus === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!canManageAttendance}
                            onClick={() => handleStatusChange(student?._id, value)}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              isSelected ? selectedClass : idleClass
                            }`}
                          >
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${isSelected ? iconClass : 'bg-slate-100 text-slate-400'}`}>
                              <Icon size={14} />
                            </span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
