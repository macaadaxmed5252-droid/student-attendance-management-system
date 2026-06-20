import React, { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiLayers,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { studentAPI, teacherAPI, attendanceAPI, classAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from '../Student/StudentDashboard';

const statusBadgeClass = (status) => {
  if (status === 'Present') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (status === 'Absent') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
  return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
};

const normalizeStatus = (status) => (status === 'Late' ? 'Excused' : status || 'Unknown');

const ExecutiveCard = ({ title, value, subtitle, Icon, accent }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
      <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-900/10 transition group-hover:scale-110">
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const TeacherMetric = ({ label, value, hint, Icon, color }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-950">{value}</p>
      </div>
    </div>
    <p className="mt-4 text-sm font-medium text-slate-500">{hint}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [studentMetrics, setStudentMetrics] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      try {
        if (user?.role === 'student') {
          const res = await attendanceAPI.getMyMetrics();
          setStudentMetrics(res.data || null);
          return;
        }

        if (user?.role === 'teacher') {
          const [studentsRes, attendanceRes, teacherRes] = await Promise.all([
            studentAPI.getAll(),
            attendanceAPI.getAll(),
            teacherAPI.getMe(),
          ]);

          setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
          setAttendanceLogs(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
          setTeacherProfile(teacherRes.data || null);
          return;
        }

        const [studentsRes, attendanceRes, teachersRes, classesRes] = await Promise.all([
          studentAPI.getAll(),
          attendanceAPI.getAll(),
          teacherAPI.getAll(),
          classAPI.getAll(),
        ]);

        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setAttendanceLogs(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      } catch (error) {
        console.error('Telemetry generation fault mapping metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardTelemetry();
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogs = useMemo(
    () => (attendanceLogs ?? []).filter(log => log?.date && new Date(log.date).toISOString().split('T')[0] === todayStr),
    [attendanceLogs, todayStr]
  );

  const attendanceRate = useMemo(() => {
    const marked = (attendanceLogs ?? []).filter(log => log?.status);
    if (marked.length === 0) return 0;
    return Math.round((marked.filter(log => log.status === 'Present').length / marked.length) * 100);
  }, [attendanceLogs]);

  const assignedClasses = teacherProfile?.assignedClasses || [];
  const selectedClass = assignedClasses.find(item => item?._id === selectedClassId);
  const selectedClassName = selectedClass?.className;
  const teacherStudents = selectedClassName
    ? (students ?? []).filter(student => student?.className === selectedClassName)
    : (students ?? []);
  const selectedClassLogs = selectedClassName
    ? (attendanceLogs ?? []).filter(log => log?.student?.className === selectedClassName)
    : (attendanceLogs ?? []);
  const teacherAttendanceRate = selectedClassLogs.length
    ? Math.round((selectedClassLogs.filter(log => log?.status === 'Present').length / selectedClassLogs.length) * 100)
    : 0;

  if (loading) return <LoadingSpinner />;

  if (user?.role === 'student' && studentMetrics) {
    return <StudentDashboard studentMetrics={studentMetrics} />;
  }

  if (user?.role === 'teacher') {
    return (
      <div className="space-y-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl shadow-indigo-950/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-200">Academic Workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Welcome back, {teacherProfile?.fullName || user?.fullName || 'Educator'}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Monitor assigned cohorts, attendance velocity, and today&apos;s teaching blocks from one polished workspace.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/10 px-5 py-4 pr-12 text-sm font-bold text-white outline-none backdrop-blur transition focus:border-indigo-300"
              >
                <option value="all" className="text-slate-900">All assigned cohorts</option>
                {assignedClasses?.map(item => (
                  <option key={item?._id} value={item?._id} className="text-slate-900">
                    {item?.className} - {item?.section}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-indigo-100" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <TeacherMetric label="Today's Schedule" value={assignedClasses?.length || 0} hint="Active teaching blocks assigned to your profile." Icon={FiCalendar} color="bg-indigo-50 text-indigo-700" />
          <TeacherMetric label="Assigned Class Cohorts" value={teacherStudents?.length || 0} hint="Students visible in the selected cohort scope." Icon={FiLayers} color="bg-emerald-50 text-emerald-700" />
          <TeacherMetric label="Average Attendance Rates" value={`${teacherAttendanceRate}%`} hint="Calculated from attendance logs in this view." Icon={FiTrendingUp} color="bg-amber-50 text-amber-700" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Today&apos;s Schedule</h2>
                <p className="text-sm text-slate-500">Assigned cohorts and subject blocks</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{assignedClasses?.length || 0} blocks</span>
            </div>
            <div className="space-y-3">
              {assignedClasses?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-400">No assigned classes yet</div>
              ) : (
                assignedClasses?.map((item, index) => (
                  <div key={item?._id || index} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
                    <div>
                      <p className="font-black text-slate-950">{teacherProfile?.academicSpecialty || 'General Subject'}</p>
                      <p className="text-sm font-medium text-slate-500">{item?.className || 'Class'} - {item?.section || 'N/A'}</p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm transition group-hover:text-indigo-700">Block {index + 1}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Recent Cohort Activity</h2>
            <p className="mb-5 text-sm text-slate-500">Latest attendance events in your workspace</p>
            <div className="space-y-3">
              {selectedClassLogs?.slice(-5).reverse().length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-400">No recent attendance logs</div>
              ) : (
                selectedClassLogs?.slice(-5).reverse().map(log => {
                  const displayStatus = normalizeStatus(log?.status);
                  return (
                    <div key={log?._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="font-bold text-slate-900">{log?.student?.fullName || 'Student record'}</p>
                        <p className="text-xs font-medium text-slate-500">{log?.date ? new Date(log.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'No date'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${statusBadgeClass(displayStatus)}`}>{displayStatus}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-slate-100 p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-indigo-600">The Nerve Center</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Executive Operations Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">High-level telemetry across students, faculty, class cohorts, and today&apos;s attendance activity.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-xl shadow-slate-950/10">
            <p className="text-xs font-bold uppercase text-slate-400">Today&apos;s Attendance</p>
            <p className="text-2xl font-black">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ExecutiveCard title="Total Students" value={students?.length || 0} subtitle="Enrolled learner profiles" Icon={FiUsers} accent="from-indigo-500 to-cyan-400" />
        <ExecutiveCard title="Active Faculty" value={teachers?.length || 0} subtitle="Educators onboarded" Icon={FiAward} accent="from-blue-500 to-indigo-400" />
        <ExecutiveCard title="Class Cohorts" value={classes?.length || 0} subtitle="Academic groups configured" Icon={FiBookOpen} accent="from-emerald-500 to-teal-400" />
        <ExecutiveCard title="Today Present" value={todaysLogs.filter(log => log?.status === 'Present').length} subtitle={`${todaysLogs.length} logs captured today`} Icon={FiCheckCircle} accent="from-amber-400 to-rose-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Recent Attendance Ledger</h2>
              <p className="text-sm text-slate-500">Newest captured attendance records</p>
            </div>
            <FiActivity className="text-indigo-600" size={22} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs?.slice(-6).reverse().length === 0 ? (
                  <tr><td colSpan="4" className="py-10 text-center font-semibold text-slate-400">No attendance records captured yet</td></tr>
                ) : (
                  attendanceLogs?.slice(-6).reverse().map(log => {
                    const displayStatus = normalizeStatus(log?.status);
                    return (
                      <tr key={log?._id} className="transition hover:bg-indigo-50/40">
                        <td className="px-4 py-4 font-bold text-slate-950">{log?.student?.fullName || 'Registry Profile Cleared'}</td>
                        <td className="px-4 py-4 text-slate-600">{log?.student?.className || 'N/A'}</td>
                        <td className="px-4 py-4 text-slate-600">{log?.date ? new Date(log.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}</td>
                        <td className="px-4 py-4 text-right"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusBadgeClass(displayStatus)}`}>{displayStatus}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-amber-200">
              <FiAlertCircle size={22} />
            </div>
            <div>
              <h2 className="font-black">Operational Pulse</h2>
              <p className="text-sm text-slate-400">Today&apos;s attendance distribution</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {['Present', 'Absent', 'Excused'].map(status => {
              const value = todaysLogs.filter(log => normalizeStatus(log?.status) === status).length;
              const width = todaysLogs.length ? Math.round((value / todaysLogs.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm font-bold">
                    <span>{status}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-700" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
