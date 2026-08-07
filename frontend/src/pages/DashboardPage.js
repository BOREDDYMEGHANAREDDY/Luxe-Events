import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingsAPI, paymentsAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/index';
import { StatusBadge, Spinner, EmptyState, Card, Input, Textarea, Modal } from '../components/common/index';
import toast from 'react-hot-toast';

// ─── Sidebar nav ──────────────────────────────────────────────────
const TABS = [
  { label: 'Overview',       path: '/dashboard',          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { label: 'My Bookings',    path: '/dashboard/bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Payments',       path: '/dashboard/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: 'My Profile',     path: '/dashboard/profile',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

function DashSidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed lg:relative top-0 left-0 z-40 h-full w-64 bg-luxe-dark border-r border-luxe-border
        flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-luxe-border">
          <p className="text-[10px] text-gold-500 uppercase tracking-[4px] font-semibold">My Account</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map((t) => (
            <NavLink key={t.path} to={t.path} end={t.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-sm ${
                  isActive ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
              </svg>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function Overview({ bookings, payments }) {
  const { user } = useAuth();
  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Confirmed',      value: bookings.filter(b => b.status === 'confirmed').length },
    { label: 'Total Spent',    value: `₹${payments.filter(p => p.status === 'captured').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}` },
    { label: 'Pending',        value: bookings.filter(b => b.status === 'pending').length },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="p-6 border border-gold-500/20 bg-gold-500/5">
        <h2 className="font-display text-2xl text-white mb-1">Welcome back, {user?.firstName}! 👋</h2>
        <p className="text-luxe-muted text-sm">Here's an overview of your Luxe Events activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-dark border border-luxe-border p-5 text-center">
            <p className="text-2xl font-display font-bold text-gold-500 mb-1">{s.value}</p>
            <p className="text-luxe-muted text-xs uppercase tracking-widest">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <h3 className="text-white font-display text-lg mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <EmptyState icon="📅" title="No bookings yet"
            description="Start planning your first luxury event today."
            action={<a href="/events" className="btn-gold text-xs py-2 px-6 mt-2 inline-block">Browse Events</a>} />
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((b) => (
              <div key={b._id} className="flex items-center justify-between p-4 border border-luxe-border hover:border-gold-500/30 transition-all">
                <div className="flex items-center gap-4">
                  {b.event?.coverImage && (
                    <img src={b.event.coverImage} alt="" className="w-12 h-12 object-cover flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{b.event?.title || 'Event'}</p>
                    <p className="text-luxe-muted text-xs">
                      {b.bookingId} · {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={b.status} />
                  <p className="text-gold-500 text-xs font-semibold mt-1">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── My Bookings ──────────────────────────────────────────────────
function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const { initiatePayment, processing } = useRazorpay();

  useEffect(() => {
    bookingsAPI.getAll()
      .then(r => setBookings(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a reason'); return; }
    setCancelling(true);
    try {
      await bookingsAPI.cancel(cancelModal._id, cancelReason);
      setBookings(prev => prev.map(b => b._id === cancelModal._id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
      setCancelModal(null);
      setCancelReason('');
    } catch (err) { toast.error(err.message); }
    finally { setCancelling(false); }
  };

  const handlePay = (booking) => {
    initiatePayment({
      bookingId: booking._id, paymentType: 'advance',
      onSuccess: () => setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'confirmed', paymentStatus: 'partial' } : b)),
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <h2 className="font-display text-xl text-white mb-6">My Bookings</h2>
      {bookings.length === 0 ? (
        <EmptyState icon="📋" title="No bookings found"
          description="Book your first luxury event to see it here."
          action={<a href="/events" className="btn-gold text-xs py-2 px-6 inline-block">Explore Events</a>} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <motion.div key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border border-luxe-border hover:border-gold-500/20 transition-all p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {b.event?.coverImage && (
                    <img src={b.event.coverImage} alt="" className="w-16 h-16 object-cover flex-shrink-0 hidden sm:block" />
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="text-white font-semibold">{b.event?.title}</p>
                      <StatusBadge status={b.status} />
                      <StatusBadge status={b.paymentStatus} />
                    </div>
                    <p className="text-luxe-muted text-xs mb-0.5">
                      Booking ID: <span className="text-gold-500 font-mono">{b.bookingId}</span>
                    </p>
                    <p className="text-luxe-muted text-xs">
                      📅 {new Date(b.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      &nbsp;·&nbsp; 👥 {b.guestCount} guests
                    </p>
                    {b.venue && <p className="text-luxe-muted text-xs">🏛 {b.venue.name}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gold-500 font-display font-bold text-lg">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-luxe-muted text-[10px] mb-3">incl. GST</p>
                  <div className="flex gap-2 justify-end flex-wrap">
                    {b.status === 'pending' && b.paymentStatus === 'pending' && (
                      <button onClick={() => handlePay(b)} disabled={processing}
                        className="btn-gold text-[10px] py-1.5 px-3">
                        {processing ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    {!['cancelled', 'completed', 'rejected'].includes(b.status) && (
                      <button onClick={() => setCancelModal(b)}
                        className="text-red-400/70 hover:text-red-400 text-[10px] border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 transition-all">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Timeline */}
              {b.timeline?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-luxe-border/50">
                  <p className="text-luxe-muted text-[10px] uppercase tracking-widest mb-2">Timeline</p>
                  <div className="flex flex-wrap gap-2">
                    {b.timeline.map((t, i) => (
                      <span key={i} className="text-[10px] text-white/40 border border-luxe-border/50 px-2 py-0.5">
                        {new Date(t.updatedAt).toLocaleDateString('en-IN')} — {t.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      <Modal isOpen={!!cancelModal} onClose={() => { setCancelModal(null); setCancelReason(''); }}
        title="Cancel Booking" size="sm">
        <div className="space-y-4">
          <p className="text-luxe-muted text-sm">
            Cancel booking <span className="text-gold-500 font-mono">{cancelModal?.bookingId}</span>?
            This action may be subject to cancellation fees.
          </p>
          <Textarea label="Reason for cancellation *" value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)} rows={3}
            placeholder="Please tell us why you're cancelling..." />
          <div className="flex gap-3">
            <button onClick={() => { setCancelModal(null); setCancelReason(''); }}
              className="btn-ghost flex-1 text-sm py-2 border border-luxe-border">Keep Booking</button>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 py-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
              {cancelling ? <Spinner size="sm" /> : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Payment History ──────────────────────────────────────────────
function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    paymentsAPI.getHistory()
      .then(r => setPayments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <h2 className="font-display text-xl text-white mb-6">Payment History</h2>
      {payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" description="Your payment history will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full luxe-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td><span className="font-mono text-gold-500 text-xs">{p.invoiceNumber || '—'}</span></td>
                  <td className="max-w-[140px] truncate">{p.booking?.event?.title || '—'}</td>
                  <td className="font-semibold text-white">₹{p.amount?.toLocaleString('en-IN')}</td>
                  <td><span className="text-xs capitalize text-luxe-muted">{p.paymentType}</span></td>
                  <td><span className="text-xs uppercase text-luxe-muted">{p.method || '—'}</span></td>
                  <td className="text-xs text-luxe-muted whitespace-nowrap">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    {p.invoiceNumber && (
                      <button onClick={() => window.open(`/api/payments/${p._id}/invoice`)}
                        className="text-gold-500 hover:text-gold-400 text-xs border border-gold-500/20 px-2 py-1 hover:border-gold-500/40 transition-all">
                        Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Profile ──────────────────────────────────────────────────────
function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]       = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: { street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '' },
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving]   = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 8) { toast.error('Minimum 8 characters'); return; }
    setSavingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="font-display text-xl text-white">My Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-gold-500 flex items-center justify-center text-black font-display font-bold text-3xl flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-luxe-muted text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge-gold text-[9px]">{user?.role?.toUpperCase()}</span>
            {user?.isEmailVerified
              ? <span className="text-[10px] text-green-400 border border-green-500/20 px-2 py-0.5">✓ Verified</span>
              : <span className="text-[10px] text-yellow-400 border border-yellow-500/20 px-2 py-0.5">⚠ Unverified</span>
            }
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="glass-card-dark border border-luxe-border p-6 space-y-5">
        <h3 className="text-white font-semibold text-sm uppercase tracking-widest">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName}
            onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
          <Input label="Last Name" value={form.lastName}
            onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
        </div>
        <Input label="Phone Number" value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="+91 98765 43210" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" value={form.address.city}
            onChange={(e) => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
          <Input label="State" value={form.address.state}
            onChange={(e) => setForm(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
        </div>
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">
          {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePassword} className="glass-card-dark border border-luxe-border p-6 space-y-5">
        <h3 className="text-white font-semibold text-sm uppercase tracking-widest">Change Password</h3>
        <Input label="Current Password" type="password" value={pwdForm.currentPassword}
          onChange={(e) => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} />
        <Input label="New Password" type="password" value={pwdForm.newPassword}
          onChange={(e) => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
          placeholder="Min. 8 characters" />
        <Input label="Confirm New Password" type="password" value={pwdForm.confirmPassword}
          onChange={(e) => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))} />
        <button type="submit" disabled={savingPwd} className="btn-outline-gold disabled:opacity-50">
          {savingPwd ? <><Spinner size="sm" /> Updating...</> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    bookingsAPI.getAll().then(r => setBookings(r.data.data || [])).catch(() => {});
    paymentsAPI.getHistory().then(r => setPayments(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <>
      <Helmet><title>Dashboard — Luxe Events</title></Helmet>
      <div className="min-h-screen bg-luxe-black pt-20">
        <div className="flex relative">
          <DashSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 min-w-0 p-6 lg:p-8">
            {/* Mobile header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h1 className="text-white font-display text-lg">Dashboard</h1>
              <button onClick={() => setSidebarOpen(true)}
                className="text-white/70 hover:text-white p-2 border border-luxe-border">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <Routes>
              <Route index element={<Overview bookings={bookings} payments={payments} />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="profile"  element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
