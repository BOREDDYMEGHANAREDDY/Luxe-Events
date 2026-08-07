import React from 'react';
import { motion } from 'framer-motion';

// ─── LoadingScreen ────────────────────────────────────────────────
export const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 bg-luxe-black flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-16 h-16 border-2 border-gold-500 flex items-center justify-center">
        <motion.span
          className="text-gold-500 font-display font-bold text-2xl"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >L</motion.span>
      </div>
      <div className="text-gold-500 text-xs tracking-[6px] uppercase">Loading</div>
    </motion.div>
  </div>
);

export default LoadingScreen;

// ─── Spinner ──────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' };
  return (
    <div className={`${sizes[size]} border-luxe-border border-t-gold-500 rounded-full animate-spin ${className}`} />
  );
};

// ─── GoldDivider ──────────────────────────────────────────────────
export const GoldDivider = ({ label }) => (
  <div className="gold-divider">
    {label && <span className="text-gold-500 text-xs tracking-widest uppercase font-semibold">{label}</span>}
  </div>
);

// ─── SectionHeader ────────────────────────────────────────────────
export const SectionHeader = ({ eyebrow, title, subtitle, center = false, light = false }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
    <h2 className={`section-title mb-4 ${light ? 'text-white' : 'text-white'}`}>
      {title}
    </h2>
    {subtitle && <p className={`section-subtitle ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    <div className={`mt-5 h-px w-20 bg-gold-gradient ${center ? 'mx-auto' : ''}`} />
  </div>
);

// ─── StatusBadge ──────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending:     'badge-status-pending',
    confirmed:   'badge-status-confirmed',
    completed:   'badge-status-completed',
    cancelled:   'badge-status-cancelled',
    rejected:    'badge-status-rejected',
    'in-progress': 'bg-blue-500/10 border-blue-400/20 text-blue-400',
    paid:        'badge-status-confirmed',
    partial:     'badge-status-pending',
    failed:      'badge-status-cancelled',
    captured:    'badge-status-confirmed',
    created:     'badge-status-pending',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase border rounded-sm ${map[status] || 'bg-gray-500/10 border-gray-400/20 text-gray-400'}`}>
      {status?.replace('-', ' ')}
    </span>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────
export const EmptyState = ({ icon = '✦', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-4xl text-gold-500/30 mb-4">{icon}</div>
    <h3 className="text-white font-display text-xl mb-2">{title}</h3>
    {description && <p className="text-luxe-muted text-sm mb-6 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ─── GoldButton ───────────────────────────────────────────────────
export const GoldButton = ({ children, onClick, type = 'button', disabled, loading, className = '', variant = 'solid' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`${variant === 'solid' ? 'btn-gold' : 'btn-outline-gold'} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? <Spinner size="sm" /> : children}
  </button>
);

// ─── Card ─────────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false }) => (
  <div className={`glass-card-dark rounded-sm p-6 ${hover ? 'transition-all duration-300 hover:border-gold-500/30 hover:shadow-luxury' : ''} ${className}`}>
    {children}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────
export const StatCard = ({ label, value, change, icon, color = 'gold' }) => (
  <Card className="flex items-start justify-between">
    <div>
      <p className="text-luxe-muted text-xs tracking-widest uppercase mb-2">{label}</p>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </p>
      )}
    </div>
    {icon && <div className="text-gold-500 opacity-60">{icon}</div>}
  </Card>
);

// ─── Input ────────────────────────────────────────────────────────
export const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div>
    {label && <label className="luxe-label">{label}</label>}
    <input ref={ref} className={`luxe-input ${error ? 'border-red-500 focus:border-red-500' : ''}`} {...props} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));

// ─── Select ───────────────────────────────────────────────────────
export const Select = React.forwardRef(({ label, error, children, ...props }, ref) => (
  <div>
    {label && <label className="luxe-label">{label}</label>}
    <select ref={ref} className={`luxe-input ${error ? 'border-red-500' : ''}`} {...props}>
      {children}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));

// ─── Textarea ─────────────────────────────────────────────────────
export const Textarea = React.forwardRef(({ label, error, rows = 4, ...props }, ref) => (
  <div>
    {label && <label className="luxe-label">{label}</label>}
    <textarea ref={ref} rows={rows} className={`luxe-input resize-none ${error ? 'border-red-500' : ''}`} {...props} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));

// ─── Modal ────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${sizes[size]} bg-luxe-dark border border-luxe-border shadow-luxury rounded-sm overflow-hidden`}
      >
        <div className="flex items-center justify-between p-6 border-b border-luxe-border">
          <h3 className="text-white font-display text-lg">{title}</h3>
          <button onClick={onClose} className="text-luxe-muted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────
export const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-luxe-muted text-xs">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center border border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500 disabled:opacity-30 transition-all text-xs">
          ←
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center border text-xs transition-all ${p === page ? 'border-gold-500 text-gold-500 bg-gold-500/10' : 'border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center border border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500 disabled:opacity-30 transition-all text-xs">
          →
        </button>
      </div>
    </div>
  );
};
