// ─── AdminVenuesPage.js ──────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { adminAPI, venuesAPI } from '../../utils/api';
import { Spinner, EmptyState, Modal, Input, Textarea, Select } from '../../components/common/index';
import toast from 'react-hot-toast';

const BLANK = {
  name:'', type:'banquet-hall', shortDescription:'', description:'',
  coverImage:'', 'location.address':'', 'location.city':'', 'location.state':'',
  'capacity.min':50, 'capacity.max':500,
  'pricing.basePrice':'', tags:'', isFeatured:false, isActive:true,
  amenities:'',
};

export function AdminVenuesPage() {
  const [venues,  setVenues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    venuesAPI.getAll({ limit: 50 })
      .then(r => setVenues(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit   = (v) => {
    setForm({
      ...BLANK, ...v,
      'location.address': v.location?.address || '',
      'location.city':    v.location?.city    || '',
      'location.state':   v.location?.state   || '',
      'capacity.min':     v.capacity?.min     || 50,
      'capacity.max':     v.capacity?.max     || 500,
      'pricing.basePrice': v.pricing?.basePrice || '',
      amenities: (v.amenities || []).join(', '),
      tags:      (v.tags      || []).join(', '),
    });
    setEditing(v._id);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.coverImage || !form['pricing.basePrice']) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, type: form.type,
        description: form.description, shortDescription: form.shortDescription,
        coverImage: form.coverImage, isFeatured: form.isFeatured, isActive: form.isActive,
        location: { address: form['location.address'], city: form['location.city'], state: form['location.state'], country: 'India' },
        capacity: { min: Number(form['capacity.min']), max: Number(form['capacity.max']) },
        pricing:  { basePrice: Number(form['pricing.basePrice']), currency: 'INR' },
        amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        tags:      form.tags      ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editing) { await adminAPI.updateVenue(editing, payload); toast.success('Venue updated'); }
      else         { await adminAPI.createVenue(payload);          toast.success('Venue created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <>
      <Helmet><title>Venues — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-display text-2xl">Venues</h1>
            <p className="text-luxe-muted text-sm">{venues.length} venues</p>
          </div>
          <button onClick={openCreate} className="btn-gold text-xs py-2 px-5">+ Add Venue</button>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> :
         venues.length === 0 ? <EmptyState icon="🏛️" title="No venues yet" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(v => (
              <div key={v._id} className="border border-luxe-border hover:border-gold-500/30 transition-all overflow-hidden">
                <div className="relative h-36">
                  <img src={v.coverImage} alt={v.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/80 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${v.isActive ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-medium text-sm truncate mb-0.5">{v.name}</p>
                  <p className="text-luxe-muted text-xs mb-0.5">{v.location?.city}, {v.location?.state}</p>
                  <p className="text-gold-500 text-sm font-bold mb-3">₹{v.pricing?.basePrice?.toLocaleString('en-IN')}</p>
                  <button onClick={() => openEdit(v)}
                    className="w-full text-[10px] border border-gold-500/30 text-gold-500 py-1.5 hover:bg-gold-500/10 transition-all">
                    Edit Venue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Venue' : 'Create Venue'} size="lg">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Venue Name *" value={form.name} onChange={e => up('name', e.target.value)} /></div>
            <Select label="Type" value={form.type} onChange={e => up('type', e.target.value)}>
              {['banquet-hall','hotel','garden','rooftop','beach','farmhouse','palace','resort','convention-center'].map(t => (
                <option key={t} value={t}>{t.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>
              ))}
            </Select>
            <Input label="Base Price (₹) *" type="number" value={form['pricing.basePrice']} onChange={e => up('pricing.basePrice', e.target.value)} />
          </div>
          <Input label="Cover Image URL *" value={form.coverImage} onChange={e => up('coverImage', e.target.value)} placeholder="https://..." />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><Input label="Address" value={form['location.address']} onChange={e => up('location.address', e.target.value)} /></div>
            <Input label="City" value={form['location.city']} onChange={e => up('location.city', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="State" value={form['location.state']} onChange={e => up('location.state', e.target.value)} />
            <Input label="Min Capacity" type="number" value={form['capacity.min']} onChange={e => up('capacity.min', e.target.value)} />
            <Input label="Max Capacity" type="number" value={form['capacity.max']} onChange={e => up('capacity.max', e.target.value)} />
          </div>
          <Textarea label="Description *" value={form.description} onChange={e => up('description', e.target.value)} rows={3} />
          <Input label="Amenities (comma-separated)" value={form.amenities} onChange={e => up('amenities', e.target.value)} placeholder="WiFi, Parking, Pool..." />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={e => up('tags', e.target.value)} placeholder="beach, luxury, goa..." />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => up('isFeatured', e.target.checked)} className="luxe-checkbox w-4 h-4" />
              <span className="text-white/70 text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => up('isActive', e.target.checked)} className="luxe-checkbox w-4 h-4" />
              <span className="text-white/70 text-sm">Active</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-luxe-border">
          <button onClick={() => setModal(false)} className="flex-1 border border-luxe-border text-luxe-muted py-2 text-sm hover:border-white/30 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-gold disabled:opacity-50">
            {saving ? <Spinner size="sm" /> : editing ? 'Save Changes' : 'Create Venue'}
          </button>
        </div>
      </Modal>
    </>
  );
}
export default AdminVenuesPage;
