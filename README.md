# 🥂 Luxe Events — Luxury Event Management Platform

A full-stack, production-ready luxury event management platform built with React, Node.js, MongoDB, and Razorpay.

---

## 🏗 Project Architecture

```
luxe-events/
├── frontend/          # React + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── common/       # Reusable UI components
│       │   ├── layout/       # Header, Footer, Sidebar
│       │   ├── auth/         # Login, Register, ForgotPassword
│       │   ├── booking/      # Booking wizard & forms
│       │   ├── events/       # Event cards, listing
│       │   ├── venues/       # Venue gallery & filters
│       │   ├── gallery/      # Photo/video gallery
│       │   ├── dashboard/    # User dashboard
│       │   ├── admin/        # Admin panel
│       │   └── payment/      # Razorpay integration
│       ├── pages/            # Route-level pages
│       ├── context/          # Auth & App context
│       ├── hooks/            # Custom React hooks
│       └── utils/            # API calls, helpers
└── backend/
    └── src/
        ├── controllers/      # Business logic
        ├── models/           # MongoDB schemas
        ├── routes/           # Express routers
        ├── middleware/       # Auth, admin, error handlers
        ├── utils/            # Email, SMS, helpers
        └── config/           # DB, payment config
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account
- SMTP credentials (Gmail / SendGrid)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/luxe-events.git
cd luxe-events

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment Variables

**backend/.env**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/luxeevents
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

App runs at: http://localhost:3000
API runs at: http://localhost:5000

---

## 🚀 Deployment

### Backend → Render

1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node src/server.js`
5. Add all environment variables

### Frontend → Vercel

1. Import GitHub repo on Vercel
2. Set root directory to `frontend`
3. Add `REACT_APP_API_URL` pointing to your Render URL
4. Deploy

---

## 🧪 Testing

```bash
cd backend
npm test          # Run all tests
npm run test:watch  # Watch mode
```

---

## 📋 API Documentation

See `/docs/API.md` for full REST API reference.

---

## 👤 Default Admin Credentials

After seeding:
- Email: `admin@luxeevents.com`
- Password: `Admin@123`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion |
| Backend | Node.js 18, Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Payments | Razorpay |
| Email | Nodemailer |
| SMS | Twilio |
| Deployment | Vercel + Render |

---

## 🔐 Security Features

- JWT with refresh tokens
- bcrypt password hashing
- Rate limiting (express-rate-limit)
- Helmet.js security headers
- CORS configuration
- Input validation (Joi)
- XSS protection
- MongoDB injection prevention

---

## 📄 License

MIT © 2026 Luxe Events
