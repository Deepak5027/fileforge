import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  Zap, Menu, X, ChevronDown, LayoutDashboard,
  History, LogOut, Settings, Crown, FileCode2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const navLinks = [
    { to: '/convert', label: 'Convert' },
    { to: '/pricing', label: 'Pricing' },
    ...(user ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/history', label: 'History' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-forge-bg/95 backdrop-blur-md border-b border-forge-border/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:bg-brand-400 transition-colors">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                File<span className="text-brand-400">Forge</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-white bg-forge-border'
                      : 'text-forge-muted hover:text-white hover:bg-forge-border/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-forge-border bg-forge-card hover:bg-forge-border transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-brand-400">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-body text-white">{user.name?.split(' ')[0]}</span>
                    {user.plan === 'premium' && (
                      <Crown size={12} className="text-amber-400" />
                    )}
                    <ChevronDown size={14} className="text-forge-muted" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 card shadow-2xl shadow-black/50 py-1 animate-fade-in">
                      <div className="px-4 py-3 border-b border-forge-border">
                        <p className="text-sm font-body font-medium text-white">{user.name}</p>
                        <p className="text-xs text-forge-muted mt-0.5">{user.email}</p>
                        <div className="mt-2">
                          {user.plan === 'premium'
                            ? <span className="badge-premium"><Crown size={10} className="mr-1" />Premium</span>
                            : <span className="badge-free">{user.conversionsUsed || 0}/5 free</span>
                          }
                        </div>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-forge-muted hover:text-white hover:bg-forge-border/50 transition-colors">
                        <LayoutDashboard size={14} />Dashboard
                      </Link>
                      <Link to="/history" className="flex items-center gap-2 px-4 py-2.5 text-sm text-forge-muted hover:text-white hover:bg-forge-border/50 transition-colors">
                        <History size={14} />History
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-forge-muted hover:text-white hover:bg-forge-border/50 transition-colors">
                          <Settings size={14} />Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={14} />Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-5">
                    Get started free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-forge-muted hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-forge-border bg-forge-card/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 rounded-xl text-sm font-body text-forge-muted hover:text-white hover:bg-forge-border transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Sign out
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 justify-center text-sm py-2">Sign in</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center text-sm py-2">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-forge-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">FileForge</span>
              <span className="text-forge-muted text-sm font-body ml-2">— Convert anything, instantly.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-forge-muted font-body">
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/convert" className="hover:text-white transition-colors">Convert</Link>
              <span>© 2025 FileForge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
