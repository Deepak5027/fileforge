# FileForge — Complete Deployment Guide

## Overview

Three deployment options are provided:

| Option | Best For | Cost |
|--------|----------|------|
| **A — Docker Compose (VPS)** | Full control, cheapest | ~$6/mo (Hetzner/DigitalOcean) |
| **B — Managed Cloud** | Zero DevOps | ~$0–7/mo (Vercel + Render free tier) |
| **C — Local Development** | Development only | Free |

---

## Option C — Local Development (Start Here)

### Prerequisites

Install these on your machine:

```bash
# Node.js 20+
node --version   # should be v20+

# Python 3.12+
python3 --version

# Docker & Docker Compose (for local full-stack)
docker --version
docker compose version

# LibreOffice (for document conversion)
# macOS:
brew install --cask libreoffice
# Ubuntu/Debian:
sudo apt-get install -y libreoffice

# FFmpeg (for audio/video)
# macOS:
brew install ffmpeg
# Ubuntu:
sudo apt-get install -y ffmpeg

# Pandoc (for markdown/epub)
# macOS:
brew install pandoc
# Ubuntu:
sudo apt-get install -y pandoc
```

### Step 1 — Clone & configure

```bash
git clone https://github.com/youruser/fileforge.git
cd fileforge

# Copy environment files
cp .env.example .env
cp backend-node/.env.example backend-node/.env
cp backend-python/.env.example backend-python/.env
```

Edit `backend-node/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:changeme@localhost:27017/fileforge_db?authSource=admin
JWT_SECRET=dev-secret-at-least-32-chars-long
JWT_REFRESH_SECRET=another-dev-secret-at-least-32-chars
PYTHON_API_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
# Leave payment keys empty for now — they're optional in dev
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
```

### Step 2 — Start databases with Docker

```bash
# Start only MongoDB and Redis (no app containers)
docker compose up mongo redis -d

# Verify they're running
docker compose ps
```

### Step 3 — Start Node.js backend

```bash
cd backend-node
npm install
npm run dev
# → Running on http://localhost:5000
# → Test: curl http://localhost:5000/health
```

### Step 4 — Start Python backend

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → Running on http://localhost:8000
# → Test: curl http://localhost:8000/health
```

### Step 5 — Start frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### Step 6 — Create admin user

```bash
# Connect to MongoDB and manually set a user's role to admin
docker exec -it fileforge-mongo mongosh -u admin -p changeme

use fileforge_db
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
exit
```

---

## Option A — Full Docker Compose (VPS Production)

### Recommended VPS specs

| Provider | Plan | vCPU | RAM | Storage | Monthly |
|----------|------|------|-----|---------|---------|
| Hetzner Cloud | CX21 | 2 | 4 GB | 40 GB | ~€4.50 |
| DigitalOcean | Basic | 2 | 2 GB | 50 GB | $12 |
| Vultr | Regular | 2 | 4 GB | 80 GB | $24 |

### Step 1 — Provision your VPS

```bash
# SSH into your VPS (Ubuntu 22.04 recommended)
ssh root@YOUR_SERVER_IP

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Create app directory
mkdir -p /opt/fileforge
cd /opt/fileforge
```

### Step 2 — Upload project files

```bash
# From your local machine:
scp -r ./fileforge root@YOUR_SERVER_IP:/opt/fileforge

# OR clone from GitHub:
git clone https://github.com/youruser/fileforge.git /opt/fileforge
cd /opt/fileforge
```

### Step 3 — Configure environment

```bash
cp .env.example .env
nano .env

# Fill in all production values:
# - Strong JWT secrets (generate: openssl rand -hex 32)
# - Real Razorpay/Stripe keys
# - Set CLIENT_URL=https://yourdomain.com
```

### Step 4 — Point your domain

In your DNS provider, create:
```
A   @       YOUR_SERVER_IP
A   www     YOUR_SERVER_IP
```

### Step 5 — Build and start

```bash
cd /opt/fileforge
docker compose up -d --build

# Check all services are healthy
docker compose ps

# Watch logs
docker compose logs -f

# Check individual service
docker compose logs api-node --tail=50
```

### Step 6 — Set up SSL with Certbot

```bash
apt-get install -y certbot

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates saved to /etc/letsencrypt/live/yourdomain.com/

# Copy certs to project
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem infra/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem infra/certs/

# Uncomment HTTPS block in infra/nginx.conf, then restart
docker compose up nginx -d
```

### Step 7 — Set up GitHub Actions auto-deploy

Add these secrets in GitHub → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | Your server IP |
| `DEPLOY_USER` | `root` (or deploy user) |
| `DEPLOY_SSH_KEY` | Private SSH key content |
| `VITE_API_URL` | `https://yourdomain.com` |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `STRIPE_SECRET_KEY` | Your Stripe key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `STRIPE_PRICE_ID` | Your Stripe price ID |

Every push to `main` → tests run → images build → SSH deploy automatically.

### Useful VPS commands

```bash
# View all container status
docker compose ps

# Restart a service
docker compose restart api-node

# Pull latest images and redeploy
docker compose pull && docker compose up -d

# View real-time logs
docker compose logs -f --tail=100

# Enter a container shell
docker compose exec api-node sh
docker compose exec api-python bash

# Check disk usage
docker system df

# Clean up unused images/volumes
docker system prune -a --volumes
```

