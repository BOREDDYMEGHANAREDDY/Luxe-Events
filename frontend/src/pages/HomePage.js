import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { eventsAPI, testimonialsAPI } from '../utils/api';
import EventCard from '../components/events/EventCard';
import { SectionHeader, GoldDivider } from '../components/common/index';
import { useCountUp, useIntersectionObserver } from '../hooks/index';

// ─── Hero Section ─────────────────────────────────────────────────
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const slides = [
    { headline: 'Where Dreams', accent: 'Become Reality', sub: 'Luxury weddings, corporate masterpieces, and private celebrations crafted to absolute perfection.', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80' },
    { headline: 'Moments That', accent: 'Last Forever', sub: 'Every detail meticulously planned. Every experience flawlessly executed. Every memory made extraordinary.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80' },
    { headline: 'India\'s Most', accent: 'Trusted Events Partner', sub: '500+ luxury events. 10,000+ satisfied guests. One promise — absolute excellence.', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80' },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-center">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
          style={{ y }}
        >
          <img src={slides[currentSlide].img} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-luxe-black via-luxe-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-16 w-px h-32 bg-gold-gradient opacity-30 hidden lg:block" />
      <div className="absolute bottom-1/3 right-32 w-2 h-2 border border-gold-500 rotate-45 opacity-40 hidden lg:block" />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.span
              className="section-eyebrow"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              ✦ Luxury Event Management
            </motion.span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold leading-[1.1] mb-6">
              <span className="text-white">{slides[currentSlide].headline}</span>
              <br />
              <span className="text-gradient-gold">{slides[currentSlide].accent}</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
              {slides[currentSlide].sub}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/events" className="btn-gold px-8 py-4 text-sm">
                Explore Events
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link to="/ai-planner" className="btn-outline-gold px-8 py-4 text-sm">
                AI Event Planner
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-500 ${i === currentSlide ? 'w-8 h-0.5 bg-gold-500' : 'w-2 h-0.5 bg-white/30'}`} />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 right-8 hidden lg:flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] text-white/40 tracking-widest uppercase rotate-90 mb-2">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold-500" />
      </motion.div>
    </section>
  );
};

// ─── Stats Section ────────────────────────────────────────────────
const StatItem = ({ value, suffix, label }) => {
  const { ref, isVisible } = useIntersectionObserver();
  const { count, startCount } = useCountUp(value, 2000);

  useEffect(() => { if (isVisible) startCount(); }, [isVisible]);

  return (
    <div ref={ref} className="text-center">
      <div className="stat-number">
        {count}{suffix}
      </div>
      <div className="text-luxe-muted text-sm tracking-widest uppercase mt-2">{label}</div>
    </div>
  );
};

const StatsSection = () => (
  <section className="py-16 border-y border-luxe-border bg-luxe-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <StatItem value={500}  suffix="+"  label="Events Delivered" />
        <StatItem value={10}   suffix="K+" label="Happy Guests" />
        <StatItem value={98}   suffix="%"  label="Client Satisfaction" />
        <StatItem value={12}   suffix="+"  label="Years Excellence" />
      </div>
    </div>
  </section>
);

// ─── Services Section ─────────────────────────────────────────────
const SERVICES = [
  { icon: '💍', title: 'Royal Weddings',        desc: 'Grand ceremonies with meticulous attention to every detail.' },
  { icon: '🏢', title: 'Corporate Events',       desc: 'Impactful conferences, launches and corporate milestones.' },
  { icon: '🎂', title: 'Birthday Celebrations',  desc: 'Milestone birthdays crafted to reflect your unique personality.' },
  { icon: '✈️', title: 'Destination Weddings',   desc: 'Say I do at exotic locations across India and beyond.' },
  { icon: '🚀', title: 'Product Launches',       desc: 'Dramatic reveals that define your brand story.' },
  { icon: '🥂', title: 'Private Celebrations',   desc: 'Exclusive intimate gatherings for the most discerning.' },
];

const ServicesSection = () => (
  <section className="py-24 bg-luxe-black">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="What We Do"
        title="Crafted for Every Occasion"
        subtitle="From intimate gatherings to grand spectacles, our expertise spans the full spectrum of luxury events."
        center
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card-dark p-8 group hover:border-gold-500/30 transition-all duration-300 cursor-default"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
            <h3 className="font-display text-xl text-white mb-3 group-hover:text-gold-400 transition-colors">{s.title}</h3>
            <p className="text-luxe-muted text-sm leading-relaxed">{s.desc}</p>
            <div className="mt-4 w-8 h-px bg-gold-500 group-hover:w-16 transition-all duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Testimonials Section ─────────────────────────────────────────
const TestimonialsSection = ({ testimonials }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  return (
    <section className="py-24 bg-luxe-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Client Love" title="Stories That Inspire" center />

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass-card-dark p-10 text-center relative"
            >
              <div className="text-gold-500 text-6xl font-display opacity-20 absolute top-6 left-8">"</div>
              <div className="flex justify-center mb-4">
                {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                  <span key={i} className="text-gold-500 text-lg">★</span>
                ))}
              </div>
              <p className="text-white/80 text-lg leading-relaxed italic mb-8 relative z-10">
                {testimonials[active].content}
              </p>
              <div className="flex items-center justify-center gap-4">
                {testimonials[active].avatar && (
                  <img src={testimonials[active].avatar} alt={testimonials[active].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold-500/30" />
                )}
                <div>
                  <p className="text-white font-semibold">{testimonials[active].name}</p>
                  <p className="text-gold-500 text-xs tracking-wider uppercase">{testimonials[active].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`transition-all duration-300 ${i === active ? 'w-8 h-0.5 bg-gold-500' : 'w-2 h-0.5 bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── CTA Section ──────────────────────────────────────────────────
const CTASection = () => (
  <section className="py-24 bg-luxe-black relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500 rounded-full blur-[150px]" />
    </div>
    <div className="relative max-w-4xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <span className="section-eyebrow">Start Planning</span>
        <h2 className="section-title mb-6">
          Your Perfect Event <br />
          <span className="text-gradient-gold">Awaits You</span>
        </h2>
        <p className="section-subtitle mx-auto mb-10">
          Let our AI-powered event planner craft a bespoke experience tailored precisely to your vision, preferences, and budget.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/ai-planner" className="btn-gold px-10 py-4">
            Plan with AI
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </Link>
          <Link to="/contact" className="btn-outline-gold px-10 py-4">Talk to an Expert</Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Sponsors Section ─────────────────────────────────────────────
const BRANDS = ['Taj Hotels', 'ITC Hotels', 'Leela Palace', 'Oberoi Group', 'Marriott', 'Hyatt'];

const SponsorsSection = () => (
  <section className="py-12 border-y border-luxe-border bg-luxe-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-luxe-muted text-xs tracking-[4px] uppercase mb-8">Trusted by India's Finest Hospitality Brands</p>
      <div className="flex items-center justify-center flex-wrap gap-8 lg:gap-16">
        {BRANDS.map((b) => (
          <span key={b} className="text-white/20 text-sm font-semibold tracking-widest uppercase hover:text-gold-500/40 transition-colors cursor-default">{b}</span>
        ))}
      </div>
    </div>
  </section>
);

// ─── Main Page ────────────────────────────────────────────────────
export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    eventsAPI.getAll({ featured: true, limit: 3 })
      .then((r) => setFeaturedEvents(r.data.data || []))
      .catch(() => {});
    testimonialsAPI.getAll()
      .then((r) => setTestimonials(r.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>Luxe Events — Luxury Event Management Platform</title>
        <meta name="description" content="India's premier luxury event management company. Royal weddings, corporate events, destination weddings, and private celebrations." />
      </Helmet>

      <HeroSection />
      <StatsSection />
      <ServicesSection />

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-24 bg-luxe-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <SectionHeader eyebrow="Featured" title="Signature Experiences" />
              <Link to="/events" className="btn-outline-gold text-xs py-2 px-5 hidden sm:inline-flex">View All Events →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((ev, i) => <EventCard key={ev._id} event={ev} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <TestimonialsSection testimonials={testimonials} />
      <SponsorsSection />
      <CTASection />
    </>
  );
}
