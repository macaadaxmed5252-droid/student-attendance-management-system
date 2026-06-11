import React, { useEffect, useState } from 'react';
import { FiUsers, FiAward, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';
import StatCard from '../../components/Common/StatCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { studentAPI, teacherAPI, attendanceAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, present: 0, absent: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      try {
        const [studentsRes, teachersRes, attendanceRes] = await Promise.all([
          studentAPI.getAll(),
          teacherAPI.getAll(),
          attendanceAPI.getAll()
        ]);
        
        const logs = attendanceRes.data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLogs = logs.filter(log => new Date(log.date).toISOString().split('T')[0] === todayStr);

        setStats({
          students: studentsRes.data?.length || 0,
          teachers: teachersRes.data?.length || 0,
          present: todaysLogs.filter(l => l.status === 'Present').length,
          absent: todaysLogs.filter(l => l.status === 'Absent').length,
        });
        setRecentLogs(logs.slice(-5).reverse());
      } catch (error) {
        console.error('Telemetry generation fault mapping metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardTelemetry();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Metrics</h1>
        <p className="text-sm text-slate-500">System overview and real-time attendance telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Enrolled Students" value={stats.students} icon={FiUsers} color="indigo" />
        <StatCard title="Active Faculty Staff" value={stats.teachers} icon={FiAward} color="blue" />
        <StatCard title="Present State (Today)" value={stats.present} icon={FiCheckSquare} color="green" />
        <StatCard title="Absent State (Today)" value={stats.absent} icon={FiAlertCircle} color="red" />
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Recent Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3">Student Profile</th>
                <th className="px-6 py-3">Assigned Academic Block</th>
                <th className="px-6 py-3">Calendar Reference Date</th>
                <th className="px-6 py-3 text-right">Status State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No tracking data captured within current calendar cycles</td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{log.student?.fullName || 'Registry Profile Cleared'}</td>
                    <td className="px-6 py-4">{log.student?.className || 'N/A'}</td>
                    <td className="px-6 py-4">{new Date(log.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                        log.status === 'Present' ? 'bg-green-50 text-green-700' :
                        log.status === 'Absent' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {log.status}
                      </span>
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

export default Dashboard;