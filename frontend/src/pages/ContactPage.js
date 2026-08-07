import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { contactAPI } from '../utils/api';
import { Input, Textarea, Select, Spinner } from '../components/common/index';
import toast from 'react-hot-toast';

const CONTACT_ITEMS = [
  { icon: '📞', label: 'Phone', value: '+91 9912794611', sub: 'Mon–Sat, 9 AM – 8 PM' },
  { icon: '✉️', label: 'Email', value: 'boreddymeghanareddy@gmail.com', sub: 'We reply within 24 hours' },
  { icon: '📍', label: 'Head Office', value: 'Bandra Kurla Complex, Mumbai', sub: 'Maharashtra 400 051' },
  { icon: '🏢', label: 'Branch Offices', value: 'Delhi · Bangalore · Jaipur', sub: 'PAN India operations' },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [form, setForm]       = useState({
    name: '', email: '', phone: '',
    subject: '', message: '',
    eventType: '', eventDate: '', guestCount: '', budget: '',
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await contactAPI.send(form);
      setSent(true);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Luxe Events</title>
        <meta name="description" content="Get in touch with Luxe Events. Plan your dream event with India's premier luxury event management company." />
      </Helmet>

      {/* Hero */}
      <div className="page-hero pt-20">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80"
            alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-luxe-black/60 via-luxe-black/80 to-luxe-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-eyebrow">Get In Touch</span>
            <h1 className="text-4xl md:text-6xl font-display font-semibold text-white mb-4">
              Let's Create <span className="text-gradient-gold">Something Extraordinary</span>
            </h1>
            <p className="text-luxe-muted text-lg max-w-2xl mx-auto">
              Our event specialists are ready to turn your vision into an unforgettable experience. Reach out today.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-luxe-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ─── Left: contact info ─── */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl text-white mb-2">Contact Information</h2>
                <p className="text-luxe-muted text-sm leading-relaxed">
                  Whether you're planning an intimate gathering or a grand celebration, we're here to help craft every detail.
                </p>
              </div>

              <div className="space-y-6">
                {CONTACT_ITEMS.map(({ icon, label, value, sub }) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-4 border border-luxe-border hover:border-gold-500/30 transition-all duration-300">
                    <div className="text-2xl flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-[10px] text-gold-500 font-semibold uppercase tracking-widest mb-0.5">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                      <p className="text-luxe-muted text-xs">{sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp */}
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%27d%20like%20to%20inquire%20about%20an%20event."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all duration-300 group">
                <svg className="w-8 h-8 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div>
                  <p className="text-green-400 font-semibold text-sm">Chat on WhatsApp</p>
                  <p className="text-luxe-muted text-xs">Typically replies in minutes</p>
                </div>
                <svg className="w-4 h-4 text-green-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              {/* Social links */}
              <div>
                <p className="text-luxe-muted text-xs uppercase tracking-widest mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { name: 'Instagram', href: '#', color: 'hover:text-pink-400' },
                    { name: 'Facebook', href: '#', color: 'hover:text-blue-400' },
                    { name: 'LinkedIn', href: '#', color: 'hover:text-blue-300' },
                    { name: 'YouTube', href: '#', color: 'hover:text-red-400' },
                  ].map((s) => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`text-luxe-muted ${s.color} text-xs font-medium tracking-wider uppercase transition-colors border border-luxe-border px-3 py-2 hover:border-current`}>
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Right: form ─── */}
            <div className="lg:col-span-3">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card-dark border border-green-500/30 p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 border-2 border-green-500 flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3">Message Received!</h3>
                  <p className="text-luxe-muted text-sm max-w-sm leading-relaxed mb-8">
                    Thank you for reaching out. One of our senior event specialists will contact you within 24 hours to discuss your requirements.
                  </p>
                  <button onClick={() => setSent(false)} className="btn-outline-gold text-xs py-2 px-6">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card-dark border border-luxe-border p-8 space-y-6">
                  <h2 className="font-display text-xl text-white mb-2">Send Us a Message</h2>
                  <p className="text-luxe-muted text-xs mb-6">Fields marked * are required</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Full Name *" value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Your full name" error={errors.name} />
                    <Input label="Email Address *" type="email" value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="your@email.com" error={errors.email} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Phone Number" value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+91 98765 43210" />
                    <Select label="Event Type" value={form.eventType}
                      onChange={(e) => update('eventType', e.target.value)}>
                      <option value="">— Select event type —</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday</option>
                      <option value="destination-wedding">Destination Wedding</option>
                      <option value="product-launch">Product Launch</option>
                      <option value="private-celebration">Private Celebration</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input label="Event Date" type="date" value={form.eventDate}
                      onChange={(e) => update('eventDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]} />
                    <Input label="Guest Count" type="number" value={form.guestCount}
                      onChange={(e) => update('guestCount', e.target.value)}
                      placeholder="e.g. 150" min={1} />
                    <Select label="Approximate Budget" value={form.budget}
                      onChange={(e) => update('budget', e.target.value)}>
                      <option value="">— Select budget —</option>
                      <option value="200000">Up to ₹2 Lakh</option>
                      <option value="500000">₹2–5 Lakh</option>
                      <option value="1000000">₹5–10 Lakh</option>
                      <option value="2500000">₹10–25 Lakh</option>
                      <option value="5000000">₹25–50 Lakh</option>
                      <option value="10000000">₹50 Lakh+</option>
                    </Select>
                  </div>

                  <Input label="Subject *" value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    placeholder="e.g. Royal Wedding — Dec 2025" error={errors.subject} />

                  <Textarea label="Message *" value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={5} placeholder="Tell us about your dream event — the more details, the better!"
                    error={errors.message} />

                  <button type="submit" disabled={loading} className="btn-gold w-full py-4 disabled:opacity-50">
                    {loading ? <><Spinner size="sm" /> Sending...</> : 'Send Message ✦'}
                  </button>

                  <p className="text-luxe-muted text-[11px] text-center">
                    By submitting, you agree to our Privacy Policy. We never share your information.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps embed */}
      <section className="bg-luxe-dark border-t border-luxe-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-white font-display text-xl mb-6">Find Us</h3>
          <div className="w-full h-72 border border-luxe-border overflow-hidden">
            <iframe
              title="Luxe Events Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0453086742747!2d72.86542131490156!3d19.065276887095044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8e5e1a8f8a5%3A0x9a5e7c5e1a8f8a5!2sBandra+Kurla+Complex%2C+Mumbai!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              className="w-full h-full grayscale opacity-80"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
