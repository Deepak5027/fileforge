import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Check, Zap, Crown, ArrowRight, Shield, RefreshCw } from 'lucide-react'

const FREE_FEATURES = [
  '5 conversions per account',
  '50+ file formats',
  'Files deleted after 1 hour',
  'Conversion history',
  'Virus scanning',
]

const PREMIUM_FEATURES = [
  'Unlimited conversions',
  '50+ file formats',
  'Files deleted after 1 hour',
  'Full conversion history',
  'Virus scanning',
  'Priority processing',
  'Premium support',
]

const FAQ = [
  {
    q: 'What happens to my files?',
    a: 'All uploaded and converted files are automatically deleted from our servers within 1 hour. We never permanently store your files.'
  },
  {
    q: 'How does the free tier work?',
    a: 'Every new account gets 5 free conversions. No credit card required. After 5, you can upgrade to Premium for unlimited conversions.'
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, cancel anytime. Your premium access continues until the end of the billing period.'
  },
  {
    q: 'Which payment methods are accepted?',
    a: 'We accept UPI, cards, netbanking via Razorpay for India, and all major cards internationally via Stripe.'
  },
]

export default function Pricing() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [currency, setCurrency] = useState('INR')
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/register')
      return
    }
    if (user.plan === 'premium') {
      toast.success('You already have Premium!')
      return
    }

    setLoading(true)
    try {
      if (currency === 'INR') {
        // Razorpay
        const res = await api.post('/payment/razorpay/create-order')
        const { orderId, amount, key } = res.data

        const options = {
          key,
          amount,
          currency: 'INR',
          name: 'FileForge',
          description: 'Premium Monthly Subscription',
          order_id: orderId,
          handler: async (response) => {
            try {
              await api.post('/payment/razorpay/verify', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              })
              toast.success('Payment successful! Welcome to Premium.')
              navigate('/dashboard')
            } catch {
              toast.error('Payment verification failed')
            }
          },
          prefill: { email: user.email, name: user.name },
          theme: { color: '#4361ff' },
        }

        if (typeof window.Razorpay === 'undefined') {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => new window.Razorpay(options).open()
          document.body.appendChild(script)
        } else {
          new window.Razorpay(options).open()
        }
      } else {
        // Stripe
        const res = await api.post('/payment/stripe/create-session')
        window.location.href = res.data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="font-display text-5xl font-bold text-white mb-4">Simple pricing</h1>
          <p className="text-forge-muted font-body text-xl">Start free. Upgrade when you need more.</p>

          {/* Currency toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-sm font-body text-forge-muted">Currency:</span>
            <div className="flex rounded-xl border border-forge-border overflow-hidden">
              {['INR', 'USD'].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-5 py-2 text-sm font-mono transition-colors ${
                    currency === c ? 'bg-brand-500 text-white' : 'text-forge-muted hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {/* Free */}
          <div className="card p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white mb-1">Free</h2>
              <p className="text-forge-muted font-body text-sm">Get started, no card needed</p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-extrabold text-white">₹0</span>
              <span className="text-forge-muted font-body ml-2">forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-body text-forge-muted">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user ? (
              user.plan === 'free' ? (
                <div className="w-full text-center py-3 rounded-xl border border-forge-border text-sm font-body text-forge-muted">
                  Current plan
                </div>
              ) : (
                <div className="w-full text-center py-3 rounded-xl border border-forge-border text-sm font-body text-forge-muted">
                  Downgrade available on cancel
                </div>
              )
            ) : (
              <button onClick={() => navigate('/register')} className="btn-secondary w-full justify-center">
                Start free
              </button>
            )}
          </div>

          {/* Premium */}
          <div className="relative card p-8 border-brand-500/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full text-xs font-mono bg-brand-500 text-white">MOST POPULAR</span>
            </div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white mb-1 flex items-center gap-2">
                Premium <Crown size={18} className="text-amber-400" />
              </h2>
              <p className="text-forge-muted font-body text-sm">Unlimited everything</p>
            </div>
            <div className="mb-8">
              <span className="font-display text-5xl font-extrabold text-white">
                {currency === 'INR' ? '₹90' : '$1'}
              </span>
              <span className="text-forge-muted font-body ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-body text-white">
                  <Check size={14} className="text-brand-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user?.plan === 'premium' ? (
              <div className="w-full text-center py-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-sm font-body text-brand-400">
                <Crown size={14} className="inline mr-2" />Current plan
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Upgrade now <ArrowRight size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16">
          {[
            { icon: Shield, text: 'Secure payments via Razorpay & Stripe' },
            { icon: RefreshCw, text: 'Cancel anytime, no questions asked' },
            { icon: Zap, text: 'Instant activation after payment' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-forge-muted font-body">
              <Icon size={14} className="text-brand-400" />
              {text}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-white text-center mb-8">Frequently asked</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-body font-medium text-white text-sm">{item.q}</span>
                  <span className={`text-forge-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-forge-border">
                    <p className="text-sm text-forge-muted font-body leading-relaxed pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
