import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../utils/api';
import { StatCard, Spinner } from '../../components/common/index';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GOLD = '#B8960C'; const GOLD2 = '#f0c93a'; const DARK = '#1a1a1a';

const PIE_COLORS = ['#B8960C','#f0c93a','#6B7280','#374151','#9CA3AF','#D1D5DB'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-luxe-dark border border-luxe-border px-3 py-2 text-xs shadow-luxury">
      <p className="text-luxe-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!data)   return <p className="text-red-400 text-sm">Failed to load dashboard data.</p>;

  const { stats, charts } = data;

  // Build 12-month array
  const monthlyChart = MONTHS.map((m, i) => {
    const found = charts.monthlyData?.find(d => d._id?.month === i + 1);
    return { month: m, revenue: found?.revenue || 0, bookings: found?.count || 0 };
  });

  // Booking status pie
  const statusPie = (charts.bookingStatus || []).map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  }));

  return (
    <>
      <Helmet><title>Admin Dashboard — Luxe Events</title></Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-display text-2xl">Dashboard</h1>
            <p className="text-luxe-muted text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] text-green-400 border border-green-500/20 px-3 py-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',    value: stats.totalUsers?.toLocaleString(),    change: null, icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
            { label: 'Total Bookings', value: stats.totalBookings?.toLocaleString(), change: null, icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { label: 'Total Revenue',  value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, change: null, icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Pending',        value: stats.pendingBookings?.toLocaleString(), change: null, icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'This Month Revenue', value: `₹${(stats.monthlyRevenue || 0).toLocaleString('en-IN')}` },
            { label: 'New Users (Month)',   value: stats.newUsersThisMonth },
            { label: 'Active Events',       value: stats.totalEvents },
            { label: 'Unread Inquiries',    value: stats.newContacts },
          ].map((s, i) => (
            <div key={s.label} className="glass-card-dark border border-luxe-border p-4">
              <p className="text-luxe-muted text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-gold-500 font-display font-bold text-xl">{s.value ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue area chart */}
          <div className="lg:col-span-2 glass-card-dark border border-luxe-border p-6">
            <h3 className="text-white font-semibold text-sm mb-6">Monthly Revenue ({new Date().getFullYear()})</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GOLD}  stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD}  stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Booking status pie */}
          <div className="glass-card-dark border border-luxe-border p-6">
            <h3 className="text-white font-semibold text-sm mb-6">Booking Status</h3>
            {statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} formatter={(v) => <span style={{ color: '#888', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-luxe-muted text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Bookings bar chart */}
        <div className="glass-card-dark border border-luxe-border p-6">
          <h3 className="text-white font-semibold text-sm mb-6">Monthly Bookings ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="Bookings" fill={GOLD} radius={[2,2,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top events */}
        {charts.topEvents?.length > 0 && (
          <div className="glass-card-dark border border-luxe-border p-6">
            <h3 className="text-white font-semibold text-sm mb-5">Top Events by Bookings</h3>
            <div className="space-y-3">
              {charts.topEvents.map((e, i) => (
                <div key={e._id} className="flex items-center gap-4">
                  <span className="text-luxe-muted text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{e.event?.title}</span>
                      <span className="text-gold-500 text-sm font-bold">{e.count}</span>
                    </div>
                    <div className="h-1 bg-luxe-border rounded-full overflow-hidden">
                      <div className="h-full bg-gold-gradient rounded-full"
                        style={{ width: `${Math.min((e.count / (charts.topEvents[0]?.count || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-luxe-muted capitalize flex-shrink-0">{e.event?.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
