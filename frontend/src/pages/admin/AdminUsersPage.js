import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../utils/api';
import { StatusBadge, Spinner, Pagination, EmptyState } from '../../components/common/index';
import { useDebounce } from '../../hooks/index';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [toggling, setToggling] = useState(null);

  const dSearch = useDebounce(search, 400);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 20, search: dSearch, role })
      .then(r => { setUsers(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, dSearch, role]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (user) => {
    setToggling(user._id);
    try {
      const res = await adminAPI.toggleUserStatus(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: res.data.data.isActive } : u));
      toast.success(`User ${res.data.data.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err.message); }
    finally { setToggling(null); }
  };

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-white font-display text-2xl">Users</h1>
            <p className="text-luxe-muted text-sm">{total} registered users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {[{value:'',label:'All'},{value:'user',label:'Users'},{value:'admin',label:'Admins'}].map(r => (
            <button key={r.value} onClick={() => { setRole(r.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-all rounded-sm ${role === r.value ? 'bg-gold-500 border-gold-500 text-black' : 'border-luxe-border text-luxe-muted hover:border-gold-500/50 hover:text-gold-500'}`}>
              {r.label}
            </button>
          ))}
          <input type="text" placeholder="Search name or email..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="luxe-input text-xs w-52 ml-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="👤" title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full luxe-table min-w-[700px]">
              <thead>
                <tr>
                  <th>User</th><th>Phone</th><th>Role</th><th>Email Verified</th>
                  <th>Joined</th><th>Last Login</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xs font-bold flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{u.firstName} {u.lastName}</p>
                          <p className="text-luxe-muted text-[10px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-luxe-muted">{u.phone || '—'}</td>
                    <td>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 ${u.role === 'superadmin' ? 'text-purple-400 border-purple-400/20' : u.role === 'admin' ? 'text-gold-400 border-gold-400/20' : 'text-luxe-muted border-luxe-border'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.isEmailVerified
                        ? <span className="text-green-400 text-xs">✓ Verified</span>
                        : <span className="text-yellow-400 text-xs">⚠ Pending</span>}
                    </td>
                    <td className="text-xs text-luxe-muted whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="text-xs text-luxe-muted whitespace-nowrap">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td>
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 ${u.isActive ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleToggle(u)} disabled={toggling === u._id || u.role === 'superadmin'}
                        className={`text-[10px] border px-3 py-1.5 transition-all disabled:opacity-30 ${u.isActive ? 'text-red-400 border-red-400/20 hover:border-red-400/40' : 'text-green-400 border-green-400/20 hover:border-green-400/40'}`}>
                        {toggling === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} limit={20} onPageChange={setPage} />
      </div>
    </>
  );
}
