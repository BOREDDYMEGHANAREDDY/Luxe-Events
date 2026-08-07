import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { eventsAPI, venuesAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/index';
import { Spinner, Input, Select, Textarea } from '../components/common/index';
import toast from 'react-hot-toast';

const STEPS = ['Event Details', 'Venue & Date', 'Catering & Extras', 'Review & Pay'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-12">
    {STEPS.map((step, i) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center">
          <div className={`w-9 h-9 flex items-center justify-center border-2 text-sm font-semibold transition-all duration-300 ${
            i < current ? 'bg-gold-500 border-gold-500 text-black' :
            i === current ? 'border-gold-500 text-gold-500' :
            'border-luxe-border text-luxe-muted'
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] mt-2 tracking-wider uppercase hidden sm:block ${i === current ? 'text-gold-500' : 'text-luxe-muted'}`}>{step}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-px mx-2 sm:mx-4 transition-all duration-500 ${i < current ? 'bg-gold-500' : 'bg-luxe-border'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default function BookingPage() {
  const { eventSlug } = useParams();
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { initiatePayment, processing } = useRazorpay();

  const [step, setStep]   = useState(0);
  const [event, setEvent] = useState(location.state?.event || null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(!event);
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const [form, setForm] = useState({
    packageName: location.state?.selectedPackage?.name || '',
    guestCount:  100,
    venueId:     '',
    eventDate:   null,
    eventTime:   '10:00 AM',
    catering:    { required: false, type: 'veg', mealsPerDay: 3 },
    decoration:  { theme: '', style: 'luxury', colors: [] },
    specialRequirements: '',
    contactDetails: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email, phone: user?.phone || '' },
    paymentType: 'advance',
  });

  const [pricing, setPricing] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Load event if not passed via state
  useEffect(() => {
    if (!event) {
      eventsAPI.getBySlug(eventSlug)
        .then((r) => setEvent(r.data.data))
        .catch(() => navigate('/events'))
        .finally(() => setLoading(false));
    }
  }, [eventSlug]);

  // Load venues
  useEffect(() => {
    venuesAPI.getAll({ limit: 20 }).then((r) => setVenues(r.data.data || [])).catch(() => {});
  }, []);

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    if (!event || step < 2) return;
    const pkg = event.packages?.find(p => p.name === form.packageName);
    setCalcLoading(true);
    bookingsAPI.calculateCost({
      eventId: event._id,
      guestCount: form.guestCount,
      packageName: form.packageName,
      venueId: form.venueId,
      catering: form.catering.required,
    }).then((r) => setPricing(r.data.data))
      .catch(() => {})
      .finally(() => setCalcLoading(false));
  }, [event, form.guestCount, form.packageName, form.venueId, form.catering.required, step]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateNested = (parent, key, value) => setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));

  const handleSubmit = async () => {
    if (!form.eventDate) { toast.error('Please select an event date'); return; }
    setSubmitting(true);
    try {
      const res = await bookingsAPI.create({
        eventId:  event._id,
        venueId:  form.venueId || undefined,
        packageName:  form.packageName,
        eventDate:    form.eventDate,
        eventTime:    form.eventTime,
        guestCount:   parseInt(form.guestCount),
        catering:     form.catering,
        decoration:   form.decoration,
        specialRequirements: form.specialRequirements,
        contactDetails: form.contactDetails,
      });
      setCreatedBooking(res.data.data);
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = () => {
    if (!createdBooking) return;
    initiatePayment({
      bookingId:   createdBooking._id,
      paymentType: form.paymentType,
      onSuccess:   () => navigate('/dashboard'),
      onFailure:   () => {},
    });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <>
      <Helmet><title>Book {event?.title} — Luxe Events</title></Helmet>

      <div className="min-h-screen bg-luxe-black pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="section-eyebrow">Booking</span>
            <h1 className="text-3xl font-display font-semibold text-white">{event?.title}</h1>
          </div>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="glass-card-dark p-8 border border-luxe-border"
            >

              {/* STEP 0: Event details */}
              {step === 0 && (
                <div className="space-y-6">
                  <h2 className="text-white font-display text-xl mb-6">Select Package & Guest Count</h2>

                  {/* Package selection */}
                  {event?.packages?.length > 0 && (
                    <div>
                      <label className="luxe-label">Event Package</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {event.packages.map((pkg) => (
                          <button key={pkg.name} onClick={() => update('packageName', pkg.name)}
                            className={`text-left p-4 border rounded-sm transition-all ${form.packageName === pkg.name ? 'border-gold-500 bg-gold-500/5' : 'border-luxe-border hover:border-gold-500/40'}`}>
                            <div className="text-gold-500 text-xs font-semibold uppercase">{pkg.name}</div>
                            <div className="text-white font-bold mt-1">₹{pkg.price.toLocaleString('en-IN')}</div>
                            <div className="text-luxe-muted text-xs">{pkg.priceType === 'per-person' ? '/person' : 'flat'}</div>
                            {pkg.isPopular && <span className="text-[9px] text-gold-500 border border-gold-500/30 px-1 mt-2 inline-block">Popular</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="luxe-label">Number of Guests</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min={event?.minGuests || 10} max={event?.maxGuests || 500}
                        value={form.guestCount} onChange={(e) => update('guestCount', parseInt(e.target.value))}
                        className="flex-1 accent-gold-500" />
                      <span className="text-gold-500 font-bold text-lg w-16 text-right">{form.guestCount}</span>
                    </div>
                    <p className="text-luxe-muted text-xs mt-1">Min: {event?.minGuests} · Max: {event?.maxGuests}</p>
                  </div>

                  <div>
                    <label className="luxe-label">Event Time</label>
                    <Select value={form.eventTime} onChange={(e) => update('eventTime', e.target.value)}>
                      {['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','04:00 PM','06:00 PM','07:00 PM','08:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Contact Name" value={form.contactDetails.name}
                      onChange={(e) => updateNested('contactDetails', 'name', e.target.value)} />
                    <Input label="Phone Number" value={form.contactDetails.phone}
                      onChange={(e) => updateNested('contactDetails', 'phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
              )}

              {/* STEP 1: Venue & Date */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-white font-display text-xl mb-6">Choose Venue & Date</h2>

                  <div>
                    <label className="luxe-label">Preferred Venue (Optional)</label>
                    <Select value={form.venueId} onChange={(e) => update('venueId', e.target.value)}>
                      <option value="">— No preference / TBD —</option>
                      {venues.map((v) => (
                        <option key={v._id} value={v._id}>{v.name} — {v.location?.city} (up to {v.capacity?.max})</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="luxe-label">Event Date *</label>
                    <DatePicker
                      selected={form.eventDate}
                      onChange={(date) => update('eventDate', date)}
                      minDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                      dateFormat="dd MMM yyyy"
                      placeholderText="Select event date"
                      className="luxe-input w-full cursor-pointer"
                      calendarClassName="luxe-datepicker"
                    />
                    <p className="text-luxe-muted text-xs mt-1">Must be at least 7 days from today</p>
                  </div>
                </div>
              )}

              {/* STEP 2: Catering & Extras */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-white font-display text-xl mb-6">Catering & Decoration</h2>

                  <div className="p-5 border border-luxe-border bg-luxe-card/50">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.catering.required}
                        onChange={(e) => updateNested('catering', 'required', e.target.checked)}
                        className="luxe-checkbox w-4 h-4" />
                      <span className="text-white font-medium">Include Catering Service</span>
                    </label>
                    {form.catering.required && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Select label="Menu Type" value={form.catering.type}
                          onChange={(e) => updateNested('catering', 'type', e.target.value)}>
                          <option value="veg">Vegetarian</option>
                          <option value="non-veg">Non-Vegetarian</option>
                          <option value="both">Both</option>
                        </Select>
                        <Select label="Meals per Day" value={form.catering.mealsPerDay}
                          onChange={(e) => updateNested('catering', 'mealsPerDay', parseInt(e.target.value))}>
                          <option value={1}>1 Meal</option>
                          <option value={2}>2 Meals</option>
                          <option value={3}>3 Meals</option>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="luxe-label">Decoration Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {['minimal','traditional','modern','luxury','floral'].map((s) => (
                        <button key={s} onClick={() => updateNested('decoration', 'style', s)}
                          className={`py-2 text-xs font-medium tracking-wider uppercase border transition-all ${form.decoration.style === s ? 'border-gold-500 bg-gold-500/10 text-gold-500' : 'border-luxe-border text-luxe-muted hover:border-gold-500/40'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input label="Decoration Theme (Optional)" value={form.decoration.theme}
                    onChange={(e) => updateNested('decoration', 'theme', e.target.value)}
                    placeholder="e.g. Royal Garden, Modern Minimalist..." />

                  <Textarea label="Special Requirements" value={form.specialRequirements}
                    onChange={(e) => update('specialRequirements', e.target.value)}
                    rows={4} placeholder="Any dietary restrictions, accessibility needs, or special requests..." />

                  {/* Live cost preview */}
                  {pricing && (
                    <div className="p-5 border border-gold-500/20 bg-gold-500/5">
                      <h4 className="text-gold-500 text-xs font-semibold uppercase tracking-widest mb-4">Cost Estimate</h4>
                      <div className="space-y-2">
                        {[
                          ['Package', pricing.basePrice],
                          form.catering.required && ['Catering', pricing.cateringPrice],
                          ['Decoration', pricing.decorationPrice],
                          pricing.venuePrice && ['Venue', pricing.venuePrice],
                          ['Subtotal', pricing.subtotal],
                          [`GST (${pricing.taxRate}%)`, pricing.taxAmount],
                        ].filter(Boolean).map(([label, amount]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className={label === 'Subtotal' ? 'text-white font-medium' : 'text-luxe-muted'}>{label}</span>
                            <span className={label === 'Subtotal' ? 'text-white font-medium' : 'text-white/70'}>
                              ₹{(amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-gold-500/20">
                          <span className="text-gold-500 font-bold">Total</span>
                          <span className="text-gold-500 font-bold">₹{pricing.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Confirm & Pay */}
              {step === 3 && createdBooking && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-500 text-2xl">✓</span>
                    </div>
                    <h2 className="text-white font-display text-2xl mb-2">Booking Received!</h2>
                    <p className="text-luxe-muted text-sm">Booking ID: <span className="text-gold-500 font-bold">{createdBooking.bookingId}</span></p>
                  </div>

                  {/* Summary */}
                  <div className="p-5 border border-luxe-border">
                    {[
                      ['Event', event?.title],
                      ['Date', form.eventDate ? new Date(form.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                      ['Guests', form.guestCount],
                      ['Package', form.packageName || 'Standard'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-luxe-border/50 last:border-0 text-sm">
                        <span className="text-luxe-muted">{k}</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                    {pricing && (
                      <div className="flex justify-between py-2 text-sm font-bold">
                        <span className="text-gold-500">Total Amount</span>
                        <span className="text-gold-500">₹{pricing.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment type */}
                  <div>
                    <label className="luxe-label">Payment Option</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'advance', label: 'Pay 30% Now', sub: `₹${((pricing?.totalAmount || 0) * 0.3).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                        { value: 'full',    label: 'Pay in Full', sub: `₹${(pricing?.totalAmount || 0).toLocaleString('en-IN')}` },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => update('paymentType', opt.value)}
                          className={`p-4 border text-left transition-all ${form.paymentType === opt.value ? 'border-gold-500 bg-gold-500/5' : 'border-luxe-border hover:border-gold-500/40'}`}>
                          <div className="text-white font-medium text-sm">{opt.label}</div>
                          <div className="text-gold-500 font-bold">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handlePayment} disabled={processing}
                    className="btn-gold w-full py-5 text-base disabled:opacity-50">
                    {processing ? <><Spinner size="sm" /> Processing...</> : (
                      <>Pay with Razorpay <span className="opacity-60 text-xs ml-2">🔒 Secure</span></>
                    )}
                  </button>
                </div>
              )}

              {/* Navigation buttons */}
              {step < 3 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-luxe-border">
                  <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
                    className="btn-ghost text-sm">
                    ← {step === 0 ? 'Back' : 'Previous'}
                  </button>
                  <button
                    onClick={step === 2 ? handleSubmit : () => {
                      if (step === 1 && !form.eventDate) { toast.error('Please select an event date'); return; }
                      setStep(step + 1);
                    }}
                    disabled={submitting}
                    className="btn-gold disabled:opacity-50">
                    {submitting ? <><Spinner size="sm" /> Submitting...</> : step === 2 ? 'Confirm Booking →' : 'Continue →'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
