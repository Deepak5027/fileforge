import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Users, Zap, DollarSign, TrendingUp, Shield,
  ShieldOff, Search, Crown, CheckCircle, XCircle
} from 'lucide-react'

export default function Admin() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'users') {
        const res = await api.get('/admin/users')
        setUsers(res.data.users || [])
      } else if (tab === 'payments') {
        const res = await api.get('/admin/payments')
        setPayments(res.data.payments || [])
      } else if (tab === 'overview') {
        const res = await api.get('/admin/stats')
        setStats(res.data)
      }
    } catch {}
    setLoading(false)
  }

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { blocked: !isBlocked })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u))
      toast.success(isBlocked ? 'User unblocked' : 'User blocked')
    } catch {
      toast.error('Action failed')
    }
  }

  const TABS = ['overview', 'users', 'payments']

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-forge-muted font-body mt-1">Manage users, payments, and system health</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-forge-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-body font-medium capitalize border-b-2 transition-colors -mb-px ${
                tab === t
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-forge-muted hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card h-28 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total users', value: stats?.totalUsers || 0, icon: Users },
                  { label: 'Premium users', value: stats?.premiumUsers || 0, icon: Crown },
                  { label: 'Total conversions', value: stats?.totalConversions || 0, icon: Zap },
                  { label: 'Revenue (₹)', value: `₹${stats?.totalRevenue || 0}`, icon: DollarSign },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="card p-6">
                    <Icon size={16} className="text-brand-400 mb-3" />
                    <p className="font-display text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-forge-muted font-body mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forge-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-forge-border text-xs font-mono text-forge-muted uppercase tracking-wider">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Plan</div>
                <div className="col-span-2">Conversions</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-2">Actions</div>
              </div>

              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-forge-border rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-forge-border">
                  {filteredUsers.map(u => (
                    <div key={u._id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center gap-2">
                      <div className="md:col-span-4">
                        <p className="text-sm font-body font-medium text-white">{u.name}</p>
                        <p className="text-xs text-forge-muted">{u.email}</p>
                      </div>
                      <div className="md:col-span-2">
                        {u.plan === 'premium'
                          ? <span className="badge-premium text-xs"><Crown size={10} className="mr-1" />Premium</span>
                          : <span className="badge-free text-xs">Free</span>
                        }
                      </div>
                      <div className="md:col-span-2 text-sm font-mono text-forge-muted">
                        {u.conversionsUsed || 0}
                      </div>
                      <div className="md:col-span-2 text-sm text-forge-muted font-body">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="md:col-span-2">
                        <button
                          onClick={() => toggleBlock(u._id, u.isBlocked)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.isBlocked
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isBlocked ? <><Shield size={12} />Unblock</> : <><ShieldOff size={12} />Block</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments tab */}
        {tab === 'payments' && (
          <div className="card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-forge-border text-xs font-mono text-forge-muted uppercase tracking-wider">
              <div className="col-span-3">User</div>
              <div className="col-span-2">Provider</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Date</div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-forge-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="py-16 text-center text-forge-muted font-body">No payments yet</div>
            ) : (
              <div className="divide-y divide-forge-border">
                {payments.map(p => (
                  <div key={p._id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center gap-2">
                    <div className="md:col-span-3 text-sm font-body text-white">{p.userId?.email || 'Unknown'}</div>
                    <div className="md:col-span-2">
                      <span className="text-xs font-mono bg-forge-border px-2 py-1 rounded capitalize">
                        {p.provider}
                      </span>
                    </div>
                    <div className="md:col-span-2 text-sm font-mono text-white">
                      {p.currency === 'INR' ? '₹' : '$'}{p.amount / 100}
                    </div>
                    <div className="md:col-span-2">
                      {p.status === 'paid'
                        ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={12} />Paid</span>
                        : <span className="flex items-center gap-1 text-xs text-rose-400"><XCircle size={12} />Failed</span>
                      }
                    </div>
                    <div className="md:col-span-3 text-sm text-forge-muted font-body">
                      {new Date(p.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
