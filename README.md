# ⚡ FileForge — Universal File Converter SaaS

Convert any file to any format. Documents, images, audio, video, data files.
Free tier with 5 conversions. Premium at ₹90/month ($1) for unlimited.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS + Vite |
| Auth & Payments API | Node.js + Express + MongoDB |
| Conversion Engine | Python + FastAPI |
| Document conversion | LibreOffice CLI + Pandoc + WeasyPrint |
| Image conversion | Pillow + cairosvg |
| Audio/Video | FFmpeg |
| Data conversion | Pandas + PyYAML + dicttoxml |
| Database | MongoDB (Atlas or self-hosted) |
| Cache | Redis |
| Payments (India) | Razorpay |
| Payments (Global) | Stripe |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |

## Quick Start

```bash
git clone https://github.com/youruser/fileforge.git
cd fileforge
cp .env.example .env
# Edit .env with your values
docker compose up mongo redis -d
cd backend-node && npm install && npm run dev &
cd backend-python && pip install -r requirements.txt && uvicorn main:app --reload --port 8000 &
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

## Project Structure

```
fileforge/
├── frontend/          # React app (Vercel)
├── backend-node/      # Auth + Payments API (Render)
├── backend-python/    # Conversion Engine (Render/Docker)
├── infra/             # Nginx + GitHub Actions
├── docker-compose.yml # Full stack orchestration
├── render.yaml        # Render.com deployment config
└── DEPLOYMENT.md      # Full deployment instructions
```

## Supported Conversions

**Documents:** PDF ↔ DOCX, PDF ↔ TXT, DOCX ↔ RTF, DOCX ↔ ODT, HTML → PDF, EPUB → PDF/TXT, TXT ↔ MD

**Images:** JPG ↔ PNG ↔ WEBP ↔ BMP, SVG → PNG, TIFF → JPG, GIF → PNG

**Data:** CSV ↔ JSON ↔ XML ↔ YAML, CSV ↔ XLSX

**Audio:** MP3 ↔ WAV, FLAC → MP3, AAC → MP3, OGG → MP3

**Video:** MP4 ↔ AVI ↔ MOV ↔ MKV ↔ WEBM, MP4 → MP3

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions covering:
- Local development setup
- Docker Compose on a VPS ($6/mo)
- Managed cloud (Vercel + Render free tier)
- GitHub Actions CI/CD
- SSL setup, payment webhooks, troubleshooting

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with search |
| `/register` | Sign up (5 free conversions) |
| `/login` | Sign in |
| `/convert` | File conversion with drag & drop |
| `/dashboard` | Usage stats + plan info |
| `/history` | All past conversions |
| `/pricing` | Free vs Premium comparison |
| `/admin` | Admin panel (role: admin only) |

## Security

- Passwords hashed with bcrypt (rounds: 12)
- JWT in httpOnly cookies (not localStorage)
- ClamAV virus scanning on uploads
- 50 MB file size limit
- Files auto-deleted after 1 hour
- Rate limiting on all endpoints
- Helmet.js security headers
- CORS whitelist
- Razorpay/Stripe webhook signature verification

## License

MIT
