import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useForm } from 'react-hook-form'
import { Zap, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerUser(data.name, data.email, data.password)
      toast.success('Account created! Welcome to FileForge.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const PERKS = [
    '5 free conversions, no card required',
    '50+ file formats supported',
    'Files auto-deleted after 1 hour',
    'Upgrade anytime for ₹90/month',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 py-12">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side — perks */}
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">FileForge</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Convert files.<br />
            <span className="text-brand-400">Free forever.</span>
          </h2>
          <p className="text-forge-muted font-body mb-8 leading-relaxed">
            Join thousands of users converting documents, images, and media files with the most reliable tool online.
          </p>
          <ul className="space-y-4">
            {PERKS.map(perk => (
              <li key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-brand-400" />
                </div>
                <span className="text-sm font-body text-white">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side — form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">FileForge</span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-forge-muted font-body text-sm mb-6">Start with 5 free conversions</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  className="input-field"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-rose-400 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input-field"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password required',
                      minLength: { value: 8, message: 'Min 8 characters' }
                    })}
                    className="input-field pr-12"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-forge-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create free account <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="glow-line" />
            </div>

            <p className="text-center text-sm text-forge-muted font-body">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
