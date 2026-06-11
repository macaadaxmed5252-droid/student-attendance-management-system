import React, { useEffect, useState } from 'react';
import { attendanceAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await attendanceAPI.getAll();
        setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const total = logs.length;
  const present = logs.filter(l => l.status === 'Present').length;
  const absent = logs.filter(l => l.status === 'Absent').length;
  const late = logs.filter(l => l.status === 'Late').length;

  const ratio = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Reports Analytics</h1>
        <p className="text-sm text-slate-500">Aggregated historical metrics summary data visualization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tracking Instances</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{total}</h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500">Present Status Logged</p>
          <h3 className="text-3xl font-extrabold text-green-600 mt-1">{present}</h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500">Absent Status Logged</p>
          <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{absent}</h3>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500">Institutional Attendance Ratio</p>
          <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{ratio}%</h3>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Historical Attendance Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Calendar Reference Date</th>
                <th className="px-6 py-3">Logging Instructor</th>
                <th className="px-6 py-3 text-right">Captured Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No ledger records generated within system databases</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{log.student?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4">{new Date(log.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
                    <td className="px-6 py-4 text-xs">{log.teacher?.fullName || 'System Admin'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        log.status === 'Present' ? 'bg-green-50 text-green-700' :
                        log.status === 'Absent' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>{log.status}</span>
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

export default Reports;