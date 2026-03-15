import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { ArrowRight, Download, CheckCircle, XCircle, Clock, Loader2, Search, Filter } from 'lucide-react'

const STATUS_CONFIG = {
  done: { icon: CheckCircle, color: 'text-emerald-400', label: 'Done' },
  failed: { icon: XCircle, color: 'text-rose-400', label: 'Failed' },
  processing: { icon: Loader2, color: 'text-brand-400', label: 'Processing', spin: true },
  pending: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
}

export default function History() {
  const [conversions, setConversions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 20

  useEffect(() => {
    fetchHistory()
  }, [page, filter])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get('/user/history', {
        params: { page, limit: PER_PAGE, status: filter !== 'all' ? filter : undefined }
      })
      setConversions(res.data.conversions || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const filtered = conversions.filter(c =>
    c.originalFileName?.toLowerCase().includes(search.toLowerCase()) ||
    c.originalFormat?.includes(search.toLowerCase()) ||
    c.targetFormat?.includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Conversion history</h1>
            <p className="text-forge-muted font-body mt-1">{total} total conversions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forge-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by filename or format..."
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1) }}
              className="input-field pr-10 appearance-none w-40"
            >
              <option value="all">All status</option>
              <option value="done">Done</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-forge-border text-xs font-mono text-forge-muted uppercase tracking-wider">
            <div className="col-span-5">File</div>
            <div className="col-span-2">Conversion</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Action</div>
          </div>

          {loading ? (
            <div className="divide-y divide-forge-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4">
                  <div className="flex-1 h-4 bg-forge-border rounded animate-pulse" />
                  <div className="w-24 h-4 bg-forge-border rounded animate-pulse" />
                  <div className="w-16 h-4 bg-forge-border rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Clock size={32} className="text-forge-muted mx-auto mb-3" />
              <p className="text-forge-muted font-body">No conversions found</p>
            </div>
          ) : (
            <div className="divide-y divide-forge-border">
              {filtered.map(conv => {
                const S = STATUS_CONFIG[conv.status] || STATUS_CONFIG.pending
                const Icon = S.icon
                return (
                  <div key={conv._id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center gap-2 hover:bg-forge-border/20 transition-colors">
                    <div className="md:col-span-5 flex items-center gap-3">
                      <Icon size={14} className={`${S.color} flex-shrink-0 ${S.spin ? 'animate-spin' : ''}`} />
                      <span className="text-sm font-body text-white truncate max-w-xs" title={conv.originalFileName}>
                        {conv.originalFileName}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <span className="text-xs font-mono bg-forge-border px-2 py-0.5 rounded text-forge-muted">
                        {conv.originalFormat?.toUpperCase()}
                      </span>
                      <ArrowRight size={10} className="text-forge-muted" />
                      <span className="text-xs font-mono bg-forge-border px-2 py-0.5 rounded text-forge-muted">
                        {conv.targetFormat?.toUpperCase()}
                      </span>
                    </div>
                    <div className="md:col-span-2 text-sm text-forge-muted font-body">
                      {conv.fileSize ? `${(conv.fileSize / 1024).toFixed(0)} KB` : '—'}
                    </div>
                    <div className="md:col-span-2 text-sm text-forge-muted font-body">
                      {new Date(conv.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <div className="md:col-span-1">
                      {conv.status === 'done' && conv.downloadUrl ? (
                        <a
                          href={conv.downloadUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                        >
                          <Download size={12} />
                          <span className="hidden md:inline">Get</span>
                        </a>
                      ) : (
                        <span className={`text-xs font-mono ${S.color}`}>{S.label}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-forge-muted font-body">
              Page {page} of {Math.ceil(total / PER_PAGE)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / PER_PAGE)}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
