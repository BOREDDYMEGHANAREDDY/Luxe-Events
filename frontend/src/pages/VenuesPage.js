// ─── VenuesPage.js ────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { venuesAPI } from '../utils/api';
import VenueCard from '../components/venues/VenueCard';
import { Spinner, EmptyState, Pagination } from '../components/common/index';
import { useDebounce } from '../hooks/index';

const TYPES = [
  { value: '', label: 'All Venues' },
  { value: 'palace', label: 'Palace' },
  { value: 'beach', label: 'Beach' },
  { value: 'garden', label: 'Garden' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'resort', label: 'Resort' },
  { value: 'convention-center', label: 'Convention' },
];

export default function VenuesPage() {
  const [venues, setVenues]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType]       = useState('');
  const [city, setCity]       = useState('');
  const [page, setPage]       = useState(1);
  const LIMIT = 9;
  const dCity = useDebounce(city, 400);

  useEffect(() => {
    setLoading(true);
    venuesAPI.getAll({ type, city: dCity, page, limit: LIMIT })
      .then((r) => { setVenues(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, [type, dCity, page]);

  return (
    <>
      <Helmet><title>Venues — Luxe Events</title></Helmet>

      <div className="page-hero pt-20">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-luxe-black/50 via-luxe-black/80 to-luxe-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-eyebrow">Extraordinary Spaces</span>
            <h1 className="text-4xl md:text-6xl font-display font-semibold text-white mb-4">
              Our <span className="text-gradient-gold">Venues</span>
            </h1>
            <p className="text-luxe-muted text-lg max-w-xl mx-auto">Palaces, beaches, rooftops, and gardens — each venue handpicked for its unique grandeur.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-luxe-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.value} onClick={() => { setType(t.value); setPage(1); }}
                  className={`px-4 py-2 text-xs font-medium tracking-wider uppercase border transition-all rounded-sm ${
                    type === t.value ? 'bg-gold-500 border-gold-500 text-black' : 'border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Search by city..." value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="luxe-input w-full lg:w-56 text-sm" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : venues.length === 0 ? (
            <EmptyState icon="🏛️" title="No venues found" description="Try adjusting your filters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((v, i) => <VenueCard key={v._id} venue={v} index={i} />)}
            </div>
          )}
          <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </section>
    </>
  );
}
