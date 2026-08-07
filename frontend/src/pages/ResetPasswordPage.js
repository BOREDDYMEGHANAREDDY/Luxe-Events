import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';
import { Spinner } from '../components/common/index';
import toast from 'react-hot-toast';

// ─── Reset Password ───────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.password)       e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) e.password = 'Must include uppercase and number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset Password — Luxe Events</title></Helmet>
      <div className="min-h-screen bg-luxe-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 border-2 border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">L</span>
            </div>
            <span className="text-white font-display tracking-widest uppercase text-sm">Luxe Events</span>
          </Link>

          <div className="glass-card-dark border border-luxe-border p-8">
            <h1 className="font-display text-2xl text-white mb-2">Create new password</h1>
            <p className="text-luxe-muted text-sm mb-8">Choose a strong password to secure your account.</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="luxe-label">New Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                    placeholder="Min. 8 characters" autoComplete="new-password"
                    className={`luxe-input pr-11 ${errors.password ? 'border-red-500' : ''}`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxe-muted hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="luxe-label">Confirm New Password</label>
                <input type="password" value={form.confirmPassword}
                  onChange={(e) => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Re-enter password" autoComplete="new-password"
                  className={`luxe-input ${errors.confirmPassword ? 'border-red-500' : form.confirmPassword && form.confirmPassword === form.password ? 'border-green-500' : ''}`} />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full py-4 disabled:opacity-50">
                {loading ? <><Spinner size="sm" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
            <p className="text-center text-luxe-muted text-sm mt-6">
              <Link to="/login" className="text-gold-500 hover:text-gold-400">← Back to Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Verify Email ─────────────────────────────────────────────────
export function VerifyEmailPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then((res) => { setMessage(res.data.message); setStatus('success'); })
      .catch((err) => { setMessage(err.message || 'Verification failed or link expired.'); setStatus('error'); });
  }, [token]);

  return (
    <>
      <Helmet><title>Email Verification — Luxe Events</title></Helmet>
      <div className="min-h-screen bg-luxe-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center glass-card-dark border border-luxe-border p-12">
          {status === 'loading' && (
            <>
              <Spinner size="lg" className="mx-auto mb-6" />
              <p className="text-white font-display text-xl">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-white mb-3">Email Verified!</h1>
              <p className="text-luxe-muted text-sm mb-8">{message}</p>
              <Link to="/login" className="btn-gold px-10 py-3 inline-block">Sign In Now</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-white mb-3">Verification Failed</h1>
              <p className="text-luxe-muted text-sm mb-8">{message}</p>
              <Link to="/login" className="btn-outline-gold px-8 py-3 inline-block">Go to Login</Link>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default ResetPasswordPage;
