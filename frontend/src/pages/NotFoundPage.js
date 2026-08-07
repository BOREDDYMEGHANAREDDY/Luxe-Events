import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet><title>404 — Page Not Found | Luxe Events</title></Helmet>

      <div className="min-h-screen bg-luxe-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Floating gold dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-500 rounded-full opacity-30"
            style={{
              left:  `${15 + i * 14}%`,
              top:   `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 max-w-2xl mx-auto"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <span className="text-[140px] sm:text-[180px] font-display font-bold leading-none text-gradient-gold opacity-20 select-none">
              404
            </span>
          </motion.div>

          {/* Gold diamond */}
          <motion.div
            className="w-10 h-10 border-2 border-gold-500 rotate-45 mx-auto mb-8 -mt-8"
            animate={{ rotate: [45, 90, 45] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="section-eyebrow">Page Not Found</span>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-white mb-4 mt-2">
              This Page Has Left the Building
            </h1>
            <p className="text-luxe-muted text-base leading-relaxed mb-10 max-w-md mx-auto">
              The page you're looking for may have been moved, deleted, or perhaps never existed.
              Let us guide you back to something extraordinary.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/" className="btn-gold px-8 py-4 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            <button onClick={() => navigate(-1)} className="btn-outline-gold px-8 py-4 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            <Link to="/events" className="btn-ghost px-8 py-4 text-sm">
              Browse Events →
            </Link>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 border-t border-luxe-border"
          >
            <p className="text-luxe-muted text-xs uppercase tracking-widest mb-5">Popular Destinations</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Weddings',     href: '/events?category=wedding' },
                { label: 'Venues',       href: '/venues' },
                { label: 'Gallery',      href: '/gallery' },
                { label: 'AI Planner',   href: '/ai-planner' },
                { label: 'Contact',      href: '/contact' },
                { label: 'Dashboard',    href: '/dashboard' },
              ].map(({ label, href }) => (
                <Link key={label} to={href}
                  className="text-white/40 hover:text-gold-500 text-xs transition-colors border border-luxe-border hover:border-gold-500/30 px-4 py-2">
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
