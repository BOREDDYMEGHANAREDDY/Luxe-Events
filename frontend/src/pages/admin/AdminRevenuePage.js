import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminAPI } from '../../utils/api';
import { Spinner } from '../../components/common/index';

const GOLD = '#B8960C';
const PIE_COLORS = ['#B8960C', '#f0c93a', '#6B7280', '#374151', '#9CA3AF', '#D1D5DB'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-luxe-dark border border-luxe-border px-4 py-3 text-xs shadow-luxury rounded-sm">
      {label && <p className="text-luxe-muted mb-2 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.name?.toLowerCase().includes('revenue') || p.name?.toLowerCase().includes('amount')
            ? `₹${Number(p.value).toLocaleString('en-IN')}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminRevenuePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [year,    setYear]    = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    adminAPI.getRevenue({ year })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  // Build full 12-month revenue array
  const monthlyChart = MONTHS.map((m, i) => {
    const found = (data?.daily || []).filter(d => d._id?.month === i + 1);
    const revenue  = found.reduce((s, d) => s + d.revenue, 0);
    const bookings = found.reduce((s, d) => s + d.count, 0);
    return { month: m, revenue, bookings };
  });

  const totalRevenue   = monthlyChart.reduce((s, m) => s + m.revenue, 0);
  const totalBookings  = monthlyChart.reduce((s, m) => s + m.bookings, 0);
  const avgPerBooking  = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const bestMonth      = monthlyChart.reduce((best, m) => m.revenue > best.revenue ? m : best, { revenue: 0, month: '—' });

  // Category breakdown
  const categoryChart = (data?.byCategory || []).map((c, i) => ({
    name: (c._id || 'other').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: c.revenue,
    count: c.count,
  }));

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      <Helmet><title>Revenue — Admin</title></Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-white font-display text-2xl">Revenue Analytics</h1>
            <p className="text-luxe-muted text-sm">Financial performance overview</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="luxe-input text-xs w-28 py-2">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => {
                const csv = [
                  ['Month', 'Revenue (INR)', 'Bookings'],
                  ...monthlyChart.map(m => [m.month, m.revenue, m.bookings])
                ].map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = `luxe-revenue-${year}.csv`; a.click();
              }}
              className="btn-outline-gold text-xs py-2 px-4 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue',     value: `₹${totalRevenue.toLocaleString('en-IN')}`,     sub: `FY ${year}` },
                { label: 'Total Bookings',    value: totalBookings,                                    sub: 'paid bookings' },
                { label: 'Avg. Per Booking',  value: `₹${avgPerBooking.toLocaleString('en-IN')}`,     sub: 'average order value' },
                { label: 'Best Month',        value: bestMonth.month,                                  sub: `₹${bestMonth.revenue.toLocaleString('en-IN')}` },
              ].map((k, i) => (
                <div key={k.label} className="glass-card-dark border border-luxe-border p-5">
                  <p className="text-luxe-muted text-[10px] uppercase tracking-widest mb-2">{k.label}</p>
                  <p className="text-gold-500 font-display font-bold text-2xl mb-0.5">{k.value}</p>
                  <p className="text-luxe-muted text-xs">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Monthly revenue area chart */}
            <div className="glass-card-dark border border-luxe-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-sm">Monthly Revenue — {year}</h3>
                <div className="flex items-center gap-2 text-xs text-luxe-muted">
                  <span className="w-3 h-0.5 bg-gold-500 inline-block" /> Revenue
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyChart} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GOLD} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2.5} fill="url(#revGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom row: bar chart + pie */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Monthly bookings bar */}
              <div className="lg:col-span-3 glass-card-dark border border-luxe-border p-6">
                <h3 className="text-white font-semibold text-sm mb-6">Monthly Bookings — {year}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bookings" name="Bookings" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category pie */}
              <div className="lg:col-span-2 glass-card-dark border border-luxe-border p-6">
                <h3 className="text-white font-semibold text-sm mb-6">Revenue by Category</h3>
                {categoryChart.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                          paddingAngle={3} dataKey="value">
                          {categoryChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {categoryChart.map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-white/70 truncate">{c.name}</span>
                          </div>
                          <span className="text-gold-500 font-semibold ml-2">₹{c.value.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-40 text-luxe-muted text-sm">No data for {year}</div>
                )}
              </div>
            </div>

            {/* Monthly table */}
            <div className="glass-card-dark border border-luxe-border p-6">
              <h3 className="text-white font-semibold text-sm mb-5">Monthly Breakdown — {year}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-luxe-border">
                      {['Month', 'Revenue', 'Bookings', 'Avg. Value', 'Share'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-luxe-muted px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyChart.map((m) => {
                      const share = totalRevenue > 0 ? ((m.revenue / totalRevenue) * 100).toFixed(1) : 0;
                      const avg   = m.bookings > 0 ? Math.round(m.revenue / m.bookings) : 0;
                      return (
                        <tr key={m.month} className="border-b border-luxe-border/40 hover:bg-white/2 transition-colors">
                          <td className="px-3 py-3 text-white font-medium">{m.month}</td>
                          <td className="px-3 py-3 text-gold-500 font-semibold">
                            {m.revenue > 0 ? `₹${m.revenue.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="px-3 py-3 text-white/70">{m.bookings || '—'}</td>
                          <td className="px-3 py-3 text-white/50">{avg > 0 ? `₹${avg.toLocaleString('en-IN')}` : '—'}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-luxe-border rounded-full overflow-hidden max-w-[80px]">
                                <div className="h-full bg-gold-gradient rounded-full"
                                  style={{ width: `${share}%` }} />
                              </div>
                              <span className="text-luxe-muted text-[10px] w-8">{share}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gold-500/20">
                      <td className="px-3 py-3 text-white font-bold">TOTAL</td>
                      <td className="px-3 py-3 text-gold-500 font-bold">₹{totalRevenue.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 text-white font-bold">{totalBookings}</td>
                      <td className="px-3 py-3 text-white/70">₹{avgPerBooking.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 text-luxe-muted">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
