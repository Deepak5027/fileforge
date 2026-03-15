import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import {
  Zap, Crown, ArrowRight, TrendingUp, FileText,
  Clock, CheckCircle, XCircle, Download, Loader2
} from 'lucide-react'

const STATUS_ICON = {
  done: <CheckCircle size={14} className="text-emerald-400" />,
  failed: <XCircle size={14} className="text-rose-400" />,
  processing: <Loader2 size={14} className="text-brand-400 animate-spin" />,
  pending: <Clock size={14} className="text-amber-400" />,
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, histRes] = await Promise.all([
          api.get('/user/dashboard'),
          api.get('/user/history?limit=5'),
        ])
        setStats(dashRes.data)
        setRecent(histRes.data.conversions || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const freeUsed = user?.conversionsUsed || 0
  const isPremium = user?.plan === 'premium'
  const pct = isPremium ? 100 : Math.min(100, (freeUsed / 5) * 100)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-forge-muted font-body mt-1">Here's your conversion overview</p>
          </div>
          <Link to="/convert" className="btn-primary">
            <Zap size={16} />New conversion
          </Link>
        </div>

        {/* Plan card */}
        <div className={`card p-6 mb-8 ${isPremium ? 'border-brand-500/30' : 'border-forge-border'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {isPremium ? (
                  <span className="badge-premium"><Crown size={12} className="mr-1" />Premium Plan</span>
                ) : (
                  <span className="badge-free">Free Plan</span>
                )}
              </div>

              {isPremium ? (
                <div>
                  <p className="font-display text-2xl font-bold text-white">Unlimited conversions</p>
                  <p className="text-forge-muted font-body text-sm mt-1">
                    Active subscription — renews monthly
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-display text-4xl font-bold text-white">{freeUsed}</span>
                    <span className="text-forge-muted font-body text-xl">/ 5</span>
                    <span className="text-forge-muted font-body text-sm">conversions used</span>
                  </div>
                  <div className="w-full max-w-xs h-2 bg-forge-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-rose-500' : 'bg-brand-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!isPremium && (
              <div className="text-right ml-6">
                <p className="text-sm text-forge-muted font-body mb-2">Upgrade to Premium</p>
                <div className="mb-3">
                  <span className="font-display text-2xl font-bold text-white">₹90</span>
                  <span className="text-forge-muted text-sm">/month</span>
                </div>
                <Link to="/pricing" className="btn-primary text-sm py-2">
                  Upgrade <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 h-24 animate-pulse">
                <div className="h-4 bg-forge-border rounded w-1/2 mb-3" />
                <div className="h-6 bg-forge-border rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total conversions', value: stats?.totalConversions || 0, icon: Zap },
              { label: 'This month', value: stats?.thisMonth || 0, icon: TrendingUp },
              { label: 'Completed', value: stats?.completed || 0, icon: CheckCircle },
              { label: 'Failed', value: stats?.failed || 0, icon: XCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-forge-muted" />
                  <span className="text-xs text-forge-muted font-body">{label}</span>
                </div>
                <p className="font-display text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent conversions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-forge-border">
            <h2 className="font-display font-semibold text-white">Recent conversions</h2>
            <Link to="/history" className="text-sm text-brand-400 hover:text-brand-300 font-body font-medium">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-forge-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="text-forge-muted mx-auto mb-3" />
              <p className="text-forge-muted font-body">No conversions yet</p>
              <Link to="/convert" className="mt-3 inline-flex text-sm text-brand-400 hover:text-brand-300">
                Convert your first file →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-forge-border">
              {recent.map(conv => (
                <div key={conv._id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    {STATUS_ICON[conv.status]}
                    <div>
                      <p className="text-sm font-body font-medium text-white truncate max-w-xs">
                        {conv.originalFileName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-forge-muted">{conv.originalFormat.toUpperCase()}</span>
                        <ArrowRight size={10} className="text-forge-muted" />
                        <span className="text-xs font-mono text-forge-muted">{conv.targetFormat.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-forge-muted font-body">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </span>
                    {conv.status === 'done' && conv.downloadUrl && (
                      <a href={conv.downloadUrl} download className="btn-ghost text-xs py-1 px-2">
                        <Download size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
