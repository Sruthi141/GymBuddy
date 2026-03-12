# GymBuddy Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Gmail account (for OTP emails)
- Google Cloud Console project (for Google Sign-In)
- Stripe account (for payments)

---

## 1. Backend Setup

### Install dependencies

```bash
cd backend
npm install
```

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# MongoDB
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/gymbuddy?retryWrites=true&w=majority

# JWT (min 32 characters)
JWT_SECRET=your_jwt_secret_key_min_32_chars_for_production

# Server
PORT=5000

# Email (Gmail - use App Password, NOT normal password)
# Create at: https://myaccount.google.com/apppasswords
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_google_app_password

# Frontend URL (for links in emails)
FRONTEND_URL=http://localhost:5173

# Google OAuth (same Client ID for web)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Start backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`.

---

## 2. Frontend Setup

### Install dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 3. OTP Email (Gmail)

1. **Use Google App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Create an App Password for "Mail"
   - Use this 16-char password in `EMAIL_PASS`

2. **Verify on startup**
   - Backend logs `✅ Email configured: your@email.com` if OK
   - Or `❌ Email verification failed` with hints

3. **Without email** (dev): OTP is logged to console; emails are not sent.

---

## 4. Google Sign-In

1. Create a project at https://console.cloud.google.com
2. Enable "Google Identity Services" API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized origins: `http://localhost:5173`, your production URL
5. Add authorized redirect URIs if needed
6. Use the **same Client ID** for:
   - Backend `GOOGLE_CLIENT_ID`
   - Frontend `VITE_GOOGLE_CLIENT_ID`

---

## 5. Stripe Payments

1. Get keys from https://dashboard.stripe.com/apikeys
2. Use **Secret key** (`sk_test_...`) in backend `.env`
3. Use **Publishable key** (`pk_test_...`) in frontend `.env`
4. **Webhook** (for production):
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://your-api.com/api/payments/webhook`
   - Events: `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 6. Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Register flow: profile photo, email, password, OTP
- [ ] OTP email arrives (or is logged if not configured)
- [ ] Verify OTP → login works
- [ ] Google "Continue with Google" on Login/Register (if `VITE_GOOGLE_CLIENT_ID` set)
- [ ] Gym detail page shows "Pay Monthly" when logged in
- [ ] Payment history page loads
- [ ] Owner dashboard shows payment overview
- [ ] No broken images on landing page
- [ ] All nav links work
- [ ] CORS: frontend can call backend (check browser Network tab)

---

## 7. API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register (multipart, profile photo)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google sign-in (credential token)
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset with OTP
- `GET /api/auth/me` - Current user (auth)

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout (auth)
- `POST /api/payments/webhook` - Stripe webhook (no auth)
- `GET /api/payments/me` - User payment history (auth)
- `GET /api/payments/owner-summary` - Owner payment overview (auth)
