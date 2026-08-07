import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { adminAPI, eventsAPI } from '../../utils/api';
import { Spinner, EmptyState, Modal, Input, Textarea, Select } from '../../components/common/index';
import toast from 'react-hot-toast';

const BLANK_EVENT = {
  title:'', category:'wedding', shortDescription:'', description:'',
  coverImage:'', basePrice:'', duration:'1 Day', minGuests:10, maxGuests:500,
  tags:'', isFeatured:false, isActive:true,
};

export default function AdminEventsPage() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(BLANK_EVENT);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    eventsAPI.getAll({ limit: 50 })
      .then(r => setEvents(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(BLANK_EVENT); setEditing(null); setModal(true); };
  const openEdit   = (ev) => {
    setForm({ ...BLANK_EVENT, ...ev, tags: (ev.tags || []).join(', ') });
    setEditing(ev._id);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.category || !form.description || !form.coverImage || !form.basePrice) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        minGuests: Number(form.minGuests),
        maxGuests: Number(form.maxGuests),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await adminAPI.updateEvent(editing, payload);
        toast.success('Event updated');
      } else {
        await adminAPI.createEvent(payload);
        toast.success('Event created');
      }
      setModal(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (ev) => {
    try {
      await adminAPI.updateEvent(ev._id, { isActive: !ev.isActive });
      setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, isActive: !e.isActive } : e));
      toast.success(`Event ${!ev.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err.message); }
  };

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <>
      <Helmet><title>Events — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-display text-2xl">Events</h1>
            <p className="text-luxe-muted text-sm">{events.length} events</p>
          </div>
          <button onClick={openCreate} className="btn-gold text-xs py-2 px-5">+ Add Event</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <EmptyState icon="🎉" title="No events yet" action={<button onClick={openCreate} className="btn-gold text-xs py-2 px-5 mt-2">Create First Event</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div key={ev._id} className="border border-luxe-border hover:border-gold-500/30 transition-all overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <img src={ev.coverImage} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/80 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {ev.isFeatured && <span className="bg-gold-500 text-black text-[9px] font-bold px-1.5 py-0.5">Featured</span>}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${ev.isActive ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                      {ev.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-medium text-sm mb-0.5 truncate">{ev.title}</p>
                  <p className="text-luxe-muted text-xs capitalize mb-1">{ev.category?.replace('-', ' ')}</p>
                  <p className="text-gold-500 text-sm font-bold mb-3">₹{ev.basePrice?.toLocaleString('en-IN')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(ev)}
                      className="flex-1 text-[10px] border border-gold-500/30 text-gold-500 py-1.5 hover:bg-gold-500/10 transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleToggle(ev)}
                      className={`flex-1 text-[10px] border py-1.5 transition-all ${ev.isActive ? 'border-red-400/20 text-red-400 hover:bg-red-500/10' : 'border-green-400/20 text-green-400 hover:bg-green-500/10'}`}>
                      {ev.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Event' : 'Create Event'} size="lg">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Event Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="e.g. Royal Wedding Experience" />
            </div>
            <Select label="Category *" value={form.category} onChange={e => up('category', e.target.value)}>
              {['wedding','corporate','birthday','destination-wedding','product-launch','private-celebration','anniversary'].map(c => (
                <option key={c} value={c}>{c.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>
              ))}
            </Select>
            <Input label="Base Price (₹) *" type="number" value={form.basePrice} onChange={e => up('basePrice', e.target.value)} placeholder="250000" />
          </div>
          <Input label="Cover Image URL *" value={form.coverImage} onChange={e => up('coverImage', e.target.value)} placeholder="https://images.unsplash.com/..." />
          <Input label="Short Description" value={form.shortDescription} onChange={e => up('shortDescription', e.target.value)} placeholder="Max 200 characters" />
          <Textarea label="Full Description *" value={form.description} onChange={e => up('description', e.target.value)} rows={4} placeholder="Detailed event description..." />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Duration" value={form.duration} onChange={e => up('duration', e.target.value)} placeholder="1 Day" />
            <Input label="Min Guests" type="number" value={form.minGuests} onChange={e => up('minGuests', e.target.value)} />
            <Input label="Max Guests" type="number" value={form.maxGuests} onChange={e => up('maxGuests', e.target.value)} />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={e => up('tags', e.target.value)} placeholder="wedding, luxury, royal" />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => up('isFeatured', e.target.checked)} className="luxe-checkbox w-4 h-4" />
              <span className="text-white/70 text-sm">Featured on homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => up('isActive', e.target.checked)} className="luxe-checkbox w-4 h-4" />
              <span className="text-white/70 text-sm">Active / Published</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-luxe-border">
          <button onClick={() => setModal(false)} className="flex-1 border border-luxe-border text-luxe-muted py-2 text-sm hover:border-white/30 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-gold disabled:opacity-50">
            {saving ? <Spinner size="sm" /> : editing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </Modal>
    </>
  );
}
