import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORY_LABELS = {
  wedding: 'Wedding',
  corporate: 'Corporate',
  birthday: 'Birthday',
  'destination-wedding': 'Destination Wedding',
  'product-launch': 'Product Launch',
  'private-celebration': 'Private',
  anniversary: 'Anniversary',
};

export default function EventCard({ event, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/events/${event.slug}`} className="event-card group block">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="badge-gold text-[10px]">
              {CATEGORY_LABELS[event.category] || event.category}
            </span>
          </div>

          {/* Featured */}
          {event.isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="bg-gold-500 text-black text-[9px] font-bold px-2 py-1 tracking-widest uppercase">Featured</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg text-white mb-2 group-hover:text-gold-400 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-luxe-muted text-sm leading-relaxed line-clamp-2 mb-4">
            {event.shortDescription || event.description}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-luxe-border">
            <div>
              <p className="text-[10px] text-luxe-muted uppercase tracking-wider mb-0.5">Starting from</p>
              <p className="text-gold-500 font-semibold text-sm">
                ₹{(event.basePrice || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {event.rating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gold-500 text-xs">★</span>
                  <span className="text-white text-xs font-medium">{event.rating}</span>
                  <span className="text-luxe-muted text-[10px]">({event.reviewCount})</span>
                </div>
              )}
              <div className="w-7 h-7 border border-gold-500/40 flex items-center justify-center group-hover:bg-gold-500 group-hover:border-gold-500 transition-all duration-300">
                <svg className="w-3 h-3 text-gold-500 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
