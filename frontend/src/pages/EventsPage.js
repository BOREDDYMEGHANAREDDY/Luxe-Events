import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { eventsAPI } from '../utils/api';
import EventCard from '../components/events/EventCard';
import { SectionHeader, Spinner, EmptyState, Pagination } from '../components/common/index';
import { useDebounce } from '../hooks/index';

const CATEGORIES = [
  { value: '', label: 'All Events' },
  { value: 'wedding', label: 'Weddings' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'destination-wedding', label: 'Destination Wedding' },
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'private-celebration', label: 'Private' },
];

export default function EventsPage() {
  const [events, setEvents]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 9;

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    eventsAPI.getAll({ category, search: debouncedSearch, page, limit: LIMIT })
      .then((r) => { setEvents(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [category, debouncedSearch, page]);

  const handleCategoryChange = (cat) => { setCategory(cat); setPage(1); };

  return (
    <>
      <Helmet>
        <title>Events — Luxe Events</title>
        <meta name="description" content="Explore our full range of luxury event packages — weddings, corporate, destination, and more." />
      </Helmet>

      {/* Page hero */}
      <div className="page-hero pt-20">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80" alt=""
            className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-luxe-black/50 via-luxe-black/80 to-luxe-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="section-eyebrow">Our Portfolio</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-white mb-4">
              Signature <span className="text-gradient-gold">Events</span>
            </h1>
            <p className="text-luxe-muted text-lg max-w-2xl mx-auto">
              Explore our curated collection of luxury event experiences, each designed to exceed every expectation.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-luxe-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleCategoryChange(c.value)}
                  className={`px-4 py-2 text-xs font-medium tracking-wider uppercase border transition-all duration-200 rounded-sm ${
                    category === c.value
                      ? 'bg-gold-500 border-gold-500 text-black'
                      : 'border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxe-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="luxe-input pl-10 text-sm"
              />
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-luxe-muted text-sm mb-6">{total} event{total !== 1 ? 's' : ''} found</p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <EmptyState icon="✦" title="No events found" description="Try adjusting your filters or search term." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, i) => <EventCard key={ev._id} event={ev} index={i} />)}
            </div>
          )}

          <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </section>
    </>
  );
}
