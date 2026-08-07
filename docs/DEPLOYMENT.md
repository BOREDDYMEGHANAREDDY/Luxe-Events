# 🚀 Luxe Events — Complete Deployment Guide

## Overview

| Service   | Platform       | Free Tier |
|-----------|----------------|-----------|
| Frontend  | Vercel         | ✅ Yes    |
| Backend   | Render         | ✅ Yes    |
| Database  | MongoDB Atlas  | ✅ Yes (512 MB) |
| Email     | Gmail SMTP     | ✅ Yes    |
| Payments  | Razorpay       | ✅ Test mode |

---

## Step 1 — MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account
2. Create a **Free Cluster** (M0) in the region closest to your users
3. Under **Database Access** → Add a database user:
   - Username: `luxeadmin`
   - Password: Generate a strong password — save it
4. Under **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application** → Copy the URI:
   ```
   mongodb+srv://luxeadmin:<password>@cluster0.xxxxx.mongodb.net/luxeevents
   ```
6. Replace `<password>` with your password

---

## Step 2 — Razorpay Account

1. Sign up at https://razorpay.com
2. Go to **Settings** → **API Keys** → Generate Test Mode keys
3. Save:
   - `Key ID`: starts with `rzp_test_`
   - `Key Secret`: keep private

For production, complete KYC verification and switch to Live mode.

---

## Step 3 — Gmail SMTP App Password

1. Enable **2-Step Verification** on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail" + "Windows Computer"
4. Save the 16-character password

---

## Step 4 — Deploy Backend to Render

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/luxe-events.git
   git push -u origin main
   ```

2. Go to https://render.com → New → **Web Service**

3. Connect your GitHub repo

4. Configure:
   | Field          | Value                     |
   |----------------|---------------------------|
   | Name           | `luxe-events-api`         |
   | Root Directory | `backend`                 |
   | Runtime        | `Node`                    |
   | Build Command  | `npm install`             |
   | Start Command  | `node src/server.js`      |
   | Plan           | Free                      |

5. Add **Environment Variables** (click "Add Environment Variable" for each):
   ```
   NODE_ENV           = production
   PORT               = 5000
   MONGO_URI          = mongodb+srv://luxeadmin:password@cluster0.xxxxx.mongodb.net/luxeevents
   JWT_SECRET         = [generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   JWT_EXPIRE         = 7d
   RAZORPAY_KEY_ID    = rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET= your_razorpay_secret
   EMAIL_HOST         = smtp.gmail.com
   EMAIL_PORT         = 587
   EMAIL_USER         = your@gmail.com
   EMAIL_PASS         = your_16_char_app_password
   FRONTEND_URL       = https://luxe-events.vercel.app
   ```

6. Click **Create Web Service** — wait for build to complete (~3 min)

7. Note your backend URL: `https://luxe-events-api.onrender.com`

8. **Seed the database:**
   - Open Render Shell (or run locally with production MONGO_URI):
   ```bash
   npm run seed
   ```

---

## Step 5 — Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project

2. Import your GitHub repository

3. Configure:
   | Field          | Value       |
   |----------------|-------------|
   | Framework      | Create React App |
   | Root Directory | `frontend`  |
   | Build Command  | `npm run build` |
   | Output Dir     | `build`     |

4. Add **Environment Variables**:
   ```
   REACT_APP_API_URL          = https://luxe-events-api.onrender.com/api
   REACT_APP_RAZORPAY_KEY_ID  = rzp_test_xxxxxxxxxxxx
   ```

5. Click **Deploy** — wait ~2 minutes

6. Your app is live at: `https://luxe-events.vercel.app`

---

## Step 6 — Update CORS

After deploying frontend, update `FRONTEND_URL` in Render to your exact Vercel URL:
```
FRONTEND_URL = https://luxe-events-YOUR-ID.vercel.app
```

Trigger a new deploy on Render (or it auto-deploys on next push).

---

## Step 7 — Custom Domain (Optional)

### Vercel (Frontend):
1. Settings → Domains → Add your domain
2. Add CNAME record: `www` → `cname.vercel-dns.com`

### Render (Backend):
1. Settings → Custom Domains → Add domain
2. Add CNAME record to your DNS provider

---

## Step 8 — Verify Deployment

Run through this checklist:

```
✅ https://your-backend.onrender.com/api/health → { "success": true }
✅ https://your-frontend.vercel.app → Homepage loads
✅ Register a new account
✅ Login and see dashboard
✅ Browse events and venues
✅ Make a test booking
✅ Complete Razorpay test payment (use card: 4111 1111 1111 1111)
✅ Admin login: admin@luxeevents.com / Admin@123
✅ Admin dashboard shows stats
```

---

## Docker Local Development

```bash
# Start everything
docker-compose up -d

# Seed database
docker exec luxe-backend npm run seed

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB UI: http://localhost:8081

---

## Environment Summary

### backend/.env (production)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<64-char-random-hex>
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hello@yourdomain.com
EMAIL_PASS=app_password
FRONTEND_URL=https://yourdomain.com
```

### frontend/.env (production)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxx
```

---

## Razorpay Test Cards

| Card Number         | CVV | Expiry  | Result  |
|---------------------|-----|---------|---------|
| 4111 1111 1111 1111 | Any | Any future | Success |
| 5267 3181 8797 5449 | Any | Any future | Success |
| 4000 0000 0000 0002 | Any | Any future | Failure |

UPI (test): `success@razorpay`

---

## Production Checklist

- [ ] Rotate JWT_SECRET — never use dev value
- [ ] Set NODE_ENV=production
- [ ] Use Razorpay **Live** keys (after KYC)
- [ ] Enable MongoDB Atlas backups
- [ ] Set up monitoring (UptimeRobot for free)
- [ ] Configure Render health check path: `/api/health`
- [ ] Add custom domain + SSL (both platforms handle SSL automatically)
- [ ] Test all payment flows end-to-end in production mode
- [ ] Verify email delivery with production SMTP

---

## Troubleshooting

**Backend not starting on Render:**
- Check logs in Render dashboard
- Verify all env vars are set
- Ensure MONGO_URI is correct and IP whitelist includes 0.0.0.0/0

**Frontend shows API errors:**
- Confirm REACT_APP_API_URL has no trailing slash
- Check CORS — FRONTEND_URL in backend must match exactly
- Open browser console Network tab to see failed requests

**Payments failing:**
- Verify RAZORPAY_KEY_ID matches in both frontend and backend
- Key ID goes in frontend, Key Secret stays in backend only
- Check Razorpay dashboard for transaction logs

**Emails not sending:**
- Use Gmail App Password, not your Gmail login password
- Test with: `node -e "require('./src/utils/email').sendEmail({to:'test@gmail.com',subject:'Test',template:'contactAck',data:{name:'Test'}})"`
