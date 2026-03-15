import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { searchFormats, FORMAT_CATEGORIES, getColorClass } from '../utils/formatMap'
import {
  ArrowRight, Search, Zap, Shield, Clock, Globe,
  FileText, Image, Music, Video, Database, BookOpen,
  ChevronRight, Star, Users, TrendingUp
} from 'lucide-react'

const POPULAR_CONVERSIONS = [
  { from: 'PDF', to: 'DOCX', cat: 'document', color: 'blue' },
  { from: 'JPG', to: 'PNG', cat: 'image', color: 'purple' },
  { from: 'MP4', to: 'MP3', cat: 'video', color: 'rose' },
  { from: 'CSV', to: 'JSON', cat: 'data', color: 'emerald' },
  { from: 'DOCX', to: 'PDF', cat: 'document', color: 'blue' },
  { from: 'PNG', to: 'WEBP', cat: 'image', color: 'purple' },
  { from: 'JSON', to: 'XML', cat: 'data', color: 'emerald' },
  { from: 'EPUB', to: 'PDF', cat: 'document', color: 'blue' },
]

const STATS = [
  { value: '50+', label: 'File Formats', icon: FileText },
  { value: '99.9%', label: 'Uptime', icon: TrendingUp },
  { value: '10k+', label: 'Conversions', icon: Zap },
  { value: '100%', label: 'Secure', icon: Shield },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Conversions complete in seconds using optimised LibreOffice, FFmpeg, and ImageMagick pipelines.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'Files are auto-deleted 1 hour after conversion. Zero permanent storage. ClamAV virus scanning on every upload.'
  },
  {
    icon: Globe,
    title: 'Universal Support',
    desc: 'Documents, images, audio, video, data files — 50+ formats across 5 categories, with more added regularly.'
  },
  {
    icon: Clock,
    title: 'Conversion History',
    desc: 'Every conversion saved to your dashboard. Re-download within the expiry window at any time.'
  },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleSearch = (val) => {
    setQuery(val)
    setSearchResults(val.length >= 2 ? searchFormats(val) : [])
  }

  const handleConvert = (from, to) => {
    navigate(`/convert?from=${from}&to=${to}`)
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-mono mb-8 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Free tier — 5 conversions, no card required
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Convert
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400"> any file </span>
            <br className="hidden md:block" />
            to any format
          </h1>

          <p className="text-xl text-forge-muted font-body max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Documents, images, audio, video, data — 50+ formats supported.
            Fast, secure, and free to start.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-forge-muted" />
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search: pdf to word, jpg to png, mp4 to mp3..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-forge-card border border-forge-border text-white placeholder-forge-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-body text-base transition-all"
              />
            </div>

            {/* Search dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full card shadow-2xl shadow-black/50 py-2 z-10 animate-fade-in">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleConvert(r.from, r.to)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-forge-border/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono border ${getColorClass(r.color)}`}>{r.from.toUpperCase()}</span>
                      <ArrowRight size={14} className="text-forge-muted" />
                      <span className={`px-2 py-1 rounded text-xs font-mono border ${getColorClass(r.color)}`}>{r.to.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-forge-muted">{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to={user ? '/convert' : '/register'} className="btn-primary text-base px-8 py-3.5">
              Start converting free <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="btn-secondary text-base py-3.5">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-forge-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="text-brand-400 mx-auto mb-3" />
                <div className="font-display text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-forge-muted font-body mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular conversions */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">Popular conversions</h2>
            <p className="section-subtitle">Click any pair to start converting instantly</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POPULAR_CONVERSIONS.map((pair, i) => (
              <Link
                key={i}
                to={`/convert?from=${pair.from.toLowerCase()}&to=${pair.to.toLowerCase()}`}
                className="card p-5 format-pill flex items-center justify-between group hover:border-brand-500/40 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border ${getColorClass(pair.color)}`}>
                    {pair.from}
                  </span>
                  <ArrowRight size={14} className="text-forge-muted group-hover:text-brand-400 transition-colors" />
                  <span className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border ${getColorClass(pair.color)}`}>
                    {pair.to}
                  </span>
                </div>
                <ChevronRight size={14} className="text-forge-muted group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-forge-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">Every format category</h2>
            <p className="section-subtitle">Powered by LibreOffice, FFmpeg, ImageMagick, and Pandoc</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(FORMAT_CATEGORIES).map(([key, cat]) => (
              <div key={key} className="card p-6 text-center hover:border-brand-500/30 transition-all group">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-display font-semibold text-white mb-2">{cat.label}</h3>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {cat.formats.slice(0, 5).map(f => (
                    <span key={f} className="text-xs font-mono text-forge-muted bg-forge-border px-2 py-0.5 rounded">
                      {f.toUpperCase()}
                    </span>
                  ))}
                  {cat.formats.length > 5 && (
                    <span className="text-xs font-mono text-forge-muted">+{cat.formats.length - 5}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Three steps to convert any file</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-brand-500/20 via-brand-500/50 to-brand-500/20" />
            {[
              { step: '01', title: 'Upload your file', desc: 'Drag & drop or click to upload. Supports files up to 50MB with automatic virus scanning.' },
              { step: '02', title: 'Choose format', desc: 'Select your target format from the dropdown or search. We auto-detect the best conversion engine.' },
              { step: '03', title: 'Download instantly', desc: 'Your converted file is ready in seconds. Download it fresh — files are deleted after 1 hour.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="card p-8 h-full">
                  <div className="font-mono text-4xl font-bold text-brand-500/30 mb-4">{step}</div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">{title}</h3>
                  <p className="text-forge-muted font-body text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-forge-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">Built for reliability</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:border-brand-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-forge-muted font-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/5 rounded-3xl blur-3xl" />
            <div className="relative card p-12 border-brand-500/20">
              <h2 className="section-title mb-4">Start converting for free</h2>
              <p className="section-subtitle mb-8">5 free conversions, no credit card. Upgrade to Premium for just ₹90/month.</p>
              <div className="flex items-center justify-center gap-4">
                <Link to={user ? '/convert' : '/register'} className="btn-primary text-base px-8 py-3.5">
                  {user ? 'Convert a file' : 'Create free account'} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
