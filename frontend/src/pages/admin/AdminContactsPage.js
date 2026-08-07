import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../utils/api';
import { Spinner, EmptyState, StatusBadge } from '../../components/common/index';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new:      'text-blue-400 border-blue-400/20 bg-blue-400/5',
  read:     'text-luxe-muted border-luxe-border',
  replied:  'text-green-400 border-green-400/20 bg-green-400/5',
  archived: 'text-luxe-muted/40 border-luxe-border/40',
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getContacts()
      .then(r => setContacts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter ? contacts.filter(c => c.status === filter) : contacts;

  const counts = contacts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const handleSelect = (contact) => {
    setSelected(selected?._id === contact._id ? null : contact);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <Helmet><title>Contact Inquiries — Admin</title></Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-white font-display text-2xl">Contact Inquiries</h1>
            <p className="text-luxe-muted text-sm">{contacts.length} total messages</p>
          </div>
          <button onClick={load} className="btn-outline-gold text-xs py-2 px-4 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: contacts.length,     status: '' },
            { label: 'New',      value: counts.new     || 0, status: 'new' },
            { label: 'Replied',  value: counts.replied || 0, status: 'replied' },
            { label: 'Archived', value: counts.archived|| 0, status: 'archived' },
          ].map(s => (
            <button key={s.label} onClick={() => setFilter(f => f === s.status ? '' : s.status)}
              className={`p-4 border text-left transition-all rounded-sm ${filter === s.status ? 'border-gold-500 bg-gold-500/10' : 'border-luxe-border hover:border-gold-500/30 glass-card-dark'}`}>
              <p className="text-2xl font-display font-bold text-gold-500">{s.value}</p>
              <p className="text-luxe-muted text-xs uppercase tracking-widest">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {['', 'new', 'read', 'replied', 'archived'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-all rounded-sm ${filter === s ? 'bg-gold-500 border-gold-500 text-black' : 'border-luxe-border text-luxe-muted hover:border-gold-500/50 hover:text-gold-500'}`}>
              {s || 'All'}
              {s && counts[s] ? <span className="ml-1 opacity-70">({counts[s]})</span> : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="✉️" title="No inquiries found" description="Contact messages will appear here." />
        ) : (
          <div className="space-y-2">
            {filtered.map((contact) => (
              <div key={contact._id}>
                {/* Row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelect(contact)}
                  className={`p-5 border cursor-pointer transition-all duration-200 ${
                    selected?._id === contact._id
                      ? 'border-gold-500/40 bg-gold-500/5'
                      : contact.status === 'new'
                      ? 'border-blue-500/20 bg-blue-500/3 hover:border-gold-500/30'
                      : 'border-luxe-border hover:border-gold-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-500 font-bold text-sm flex-shrink-0 mt-0.5">
                        {contact.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <span className={`font-semibold text-sm ${contact.status === 'new' ? 'text-white' : 'text-white/70'}`}>
                            {contact.name}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 ${STATUS_COLORS[contact.status] || 'text-luxe-muted border-luxe-border'}`}>
                            {contact.status}
                          </span>
                          {contact.eventType && (
                            <span className="text-[10px] text-gold-500 border border-gold-500/20 px-2 py-0.5 capitalize">
                              {contact.eventType.replace('-', ' ')}
                            </span>
                          )}
                          {contact.status === 'new' && (
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm truncate mb-1 ${contact.status === 'new' ? 'text-white/80' : 'text-white/50'}`}>
                          {contact.subject}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-luxe-muted">
                          <span>📧 {contact.email}</span>
                          {contact.phone && <span>📞 {contact.phone}</span>}
                          {contact.guestCount && <span>👥 {contact.guestCount} guests</span>}
                          {contact.budget && <span>💰 ₹{Number(contact.budget).toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-luxe-muted text-xs whitespace-nowrap">{formatDate(contact.createdAt)}</p>
                      {contact.eventDate && (
                        <p className="text-gold-500/70 text-[10px] mt-1">
                          Event: {new Date(contact.eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {selected?._id === contact._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-t-0 border-gold-500/20 bg-luxe-dark p-6">
                        {/* Full message */}
                        <div className="mb-6">
                          <p className="text-[10px] text-gold-500 font-semibold uppercase tracking-widest mb-2">Message</p>
                          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{contact.message}</p>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pt-4 border-t border-luxe-border/50">
                          {[
                            ['Name',        contact.name],
                            ['Email',       contact.email],
                            ['Phone',       contact.phone || '—'],
                            ['Source',      contact.source || 'website'],
                            ['Event Type',  contact.eventType?.replace('-',' ') || '—'],
                            ['Event Date',  contact.eventDate ? new Date(contact.eventDate).toLocaleDateString('en-IN') : '—'],
                            ['Guest Count', contact.guestCount || '—'],
                            ['Budget',      contact.budget ? `₹${Number(contact.budget).toLocaleString('en-IN')}` : '—'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <p className="text-[10px] text-luxe-muted uppercase tracking-wider mb-0.5">{k}</p>
                              <p className="text-white text-xs capitalize">{v}</p>
                            </div>
                          ))}
                        </div>

                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-3">
                          <a href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                            className="btn-gold text-xs py-2 px-5 inline-flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Reply via Email
                          </a>
                          {contact.phone && (
                            <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${contact.name}, thank you for contacting Luxe Events!`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="btn-outline-gold text-xs py-2 px-5 inline-flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                              </svg>
                              WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => { setSelected(null); toast.success('Marked as archived'); }}
                            className="text-luxe-muted hover:text-white text-xs border border-luxe-border hover:border-white/30 py-2 px-4 transition-all">
                            Archive
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
