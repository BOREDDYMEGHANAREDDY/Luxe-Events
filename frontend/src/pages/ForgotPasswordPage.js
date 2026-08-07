import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';
import { Spinner } from '../components/common/index';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password — Luxe Events</title></Helmet>
      <div className="min-h-screen bg-luxe-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md">

          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 border-2 border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">L</span>
            </div>
            <span className="text-white font-display tracking-widest uppercase text-sm">Luxe Events</span>
          </Link>

          <div className="glass-card-dark border border-luxe-border p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-gold-500 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-white mb-3">Check your inbox</h2>
                <p className="text-luxe-muted text-sm leading-relaxed mb-6">
                  We've sent a password reset link to <span className="text-gold-400 font-medium">{email}</span>.
                  The link expires in 1 hour.
                </p>
                <p className="text-luxe-muted text-xs mb-6">
                  Didn't receive it? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-gold-500 hover:text-gold-400">try again</button>.
                </p>
                <Link to="/login" className="btn-outline-gold text-xs py-2 px-6 inline-block">Back to Sign In</Link>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl text-white mb-2">Reset your password</h1>
                <p className="text-luxe-muted text-sm mb-8">
                  Enter your email and we'll send you a secure link to reset your password.
                </p>
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label className="luxe-label">Email Address</label>
                    <input type="email" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com" autoComplete="email"
                      className={`luxe-input ${error ? 'border-red-500' : ''}`} />
                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-gold w-full py-4 disabled:opacity-50">
                    {loading ? <><Spinner size="sm" /> Sending...</> : 'Send Reset Link'}
                  </button>
                </form>
                <p className="text-center text-luxe-muted text-sm mt-6">
                  <Link to="/login" className="text-gold-500 hover:text-gold-400 transition-colors">← Back to Sign In</Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
