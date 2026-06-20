import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setError('Please enter both your email and password.');
    }

    try {
      setError('');
      setSubmitting(true);
      const res = await authAPI.login(formData);
      const { token, ...userData } = res.data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(99,102,241,0.32),transparent_26%),linear-gradient(135deg,#020617_0%,#111827_46%,#172554_100%)]" />
      <div className="absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-7rem] right-[-5rem] h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl animate-pulse" />
      <div className="login-geo login-geo-one" />
      <div className="login-geo login-geo-two" />
      <div className="login-geo login-geo-three" />

      <section className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden space-y-7 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
            Secure Academic Gateway
          </div>
          <div>
            <h1 className="max-w-2xl text-5xl font-black leading-tight text-white">
              Modern student attendance management, designed for seamless daily operations.
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-300">
              Enter a polished control room for classes, cohorts, attendance signals, and learner progress.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {['Live Metrics', 'Role Aware', 'Secure Access'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/10 backdrop-blur">
                <p className="text-xs font-black uppercase text-slate-400">{item}</p>
                <div className="mt-4 h-1.5 rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-[1px] shadow-2xl shadow-cyan-950/40">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
            <div className="rounded-[calc(2rem-1px)] bg-white/85 p-8 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
              <div className="text-center">
                <div className="animate-float mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-2xl shadow-indigo-500/30 ring-1 ring-white/30">
                  <FiShield size={28} />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-indigo-600">EduTrack Pro</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Sign in</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">Access your attendance workspace.</p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">Email</label>
                  <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm transition duration-300 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100">
                    <FiMail className="text-slate-400 transition group-focus-within:text-cyan-600" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@academy.edu"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">Password</label>
                  <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm transition duration-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                    <FiLock className="text-slate-400 transition group-focus-within:text-indigo-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-indigo-950/25 transition duration-300 hover:scale-[1.02] hover:bg-indigo-600 hover:shadow-indigo-500/30 disabled:scale-100 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {submitting ? 'Verifying...' : 'Sign In'}
                  <FiArrowRight className="transition duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
