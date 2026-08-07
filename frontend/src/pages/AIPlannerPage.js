import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { aiAPI } from '../utils/api';
import { Spinner, SectionHeader } from '../components/common/index';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { value: 'wedding', label: '💍 Wedding', desc: 'Ceremonies & receptions' },
  { value: 'corporate', label: '🏢 Corporate', desc: 'Conferences & summits' },
  { value: 'birthday', label: '🎂 Birthday', desc: 'Milestone celebrations' },
  { value: 'destination-wedding', label: '✈️ Destination Wedding', desc: 'Exotic locations' },
  { value: 'product-launch', label: '🚀 Product Launch', desc: 'Brand reveals' },
  { value: 'private-celebration', label: '🥂 Private Event', desc: 'Exclusive gatherings' },
];

const BUDGETS = [
  { value: 200000,  label: '₹2 Lakh',   sub: 'Budget-friendly' },
  { value: 500000,  label: '₹5 Lakh',   sub: 'Mid-range' },
  { value: 1000000, label: '₹10 Lakh',  sub: 'Premium' },
  { value: 2500000, label: '₹25 Lakh',  sub: 'Luxury' },
  { value: 5000000, label: '₹50 Lakh+', sub: 'Ultra-luxury' },
];

export default function AIPlannerPage() {
  const [step, setStep]   = useState(0); // 0=form, 1=results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [form, setForm] = useState({
    eventType:  '',
    guestCount: 100,
    budget:     1000000,
    date:       '',
    preferences: [],
  });

  const handleSubmit = async () => {
    if (!form.eventType) { toast.error('Please select an event type'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.getRecommendations({
        eventType:   form.eventType,
        guestCount:  form.guestCount,
        budget:      form.budget,
        date:        form.date,
        preferences: form.preferences,
      });
      setResults(res.data.data);
      setStep(1);
    } catch (err) {
      toast.error('AI planner unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>AI Event Planner — Luxe Events</title></Helmet>

      {/* Hero */}
      <div className="page-hero pt-20">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-luxe-black via-[#0d0d1a] to-luxe-black" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(184,150,12,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(184,150,12,0.15) 0%, transparent 50%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-eyebrow">✦ AI-Powered</span>
            <h1 className="text-4xl md:text-6xl font-display font-semibold text-white mb-4">
              Your Personal <span className="text-gradient-gold">Event Planner</span>
            </h1>
            <p className="text-luxe-muted text-lg max-w-2xl mx-auto">
              Tell us about your dream event. Our AI will recommend venues, packages, decoration themes, and a detailed budget plan — instantly.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-luxe-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">

            {/* ─ FORM ─ */}
            {step === 0 && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="glass-card-dark p-8 border border-luxe-border space-y-8">

                  {/* Event type */}
                  <div>
                    <label className="luxe-label mb-4 block">What type of event are you planning?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {EVENT_TYPES.map((et) => (
                        <button key={et.value} onClick={() => setForm(f => ({ ...f, eventType: et.value }))}
                          className={`p-4 border text-left transition-all rounded-sm ${form.eventType === et.value ? 'border-gold-500 bg-gold-500/10' : 'border-luxe-border hover:border-gold-500/40'}`}>
                          <div className="text-base mb-1">{et.label}</div>
                          <div className="text-luxe-muted text-xs">{et.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guest count */}
                  <div>
                    <label className="luxe-label">How many guests? <span className="text-gold-500 font-bold text-base ml-2">{form.guestCount}</span></label>
                    <input type="range" min={10} max={1000} step={10} value={form.guestCount}
                      onChange={(e) => setForm(f => ({ ...f, guestCount: parseInt(e.target.value) }))}
                      className="w-full accent-gold-500 mt-2" />
                    <div className="flex justify-between text-xs text-luxe-muted mt-1"><span>10</span><span>1000</span></div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="luxe-label">What's your total budget?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
                      {BUDGETS.map((b) => (
                        <button key={b.value} onClick={() => setForm(f => ({ ...f, budget: b.value }))}
                          className={`py-3 border text-center transition-all rounded-sm ${form.budget === b.value ? 'border-gold-500 bg-gold-500/10' : 'border-luxe-border hover:border-gold-500/40'}`}>
                          <div className={`font-bold text-sm ${form.budget === b.value ? 'text-gold-500' : 'text-white'}`}>{b.label}</div>
                          <div className="text-luxe-muted text-[10px]">{b.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date (optional) */}
                  <div>
                    <label className="luxe-label">Tentative Date (Optional)</label>
                    <input type="date" value={form.date}
                      onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="luxe-input" />
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="btn-gold w-full py-5 text-base disabled:opacity-50">
                    {loading ? (
                      <><Spinner size="sm" /> Generating your plan...</>
                    ) : (
                      <>✨ Generate My Event Plan</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─ RESULTS ─ */}
            {step === 1 && results && (
              <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-6 flex items-center gap-4">
                  <button onClick={() => setStep(0)} className="btn-ghost text-xs">← Start Over</button>
                  <p className="text-gold-500 text-sm font-medium">✨ Your Personalised Event Plan</p>
                </div>

                {/* Summary */}
                <div className="glass-card-dark p-6 border border-gold-500/20 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge-gold">{results.budgetTier}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{results.summary}</p>
                  <p className="text-gold-500/80 text-sm mt-3 italic">{results.recommendedPackage}</p>
                </div>

                {/* Budget Breakdown */}
                <div className="glass-card-dark p-6 border border-luxe-border mb-6">
                  <h3 className="text-white font-display text-lg mb-5">Budget Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(results.budgetBreakdown || {}).map(([key, val]) => {
                      const total = Object.values(results.budgetBreakdown).reduce((a, b) => a + b, 0);
                      const pct = Math.round((val / total) * 100);
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70 capitalize">{key}</span>
                            <span className="text-white">₹{val.toLocaleString('en-IN')} <span className="text-luxe-muted">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 bg-luxe-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full bg-gold-gradient rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Decoration */}
                <div className="glass-card-dark p-6 border border-luxe-border mb-6">
                  <h3 className="text-white font-display text-lg mb-4">Decoration Recommendation</h3>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div>
                      <p className="text-luxe-muted text-xs uppercase tracking-wider mb-1">Theme</p>
                      <p className="text-gold-500 font-semibold">{results.decoration?.recommendedTheme}</p>
                    </div>
                    <div>
                      <p className="text-luxe-muted text-xs uppercase tracking-wider mb-2">Color Palette</p>
                      <div className="flex gap-2">
                        {(results.decoration?.colorPalette || []).map((c) => (
                          <span key={c} className="text-xs border border-luxe-border px-3 py-1 text-white/70">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-luxe-muted text-xs uppercase tracking-wider mb-2">Key Elements</p>
                      <div className="flex flex-wrap gap-1">
                        {(results.decoration?.keyElements || []).map((el) => (
                          <span key={el} className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-2 py-0.5">{el}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="glass-card-dark p-6 border border-luxe-border mb-6">
                  <h3 className="text-white font-display text-lg mb-4">Planning Timeline</h3>
                  <p className="text-gold-500 text-sm mb-4">📅 Book by: <strong>{results.timeline?.bookBy}</strong></p>
                  <ul className="space-y-2">
                    {(results.timeline?.milestones || []).map((m, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                        <span className="text-gold-500 mt-0.5">✓</span>{m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="glass-card-dark p-6 border border-luxe-border mb-8">
                  <h3 className="text-white font-display text-lg mb-4">Expert Tips</h3>
                  <ul className="space-y-2">
                    {(results.tips || []).map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                        <span className="text-gold-500 text-base leading-tight">💡</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Events */}
                {results.events?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-white font-display text-xl mb-5">Recommended Packages</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {results.events.map((ev) => (
                        <Link key={ev.id} to={`/events/${ev.title?.toLowerCase().replace(/\s+/g, '-')}`}
                          className="glass-card-dark border border-luxe-border hover:border-gold-500/40 transition-all overflow-hidden group">
                          <img src={ev.coverImage} alt={ev.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="p-4">
                            <p className="text-white font-medium text-sm line-clamp-1">{ev.title}</p>
                            <p className="text-gold-500 text-sm font-bold mt-1">From ₹{ev.basePrice?.toLocaleString('en-IN')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Link to="/contact" className="btn-gold px-12 py-4 text-base">
                    Book a Consultation ✦
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
