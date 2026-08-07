import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatusBadge } from '../components/common/index';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    setLoading(true);
    eventsAPI.getBySlug(slug)
      .then((r) => { setEvent(r.data.data); setSelectedPkg(r.data.data?.packages?.[1] || r.data.data?.packages?.[0]); })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!event)  return null;

  const images = [event.coverImage, ...(event.gallery || [])].filter(Boolean);

  const handleBook = () => {
    if (!isAuthenticated) { toast('Please sign in to book'); navigate('/login'); return; }
    navigate(`/book/${event.slug}`, { state: { event, selectedPackage: selectedPkg } });
  };

  return (
    <>
      <Helmet>
        <title>{event.title} — Luxe Events</title>
        <meta name="description" content={event.shortDescription || event.description} />
      </Helmet>

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={images[activeImg]} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-gold text-[10px] mb-3 inline-block">{event.category?.replace('-', ' ')}</span>
            <h1 className="text-3xl md:text-5xl font-display font-semibold text-white">{event.title}</h1>
          </motion.div>
        </div>
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-8 flex gap-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-14 h-10 overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gold-500' : 'border-white/20'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div>
              <div className="flex items-center gap-6 mb-6">
                {event.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.round(event.rating) ? 'text-gold-500' : 'text-luxe-border'}`}>★</span>
                    ))}
                    <span className="text-white/60 text-sm ml-1">({event.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-luxe-muted text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {event.minGuests}–{event.maxGuests} guests
                </div>
                <div className="flex items-center gap-1 text-luxe-muted text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {event.duration}
                </div>
              </div>
              <p className="text-white/70 leading-relaxed text-base">{event.description}</p>
            </div>

            {/* Features */}
            {event.features?.length > 0 && (
              <div>
                <h3 className="text-white font-display text-xl mb-4">What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.features.map((f) => (
                    <div key={f} className="flex items-center gap-3 text-white/70 text-sm">
                      <span className="w-5 h-5 border border-gold-500/40 flex items-center justify-center flex-shrink-0 text-gold-500 text-xs">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages */}
            {event.packages?.length > 0 && (
              <div>
                <h3 className="text-white font-display text-xl mb-6">Choose Your Package</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {event.packages.map((pkg) => (
                    <button
                      key={pkg.name}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative text-left p-6 border rounded-sm transition-all duration-300 ${
                        selectedPkg?.name === pkg.name
                          ? 'border-gold-500 bg-gold-500/5 shadow-gold'
                          : 'border-luxe-border hover:border-gold-500/40'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-[9px] font-bold px-3 py-0.5 uppercase tracking-widest">Most Popular</span>
                      )}
                      <div className="text-gold-500 text-xs font-semibold tracking-wider uppercase mb-2">{pkg.name}</div>
                      <div className="text-white font-display text-2xl font-bold mb-1">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-luxe-muted text-xs mb-4">{pkg.priceType === 'per-person' ? 'per person' : 'flat price'}</div>
                      <div className="text-luxe-muted text-xs mb-4">{pkg.description}</div>
                      <ul className="space-y-1.5">
                        {(pkg.includes || []).map((inc) => (
                          <li key={inc} className="flex items-start gap-2 text-xs text-white/60">
                            <span className="text-gold-500 mt-0.5">✓</span>{inc}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-card-dark p-6 border border-luxe-border">
              <div className="text-center mb-6">
                <p className="text-luxe-muted text-xs uppercase tracking-widest mb-1">Starting from</p>
                <p className="text-gold-500 font-display text-4xl font-bold">
                  ₹{(selectedPkg?.price || event.basePrice).toLocaleString('en-IN')}
                </p>
                <p className="text-luxe-muted text-xs mt-1">{selectedPkg?.priceType === 'per-person' ? 'per person + taxes' : 'flat + taxes'}</p>
              </div>

              <div className="h-px bg-luxe-border mb-6" />

              {selectedPkg && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm">Selected Package</span>
                    <span className="badge-gold text-[10px]">{selectedPkg.name}</span>
                  </div>
                  <ul className="space-y-1">
                    {(selectedPkg.includes || []).slice(0, 3).map((inc) => (
                      <li key={inc} className="flex items-center gap-2 text-xs text-white/50">
                        <span className="text-gold-500">✓</span>{inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleBook} className="btn-gold w-full py-4 mb-3">
                Book This Experience
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <Link to="/contact" className="btn-outline-gold w-full py-3 text-xs block text-center">
                Request Custom Quote
              </Link>

              <div className="mt-6 space-y-3">
                {[
                  { icon: '🔒', text: 'Secure booking & payment' },
                  { icon: '🔄', text: 'Free reschedule up to 30 days' },
                  { icon: '📞', text: 'Dedicated event coordinator' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-luxe-muted">
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
