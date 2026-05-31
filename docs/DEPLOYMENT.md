# Deployment Guide

## Environment Variables

Copy `.env.example` to `.env` and configure all values before deploying.

**Required:**
- `DATABASE_URL` - Your existing PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Strong random string (32+ chars)
- `JWT_REFRESH_SECRET` - Strong random string (32+ chars)
- `CLIENT_URL` - Production frontend URL (for CORS)

**Optional:**
- `STRIPE_SECRET_KEY` - Enables real Stripe payments
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed   # First deploy only
```

## Backend Deployment

1. Set `NODE_ENV=production`
2. Run migrations on deploy
3. Start: `npm run start -w backend`
4. Ensure port `5000` (or `PORT`) is exposed

### Railway / Render

- Root directory: project root
- Build: `npm install`
- Start: `npm run start -w backend`

## Frontend Deployment

1. Set `VITE_API_URL=https://your-api.com/api`
2. Build: `npm run build -w frontend`
3. Deploy `frontend/dist` to Vercel/Netlify/Cloudflare Pages

### Vercel

- Framework: Vite
- Root: `frontend`
- Build command: `npm run build`
- Output: `dist`

## Post-Deploy Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS `CLIENT_URL`
- [ ] Set up Stripe (if using real payments)
- [ ] Configure email service (replace mock in `backend/src/utils/email.js`)
