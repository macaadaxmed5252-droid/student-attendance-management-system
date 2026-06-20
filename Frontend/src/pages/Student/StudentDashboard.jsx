import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiTrendingUp,
  FiUserCheck,
  FiXCircle,
} from 'react-icons/fi';

const RADIAN = Math.PI / 180;
const CHART_COLORS = ['#2563eb', '#e11d48', '#f59e0b'];
const emptyStats = { present: 0, absent: 0, late: 0 };

const getTotal = (stats = emptyStats) => (stats?.present || 0) + (stats?.absent || 0) + (stats?.late || 0);

const getRate = (stats = emptyStats) => {
  const total = getTotal(stats);
  return total > 0 ? Number((((stats?.present || 0) / total) * 100).toFixed(1)) : 0;
};

const formatPercent = (value) => {
  const rounded = Number(value.toFixed(1));
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};

const normalizeCourse = (course = {}) => ({
  subject: course?.subject || 'General Tracking',
  present: course?.present || 0,
  absent: course?.absent || 0,
  late: course?.late || 0,
});

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (!value || !percent) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[15px] font-black"
      style={{ paintOrder: 'stroke', stroke: 'rgba(15, 23, 42, 0.32)', strokeWidth: 3 }}
    >
      {formatPercent(percent * 100)}
    </text>
  );
};

