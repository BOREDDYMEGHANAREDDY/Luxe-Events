import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryAPI } from '../utils/api';
import { Spinner, EmptyState } from '../components/common/index';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'wedding', label: 'Weddings' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'birthday', label: 'Birthdays' },
  { value: 'venue', label: 'Venues' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'food', label: 'Catering' },
];

export default function GalleryPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [lightbox, setLightbox] = useState(null); // index
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    setLoading(true);
    galleryAPI.getAll({ category, type: 'image', page, limit: 24 })
      .then((r) => { setItems(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, page]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') setLightbox(i => Math.min(i + 1, items.length - 1));
      if (e.key === 'ArrowLeft')  setLightbox(i => Math.max(i - 1, 0));
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, items.length]);

  const handleCat = (cat) => { setCategory(cat); setPage(1); };

  return (
    <>
      <Helmet><title>Gallery — Luxe Events</title></Helmet>

      {/* Hero */}
      <div className="page-hero pt-20">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-luxe-black/60 via-luxe-black/80 to-luxe-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-eyebrow">Visual Story</span>
            <h1 className="text-4xl md:text-6xl font-display font-semibold text-white mb-4">
              Our <span className="text-gradient-gold">Gallery</span>
            </h1>
            <p className="text-luxe-muted text-lg max-w-xl mx-auto">
              A glimpse into the moments we've crafted — each image a story of luxury, elegance, and emotion.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-luxe-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => handleCat(c.value)}
                className={`px-5 py-2 text-xs font-medium tracking-wider uppercase border transition-all rounded-sm ${category === c.value ? 'bg-gold-500 border-gold-500 text-black' : 'border-luxe-border text-luxe-muted hover:border-gold-500 hover:text-gold-500'}`}>
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : items.length === 0 ? (
            <EmptyState icon="🖼️" title="No images found" />
          ) : (
            <>
              {/* Masonry-style grid */}
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="break-inside-avoid cursor-pointer group relative overflow-hidden"
                    onClick={() => setLightbox(i)}
                  >
                    <img src={item.url} alt={item.title || 'Gallery'} loading="lazy"
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                    {item.isFeatured && <div className="absolute top-2 right-2 w-2 h-2 bg-gold-500 rounded-full" />}
                  </motion.div>
                ))}
              </div>

              {/* Load more */}
              {items.length < total && (
                <div className="text-center mt-12">
                  <button onClick={() => setPage(p => p + 1)} className="btn-outline-gold px-10 py-3">
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && items[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2" onClick={() => setLightbox(null)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {lightbox > 0 && (
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 hover:bg-white/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(l => l - 1); }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {lightbox < items.length - 1 && (
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-3 hover:bg-white/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(l => l + 1); }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}

            <motion.img
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              src={items[lightbox].url}
              alt={items[lightbox].title}
              className="max-h-[85vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              {items[lightbox].title && <p className="text-white/70 text-sm">{items[lightbox].title}</p>}
              <p className="text-white/30 text-xs">{lightbox + 1} / {items.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
