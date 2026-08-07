import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  'banquet-hall': 'Banquet Hall', hotel: 'Hotel', garden: 'Garden',
  rooftop: 'Rooftop', beach: 'Beach', farmhouse: 'Farmhouse',
  palace: 'Palace', resort: 'Resort', 'convention-center': 'Convention Center',
};

export default function VenueCard({ venue, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/venues/${venue.slug}`} className="venue-card group block">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={venue.coverImage}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="badge-gold text-[10px]">{TYPE_LABELS[venue.type] || venue.type}</span>
          </div>
          {venue.isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="bg-gold-500 text-black text-[9px] font-bold px-2 py-1 tracking-widest uppercase">Top Venue</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg text-white mb-1 group-hover:text-gold-400 transition-colors line-clamp-1">{venue.name}</h3>
          <p className="text-luxe-muted text-xs flex items-center gap-1 mb-3">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {venue.location?.city}, {venue.location?.state}
          </p>
          <p className="text-luxe-muted text-sm line-clamp-2 mb-4">
            {venue.shortDescription || venue.description}
          </p>

          {/* Amenities preview */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(venue.amenities || []).slice(0, 3).map((a) => (
              <span key={a} className="text-[10px] text-luxe-muted border border-luxe-border px-2 py-0.5">{a}</span>
            ))}
            {(venue.amenities || []).length > 3 && (
              <span className="text-[10px] text-gold-500">+{venue.amenities.length - 3} more</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-luxe-border">
            <div>
              <p className="text-[10px] text-luxe-muted uppercase tracking-wider">Capacity</p>
              <p className="text-white text-sm font-medium">{venue.capacity?.min}–{venue.capacity?.max} guests</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-luxe-muted uppercase tracking-wider">From</p>
              <p className="text-gold-500 font-semibold text-sm">₹{(venue.pricing?.basePrice || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