const Reveal = ({ children, delay = 0, className = '' }) => (
  <div className={`motion-reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const MetricCard = ({ title, value, note, Icon, glow, light, delay }) => (
  <Reveal delay={delay}>
    <div className="group relative min-h-[158px] overflow-hidden rounded-2xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.14)]">
      <div className={`absolute -right-10 -top-12 h-32 w-32 rounded-full blur-3xl ${glow}`} />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <span className={`flex h-3 w-3 rounded-full shadow-[0_0_18px_currentColor] ${light}`} />
          <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-xl shadow-slate-950/15 transition duration-300 group-hover:scale-110">
            <Icon size={20} />
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  </Reveal>
);

const StudentDashboard = ({ studentMetrics }) => {
  const [selectedCourse, setSelectedCourse] = useState('All');

  const courses = useMemo(
    () => (studentMetrics?.courses || []).map(normalizeCourse),
    [studentMetrics?.courses]
  );

  const overallStats = studentMetrics?.overall || emptyStats;
  const selectedStats = selectedCourse === 'All'
    ? overallStats
    : courses.find((course) => course?.subject === selectedCourse) || emptyStats;

  const totalLectures = getTotal(selectedStats);
  const attendanceRate = getRate(selectedStats);
  const overallTotal = getTotal(overallStats);
  const overallRate = getRate(overallStats);

  const chartData = [
    { name: 'Present', value: selectedStats?.present || 0 },
    { name: 'Absent', value: selectedStats?.absent || 0 },
    { name: 'Excused', value: selectedStats?.late || 0 },
  ];

  const lowAttendanceCourses = useMemo(
    () => courses
      .map((course) => ({ ...course, total: getTotal(course), rate: getRate(course) }))
      .filter((course) => course.total > 0 && course.rate < 75),
    [courses]
  );

  const metricCards = [
    {
      title: 'Total Attendance Yield',
      value: `${overallRate}%`,
      note: `${overallTotal} total attendance logs`,
      Icon: FiTrendingUp,
      glow: 'bg-cyan-300/35',
      light: 'bg-cyan-400 text-cyan-400',
    },
    {
      title: 'Total Present Days',
      value: overallStats?.present || 0,
      note: 'Confirmed present sessions',
      Icon: FiUserCheck,
      glow: 'bg-emerald-300/35',
      light: 'bg-emerald-400 text-emerald-400',
    },
    {
      title: 'Absent Counter',
      value: overallStats?.absent || 0,
      note: 'Sessions requiring review',
      Icon: FiXCircle,
      glow: 'bg-rose-300/35',
      light: 'bg-rose-400 text-rose-400',
    },
    {
      title: 'Excused Leave Logs',
      value: overallStats?.late || 0,
      note: 'Approved exception records',
      Icon: FiClock,
      glow: 'bg-amber-300/35',
      light: 'bg-amber-400 text-amber-400',
    },
  ];

  return (
    <div className="space-y-7 pb-12">
      <Reveal>
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/20 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.24),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(129,140,248,0.22),transparent_32%),linear-gradient(135deg,#020617_0%,#111827_48%,#164e63_100%)]" />
          <div className="absolute right-12 top-10 h-24 w-24 rotate-12 rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur animate-float" />
          <div className="absolute bottom-[-4rem] left-1/3 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200">Student Intelligence Suite</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                Hello, {studentMetrics?.fullName || 'Student'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                A polished view of your attendance yield, course risk signals, and historical participation ratios.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Student ID', studentMetrics?.studentCode || 'N/A'],
                ['Class', studentMetrics?.className || 'N/A'],
                ['Courses', courses.length || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-black uppercase text-slate-300">{label}</p>
                  <p className="mt-1 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => (
          <MetricCard key={card.title} {...card} delay={90 + index * 80} />
        ))}
      </div>

      {lowAttendanceCourses.length > 0 && (
        <Reveal delay={420}>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 shadow-[0_16px_40px_rgba(225,29,72,0.1)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-rose-600 shadow-sm">
                  <FiAlertTriangle size={22} />
                </div>
                <div>
                  <h2 className="font-black text-rose-950">Action Required: Attendance below standard threshold.</h2>
                  <p className="mt-1 text-sm font-semibold text-rose-700">
                    {lowAttendanceCourses.length} course{lowAttendanceCourses.length === 1 ? '' : 's'} currently below 75%.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowAttendanceCourses.slice(0, 4).map((course) => (
                  <span key={course.subject} className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-700 shadow-sm ring-1 ring-rose-100">
                    {course.subject}: {course.rate}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Reveal delay={480}>
          <section className="rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                  Analytics Lens
                </div>
                <h2 className="text-xl font-black text-slate-950">Attendance Breakdown</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedCourse === 'All' ? 'Historical ratio across all courses' : selectedCourse}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <select
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="All">All courses</option>
                  {courses.map((course) => (
                    <option key={course.subject} value={course.subject}>{course.subject}</option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['Present', selectedStats?.present || 0, 'bg-blue-50 text-blue-700'],
                ['Absent', selectedStats?.absent || 0, 'bg-rose-50 text-rose-700'],
                ['Excused', selectedStats?.late || 0, 'bg-amber-50 text-amber-700'],
              ].map(([label, value, className]) => (
                <div key={label} className={`rounded-2xl p-4 ${className}`}>
                  <p className="text-[11px] font-black uppercase">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <FiBarChart2 className="text-indigo-600" />
                  Selected Yield
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                  {totalLectures} logs
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${attendanceRate < 75 && totalLectures > 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'}`}
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{attendanceRate}%</p>
            </div>
          </section>
        </Reveal>

        <Reveal delay={560}>
          <section className="rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Dynamic Pie Distribution</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Percent values render inside each sector.</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{totalLectures} logs</span>
            </div>

            <div className="mt-4 h-[370px] w-full">
              {totalLectures === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-black text-slate-400">
                  No attendance logs to visualize yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius="82%"
                      paddingAngle={1.5}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      isAnimationActive
                      animationDuration={850}
                      animationBegin={120}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#ffffff" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} logs`, name]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 800 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </Reveal>
      </div>

      <Reveal delay={640}>
        <section className="rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
              <FiBookOpen size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Course-by-Course Attendance</h2>
              <p className="text-sm font-semibold text-slate-500">Sleek progress matrix with threshold visibility.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-400">
                No course attendance has been logged yet
              </div>
            ) : (
              courses.map((course, index) => {
                const rate = getRate(course);
                const total = getTotal(course);
                const isLow = total > 0 && rate < 75;
                return (
                  <div
                    key={course.subject}
                    className={`relative overflow-hidden rounded-2xl border bg-slate-50/80 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isLow
                        ? 'border-rose-300 ring-4 ring-rose-100 animate-pulse'
                        : 'border-slate-100'
                    }`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {isLow && (
                      <div className="mb-4 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700">
                        Action Required: Attendance below standard threshold.
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-950">{course.subject}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{total} logs captured</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {rate}%
                      </span>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLow ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                        }`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white px-2 py-2 text-blue-700">
                        <FiCheckCircle className="mx-auto" />
                        <p className="mt-1 text-xs font-black">{course.present}</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2 text-rose-700">
                        <FiXCircle className="mx-auto" />
                        <p className="mt-1 text-xs font-black">{course.absent}</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2 text-amber-700">
                        <FiClock className="mx-auto" />
                        <p className="mt-1 text-xs font-black">{course.late}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
};

export default StudentDashboard;
