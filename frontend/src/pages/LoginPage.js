import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Input, Spinner } from '../components/common/index';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'admin' || result.user?.role === 'superadmin' ? '/admin' : from, { replace: true });
    }
  };

  return (
    <>
      <Helmet><title>Sign In — Luxe Events</title></Helmet>

      <div className="min-h-screen bg-luxe-black flex">
        {/* Left panel — decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80"
            alt="Luxe Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-luxe-black via-luxe-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <Link to="/" className="flex items-center gap-3 mb-auto mt-8">
              <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 font-display font-bold text-sm">L</span>
              </div>
              <div>
                <div className="text-white font-display font-semibold tracking-[3px] text-sm uppercase">Luxe Events</div>
                <div className="text-gold-500 text-[10px] tracking-[5px] uppercase">Luxury Redefined</div>
              </div>
            </Link>
            <blockquote className="mb-12">
              <p className="text-white/80 text-xl font-display italic leading-relaxed mb-4">
                "Every extraordinary event begins with a single, inspired decision."
              </p>
              <footer className="text-gold-500 text-xs tracking-widest uppercase">— Luxe Events</footer>
            </blockquote>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
              <div className="w-9 h-9 border-2 border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 font-bold text-sm">L</span>
              </div>
              <span className="text-white font-display tracking-widest uppercase text-sm">Luxe Events</span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-white mb-2">Welcome back</h1>
              <p className="text-luxe-muted text-sm">Sign in to manage your events and bookings</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="luxe-label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-gold-500 text-xs hover:text-gold-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`luxe-input pr-11 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted hover:text-white transition-colors">
                    {showPwd
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 text-sm mt-2 disabled:opacity-50">
                {loading ? <><Spinner size="sm" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-luxe-border" />
              <span className="text-luxe-muted text-xs">or continue with</span>
              <div className="flex-1 h-px bg-luxe-border" />
            </div>

            {/* Demo credentials */}
            <div className="p-4 border border-gold-500/20 bg-gold-500/5 mb-6">
              <p className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-2">Demo Credentials</p>
              <div className="space-y-1">
                <p className="text-white/60 text-xs">User: <span className="text-white font-mono">priya@example.com</span> / <span className="text-white font-mono">User@123</span></p>
                <p className="text-white/60 text-xs">Admin: <span className="text-white font-mono">admin@luxeevents.com</span> / <span className="text-white font-mono">Admin@123</span></p>
              </div>
            </div>

            <p className="text-center text-luxe-muted text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
