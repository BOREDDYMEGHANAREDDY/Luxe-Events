import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Input, Spinner } from '../components/common/index';

const STRENGTH_RULES = [
  { label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',         test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',         test: (p) => /[a-z]/.test(p) },
  { label: 'One number',                   test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (@#$!)', test: (p) => /[@#$!%^&*]/.test(p) },
];

const strengthLabel = (score) => {
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-500'    };
  if (score <= 3) return { label: 'Fair',   color: 'bg-yellow-500' };
  if (score <= 4) return { label: 'Good',   color: 'bg-blue-500'   };
  return              { label: 'Strong', color: 'bg-green-500'  };
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    agreeTerms: false,
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const pwdScore = STRENGTH_RULES.filter(r => r.test(form.password)).length;
  const { label: pwdLabel, color: pwdColor } = strengthLabel(pwdScore);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (form.phone && !/^[+]?[\d\s\-()]{10,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (!form.password)         e.password  = 'Password is required';
    else if (pwdScore < 3)      e.password  = 'Password is too weak';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms)       e.agreeTerms = 'You must accept the terms';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register({
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      phone:     form.phone,
      password:  form.password,
    });
    setLoading(false);
    if (result.success) navigate('/dashboard', { replace: true });
  };

  return (
    <>
      <Helmet><title>Create Account — Luxe Events</title></Helmet>

      <div className="min-h-screen bg-luxe-black flex">
        {/* Left decorative */}
        <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
            alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-luxe-black via-luxe-black/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col p-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 font-bold text-sm">L</span>
              </div>
              <div>
                <div className="text-white font-display font-semibold tracking-[3px] text-sm uppercase">Luxe Events</div>
                <div className="text-gold-500 text-[10px] tracking-[5px] uppercase">Luxury Redefined</div>
              </div>
            </Link>
            <div className="mt-auto mb-12">
              <div className="space-y-4">
                {['Access exclusive event packages', 'AI-powered planning tools', 'Real-time booking management', 'Secure Razorpay payments', 'Dedicated event coordinator'].map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <div className="w-5 h-5 border border-gold-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold-500 text-[10px]">✓</span>
                    </div>
                    <span className="text-white/70 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="w-full max-w-lg py-8">

            <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 border-2 border-gold-500 flex items-center justify-center">
                <span className="text-gold-500 font-bold text-sm">L</span>
              </div>
              <span className="text-white font-display tracking-widest uppercase text-sm">Luxe Events</span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-white mb-2">Create your account</h1>
              <p className="text-luxe-muted text-sm">Join thousands of clients who trust Luxe Events</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name *" value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  placeholder="Priya" error={errors.firstName} autoComplete="given-name" />
                <Input label="Last Name *" value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="Sharma" error={errors.lastName} autoComplete="family-name" />
              </div>

              <Input label="Email Address *" type="email" value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="priya@example.com" error={errors.email} autoComplete="email" />

              <Input label="Phone Number" value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210" error={errors.phone} autoComplete="tel" />

              {/* Password */}
              <div>
                <label className="luxe-label">Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Min. 8 characters" autoComplete="new-password"
                    className={`luxe-input pr-11 ${errors.password ? 'border-red-500' : ''}`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPwd ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= pwdScore ? pwdColor : 'bg-luxe-border'}`} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {STRENGTH_RULES.map((r) => (
                          <span key={r.label} className={`text-[10px] ${r.test(form.password) ? 'text-green-400' : 'text-luxe-muted'}`}>
                            {r.test(form.password) ? '✓' : '○'} {r.label}
                          </span>
                        ))}
                      </div>
                      <span className={`text-[10px] font-semibold ml-2 flex-shrink-0 ${pwdScore >= 4 ? 'text-green-400' : pwdScore >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{pwdLabel}</span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="luxe-label">Confirm Password *</label>
                <div className="relative">
                  <input type={showCPwd ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    placeholder="Re-enter password" autoComplete="new-password"
                    className={`luxe-input pr-11 ${errors.confirmPassword ? 'border-red-500' : form.confirmPassword && form.confirmPassword === form.password ? 'border-green-500' : ''}`} />
                  <button type="button" onClick={() => setShowCPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.agreeTerms}
                    onChange={(e) => update('agreeTerms', e.target.checked)}
                    className="luxe-checkbox mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span className="text-luxe-muted text-xs leading-relaxed">
                    I agree to the{' '}
                    <Link to="/" className="text-gold-500 hover:text-gold-400">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/" className="text-gold-500 hover:text-gold-400">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-red-400 text-xs mt-1">{errors.agreeTerms}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 text-sm disabled:opacity-50">
                {loading ? <><Spinner size="sm" /> Creating account...</> : 'Create My Account ✦'}
              </button>
            </form>

            <p className="text-center text-luxe-muted text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
