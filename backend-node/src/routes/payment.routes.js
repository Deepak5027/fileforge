const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { authMiddleware } = require('../middleware/auth.middleware')
const Payment = require('../models/Payment.model')
const User = require('../models/User.model')

// Lazy-load payment SDKs
let Razorpay, stripe

function getRazorpay() {
  if (!Razorpay) Razorpay = require('razorpay')
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

function getStripe() {
  if (!stripe) stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  return stripe
}

// POST /api/payment/razorpay/create-order
router.post('/razorpay/create-order', authMiddleware, async (req, res) => {
  try {
    const rzp = getRazorpay()
    const order = await rzp.orders.create({
      amount: 9000, // ₹90 in paise
      currency: 'INR',
      receipt: `ff_${req.user._id}_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    })

    await Payment.create({
      userId: req.user._id,
      provider: 'razorpay',
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      status: 'created',
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay error:', err)
    res.status(500).json({ message: 'Failed to create payment order' })
  }
})

// POST /api/payment/razorpay/verify
router.post('/razorpay/verify', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (expected !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    const planEnd = new Date()
    planEnd.setMonth(planEnd.getMonth() + 1)

    await Promise.all([
      Payment.findOneAndUpdate(
        { orderId },
        { paymentId, status: 'paid', planStartDate: new Date(), planEndDate: planEnd }
      ),
      User.findByIdAndUpdate(req.user._id, {
        plan: 'premium',
        planExpiresAt: planEnd,
      }),
    ])

    res.json({ message: 'Payment verified. Premium activated!' })
  } catch (err) {
    console.error('Verify error:', err)
    res.status(500).json({ message: 'Payment verification failed' })
  }
})

// POST /api/payment/stripe/create-session
router.post('/stripe/create-session', authMiddleware, async (req, res) => {
  try {
    const stripeClient = getStripe()

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
      metadata: { userId: req.user._id.toString() },
    })

    await Payment.create({
      userId: req.user._id,
      provider: 'stripe',
      sessionId: session.id,
      amount: 100, // $1 in cents
      currency: 'USD',
      status: 'created',
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ message: 'Failed to create checkout session' })
  }
})

// POST /api/payment/stripe/webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    const stripeClient = getStripe()
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    if (userId) {
      const planEnd = new Date()
      planEnd.setMonth(planEnd.getMonth() + 1)
      await Promise.all([
        User.findByIdAndUpdate(userId, { plan: 'premium', planExpiresAt: planEnd }),
        Payment.findOneAndUpdate(
          { sessionId: session.id },
          { status: 'paid', subscriptionId: session.subscription, planStartDate: new Date(), planEndDate: planEnd }
        ),
      ])
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const payment = await Payment.findOne({ subscriptionId: sub.id })
    if (payment) {
      await User.findByIdAndUpdate(payment.userId, { plan: 'free' })
    }
  }

  res.json({ received: true })
})

// GET /api/payment/status
router.get('/status', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
  })
})

module.exports = router
