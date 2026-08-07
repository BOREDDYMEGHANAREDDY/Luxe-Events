import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { adminAPI } from '../../utils/api';
import { StatusBadge, Spinner, Pagination, Modal, Textarea, Select, EmptyState } from '../../components/common/index';
import { useDebounce } from '../../hooks/index';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [status,   setStatus]   = useState('');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [newStatus, setNewStatus]     = useState('');
  const [adminNotes, setAdminNotes]   = useState('');
  const [updating, setUpdating]       = useState(false);

  const dSearch = useDebounce(search, 400);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getBookings({ page, limit: 15, status, search: dSearch })
      .then(r => { setBookings(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status, dSearch]);

  useEffect(() => { load(); }, [load]);

  const openUpdate = (b) => {
    setUpdateModal(b);
    setNewStatus(b.status);
    setAdminNotes(b.adminNotes || '');
  };

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await adminAPI.updateBookingStatus(updateModal._id, { status: newStatus, adminNotes });
      toast.success('Booking status updated');
      setUpdateModal(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  return (
    <>
      <Helmet><title>Bookings — Admin</title></Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-white font-display text-2xl">Bookings</h1>
            <p className="text-luxe-muted text-sm">{total} total bookings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-all rounded-sm ${status === s ? 'bg-gold-500 border-gold-500 text-black' : 'border-luxe-border text-luxe-muted hover:border-gold-500/50 hover:text-gold-500'}`}>
              {s || 'All'}
            </button>
          ))}
          <input type="text" placeholder="Search booking ID..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="luxe-input text-xs w-44 ml-auto" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState icon="📋" title="No bookings found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full luxe-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Booking ID</th><th>Client</th><th>Event</th><th>Date</th>
                  <th>Guests</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="cursor-pointer hover:bg-white/2" onClick={() => setSelected(selected?._id === b._id ? null : b)}>
                    <td><span className="font-mono text-gold-500 text-xs">{b.bookingId}</span></td>
                    <td>
                      <div>
                        <p className="text-white text-xs font-medium">{b.user?.firstName} {b.user?.lastName}</p>
                        <p className="text-luxe-muted text-[10px]">{b.user?.email}</p>
                      </div>
                    </td>
                    <td className="text-xs text-white/70 max-w-[120px] truncate">{b.event?.title}</td>
                    <td className="text-xs text-luxe-muted whitespace-nowrap">
                      {new Date(b.eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="text-xs text-white/70">{b.guestCount}</td>
                    <td className="text-xs font-semibold text-gold-500">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><StatusBadge status={b.paymentStatus} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openUpdate(b)}
                        className="text-gold-500 hover:text-gold-400 text-[10px] border border-gold-500/20 hover:border-gold-500/40 px-3 py-1.5 transition-all whitespace-nowrap">
                        Update Status
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} total={total} limit={15} onPageChange={setPage} />

        {/* Inline detail row */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-gold-500/20 bg-gold-500/5 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                ['Venue',     selected.venue?.name || 'TBD'],
                ['Package',   selected.package?.name || 'Standard'],
                ['Catering',  selected.catering?.required ? `Yes (${selected.catering.type})` : 'No'],
                ['Advance Paid', selected.advanceAmount ? `₹${selected.advanceAmount.toLocaleString('en-IN')}` : 'None'],
                ['Contact', selected.contactDetails?.phone || '—'],
                ['Event Time', selected.eventTime || '—'],
                ['Decoration', selected.decoration?.style || '—'],
                ['Created', new Date(selected.createdAt).toLocaleDateString('en-IN')],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-luxe-muted text-[10px] uppercase tracking-wider mb-0.5">{k}</p>
                  <p className="text-white text-xs">{v}</p>
                </div>
              ))}
            </div>
            {selected.specialRequirements && (
              <div className="mt-4 pt-4 border-t border-luxe-border/50">
                <p className="text-luxe-muted text-[10px] uppercase tracking-wider mb-1">Special Requirements</p>
                <p className="text-white/70 text-xs">{selected.specialRequirements}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Update modal */}
      <Modal isOpen={!!updateModal} onClose={() => setUpdateModal(null)} title={`Update Booking ${updateModal?.bookingId}`} size="sm">
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </Select>
          <Textarea label="Admin Notes (optional)" value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)} rows={3}
            placeholder="Notes visible to the client in their status update email..." />
          <div className="flex gap-3">
            <button onClick={() => setUpdateModal(null)} className="flex-1 border border-luxe-border text-luxe-muted py-2 text-sm hover:border-white/30 transition-all">
              Cancel
            </button>
            <button onClick={handleUpdate} disabled={updating} className="flex-1 btn-gold disabled:opacity-50">
              {updating ? <Spinner size="sm" /> : 'Update'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
