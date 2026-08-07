import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { venuesAPI } from '../utils/api';
import { Spinner } from '../components/common/index';

export default function VenueDetailPage() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const [venue, setVenue]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    venuesAPI.getBySlug(slug)
      .then((r) => setVenue(r.data.data))
      .catch(() => navigate('/venues'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!venue)  return null;

  const images = [venue.coverImage, ...(venue.gallery || [])].filter(Boolean);

  return (
    <>
      <Helmet><title>{venue.name} — Luxe Events</title></Helmet>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <img src={images[activeImg]} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <span className="badge-gold text-[10px] mb-3 inline-block">{venue.type?.replace('-', ' ')}</span>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-white mb-2">{venue.name}</h1>
          <p className="text-white/60 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {venue.location?.address}, {venue.location?.city}, {venue.location?.state}
          </p>
        </div>
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
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex flex-wrap gap-6 mb-6 text-sm text-luxe-muted">
                <span>👥 {venue.capacity?.min}–{venue.capacity?.max} guests</span>
                {venue.rating > 0 && <span>⭐ {venue.rating} ({venue.reviewCount} reviews)</span>}
              </div>
              <p className="text-white/70 leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            {venue.amenities?.length > 0 && (
              <div>
                <h3 className="text-white font-display text-xl mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {venue.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-gold-500 text-xs">✓</span>{a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {venue.policies && Object.values(venue.policies).some(Boolean) && (
              <div>
                <h3 className="text-white font-display text-xl mb-4">Policies</h3>
                <div className="space-y-3">
                  {Object.entries(venue.policies).map(([k, v]) => v && (
                    <div key={k} className="flex gap-3">
                      <span className="text-gold-500 text-xs font-semibold uppercase tracking-wider w-28 flex-shrink-0">{k}</span>
                      <span className="text-luxe-muted text-sm">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking card */}
          <div>
            <div className="sticky top-24 glass-card-dark p-6 border border-luxe-border">
              <p className="text-luxe-muted text-xs uppercase tracking-widest mb-1">Venue Rental</p>
              <p className="text-gold-500 font-display text-3xl font-bold mb-1">
                ₹{(venue.pricing?.basePrice || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-luxe-muted text-xs mb-6">+ applicable taxes</p>
              {venue.pricing?.weekendSurcharge > 0 && (
                <p className="text-xs text-yellow-400/70 mb-4">Weekend surcharge: {venue.pricing.weekendSurcharge}%</p>
              )}
              <Link to="/events" className="btn-gold w-full py-4 mb-3 block text-center">
                Book an Event Here
              </Link>
              <Link to="/contact" className="btn-outline-gold w-full py-3 text-xs block text-center">
                Enquire About Availability
              </Link>
              {venue.contactPerson?.phone && (
                <div className="mt-6 pt-6 border-t border-luxe-border">
                  <p className="text-luxe-muted text-xs mb-2">Venue Contact</p>
                  <p className="text-white text-sm">{venue.contactPerson.name}</p>
                  <p className="text-gold-500 text-sm">{venue.contactPerson.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