---

## Option B — Managed Cloud (Vercel + Render)

### Step 1 — MongoDB Atlas (free tier)

1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a **free M0 cluster** (512 MB, enough for thousands of users)
3. Database → `fileforge_db`
4. Create a DB user with a strong password
5. Network Access → Allow `0.0.0.0/0` (Render needs this)
6. Connect → Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fileforge_db
   ```

### Step 2 — Deploy Python API to Render

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, select `backend-python` as root
4. Settings:
   - **Environment**: Docker
   - **Dockerfile path**: `./Dockerfile`
   - **Region**: Singapore (closest to India)
5. Add environment variables:
   ```
   FASTAPI_PORT=8000
   FILE_EXPIRY_SECONDS=3600
   MAX_FILE_SIZE_MB=50
   ```
6. Deploy → note the URL: `https://fileforge-api-python.onrender.com`

> ⚠️ Free Render instances spin down after 15 min of inactivity.
> For production, use the $7/mo Starter plan.

### Step 3 — Deploy Node API to Render

1. Render → New → Web Service → same repo
2. Root directory: `backend-node`
3. **Environment**: Node
4. **Build**: `npm ci --omit=dev`
5. **Start**: `node src/app.js`
6. Add all environment variables from `backend-node/.env.example`
7. Set `PYTHON_API_URL` to the Python service URL from Step 2
8. Deploy → note the URL: `https://fileforge-api-node.onrender.com`

### Step 4 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Vite**
4. Root directory: `frontend`
5. Build command: `npm run build`
6. Output: `dist`
7. Environment variables:
   ```
   VITE_API_URL=https://fileforge-api-node.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_live_XXXXX
   ```
8. Deploy → your site is live at `https://fileforge.vercel.app`

### Step 5 — Configure payment webhooks

**Razorpay:**
- Dashboard → Settings → Webhooks → Add webhook
- URL: `https://fileforge-api-node.onrender.com/api/payment/razorpay/webhook`
- Events: `payment.captured`
- Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET` env var

**Stripe:**
- Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://fileforge-api-node.onrender.com/api/payment/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

**Create Stripe price:**
- Dashboard → Products → Add product
- Name: "FileForge Premium"
- Price: $1.00 / month (recurring)
- Copy Price ID → `STRIPE_PRICE_ID`

### Step 6 — Create Razorpay subscription plan

- Razorpay Dashboard → Subscriptions → Plans → Create Plan
- Name: FileForge Premium
- Amount: ₹90
- Interval: monthly
- Note the Plan ID for reference

---

## Post-Deployment Checklist

```bash
# 1. Verify all services respond
curl https://yourdomain.com/health
curl https://fileforge-api-node.onrender.com/health
curl https://fileforge-api-python.onrender.com/health

# 2. Create your admin account
# - Register at /register with your email
# - Connect to MongoDB and run:
db.users.updateOne({ email: "admin@yourdomain.com" }, { $set: { role: "admin" } })

# 3. Test a conversion
# - Log in, go to /convert
# - Upload a PDF, convert to DOCX
# - Verify download works

# 4. Test payment flow
# - Use Razorpay test mode: key rzp_test_XXXX
# - Test card: 4111 1111 1111 1111, any CVV, any future date
# - Verify /dashboard shows Premium plan

# 5. Set up monitoring (optional but recommended)
# - UptimeRobot (free): monitors /health endpoints
# - Render's built-in metrics for CPU/memory
```

---

## Environment Variable Reference

### backend-node/.env — Complete list

```env
# App
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>

# Services
PYTHON_API_URL=https://fileforge-api-python.onrender.com
CLIENT_URL=https://yourdomain.com

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

### backend-python/.env — Complete list

```env
FASTAPI_PORT=8000
NODE_API_URL=https://fileforge-api-node.onrender.com
FILE_STORAGE_PATH=/tmp/fileforge
MAX_FILE_SIZE_MB=50
FILE_EXPIRY_SECONDS=3600
```

### frontend env (Vercel dashboard or .env.local)

```env
VITE_API_URL=https://fileforge-api-node.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

---

## Troubleshooting

### "LibreOffice not found" error
```bash
# On Render: add to Dockerfile (already included)
# On Ubuntu VPS:
apt-get install -y libreoffice
# Verify:
soffice --version
```

### CORS errors in browser
Check `CLIENT_URL` in Node env matches your exact frontend URL (no trailing slash).

### JWT Token expired loops
Ensure `JWT_REFRESH_SECRET` is set and different from `JWT_SECRET`.

### Razorpay "Invalid key" error
Use `rzp_test_` prefix for test mode, `rzp_live_` for production. Never mix.

### MongoDB Atlas "connection refused"
- Check IP whitelist includes `0.0.0.0/0`
- Verify the connection string has correct username/password
- Ensure DB name in URI matches `fileforge_db`

### File conversion timeout
- Free Render instances have a 30s request timeout
- Upgrade to Starter ($7/mo) for longer timeouts
- Large files (>10MB) may need the `proxy_read_timeout 300s` in Nginx

### "Disk full" on VPS
```bash
# Check space
df -h
# Clean Docker
docker system prune -a
# The /tmp/fileforge auto-cleanup runs every hour
# Force manual cleanup:
find /tmp/fileforge -mmin +60 -delete
```
