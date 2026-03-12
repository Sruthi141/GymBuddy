# GymBuddy → **Rep** — Premium Product Redesign Blueprint

> A startup-ready fitness partner platform. Dark luxury theme, smart matching, social feed, real-time chat, video calls, payments, and gamification.

---

## 1. Product Vision & Brand Reframe

### Name Recommendation: **Rep** (short for "reps", workout slang)

**Tagline:** *"Find your rep. Build together."*

**Why Rep?**
- Short, memorable, fitness-native
- Evokes partnership ("my rep" = my workout buddy)
- Premium feel, avoids "buddy" informality
- Strong SEO potential (Rep fitness app)
- Trademark-friendly, scalable brand

*Keep "GymBuddy" as secondary branding if preferred; the architecture below works for either name.*

### Product Vision (Professional)

**Rep** is a premium fitness platform that connects gym-goers with compatible workout partners through AI-powered matching, real-time communication, and a lightweight social layer. Gym owners can list and manage their spaces, monetize memberships, and engage their community. Users earn trust scores, streaks, and badges while building accountability through partner matching, check-ins, and challenges. Rep makes fitness social, accountable, and rewarding—without the noise of traditional social networks.

### Core Value Props

| User | Gym Owner | Platform |
|------|-----------|----------|
| Find compatible workout partners | Monetize gym space | Subscription + transaction fees |
| Accountability through streaks & check-ins | Build community | Network effects |
| Safe meetups with verification & SOS | Analytics & insights | Data-driven matching |
| Social feed for motivation | Membership & booking tools | Premium positioning |

---

## 2. Feature Set: MVP vs Advanced

### MVP (v1.0 — Launch in 8–10 weeks)

| Area | Features |
|------|----------|
| **Auth** | Signup/login, required profile photo upload, email OTP verification for all users, password strength validation, forgot password (OTP flow), resend OTP with cooldown |
| **Profile** | Photo, cover, bio, goals, workout type, experience level, preferred time, city, height/weight/age, gender preference for partner, profile completion bar, verification badge |
| **Matching** | AI-based compatibility score, match requests, accept/reject, match list |
| **Social** | Post gym photos/updates, lightweight feed, like, comment, save; gym owner posts |
| **Chat** | Real-time 1:1 chat for matched users, WhatsApp-like UI, typing indicators, seen status, image sharing |
| **Gyms** | Browse, filter, detail, nearby; owner add/edit gyms, photo gallery, basic analytics |
| **Payments** | Monthly membership payment to gym owner (manual for now, gateway-ready), payment reminders, payment history, owner earnings view, status badges (paid/pending/overdue) |
| **Notifications** | In-app center, email notifications, read/unread, match/ticket/payment reminders |
| **Admin** | Manage users, approve/reject gyms, moderate posts/reports |

### Advanced (v2.0+ — Post-launch)

| Area | Features |
|------|----------|
| **Communication** | Voice notes, video calling between matched users, call screen UI |
| **Gamification** | Streaks, badges, challenges, local leaderboard, trust score, partner attendance score, transformation timeline |
| **Operations** | QR check-in at gyms, "Find a spotter now", booking requests, membership plans |
| **Safety** | Emergency SOS, safety share for meetup details, block/report, moderation flow |
| **Payments** | Stripe/Razorpay integration, subscription plans, invoices, payout automation |
| **Gym Owner** | Visitor analytics, offers/promotions, staff management design |
| **Discovery** | Nearby gym suggestions, gym events, group workouts |

---

## 3. Information Architecture & Page Structure

### Public

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Hero, value props, how it works, CTA |
| `/login` | Login | Email + password, forgot password link |
| `/register` | Register | Role, name, email, password, **required photo upload** |
| `/verify-otp` | OTP Verification | 6-digit OTP input, resend cooldown |
| `/verify-email/:token` | Email Link Verify | Fallback/link-based verification |
| `/forgot-password` | Forgot Password | Email → OTP → new password |
| `/reset-password/:token` | Reset Password | Set new password via link |
| `/gyms` | Gym Directory | Browse, filter |
| `/gyms/:id` | Gym Detail | Info, gallery, memberships, owner posts |
| `/pricing` | Pricing (optional) | Plans for gym owners |

### User (role: user)

| Route | Page | Purpose |
|-------|------|---------|
| `/onboarding` | Onboarding | Multi-step profile setup |
| `/dashboard` | Dashboard | Stats, upcoming sessions, feed preview, quick actions |
| `/feed` | Social Feed | Posts, like/comment/save |
| `/feed/:id` | Post Detail | Single post with comments |
| `/matches` | Matches | Compatible users, pending, accepted |
| `/matches/:id` | Match Detail | Partner profile, chat CTA |
| `/chat` | Chat List | All conversations |
| `/chat/:matchId` | Chat Room | WhatsApp-like chat UI |
| `/tickets` | Collaboration | Session tickets |
| `/profile` | Profile | View/edit, completion bar |
| `/profile/:id` | Public Profile | Other user's profile |
| `/gyms` | Gyms | Same as public, with "My memberships" |
| `/gyms/:id` | Gym Detail | Same + join/leave, pay |
| `/memberships` | Memberships | Active, payment history |
| `/notifications` | Notifications | Center with filters |

### Gym Owner (role: gymOwner)

| Route | Page | Purpose |
|-------|------|---------|
| `/owner/onboarding` | Owner Onboarding | Business details, first gym |
| `/owner/dashboard` | Dashboard | Gyms, earnings, recent activity |
| `/owner/gyms` | My Gyms | List, add, edit |
| `/owner/gyms/:id` | Gym Manage | Edit, gallery, plans, posts |
| `/owner/gyms/:id/analytics` | Gym Analytics | Visitors, revenue |
| `/owner/earnings` | Earnings | Payout overview, history |
| `/owner/posts` | Posts | Create/manage gym updates |
| `/owner/notifications` | Notifications | Same as user |

### Admin (role: admin)

| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | Dashboard | Platform stats |
| `/admin/users` | Users | List, search, suspend, roles |
| `/admin/gyms` | Gyms | Approve/reject, manage |
| `/admin/content` | Content Mod | Posts, comments, reports |
| `/admin/analytics` | Analytics | Charts, trends |

---

## 4. Database Schema

### User (extended)

```javascript
// backend/models/User.js — additions to existing
{
  // ... existing fields ...
  coverPhoto: { type: String, default: '' },
  profilePhoto: { type: String, required: true }, // Required at signup
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  workoutType: [{ type: String, enum: ['strength', 'cardio', 'hybrid', 'crossfit', 'yoga', ...] }],
  partnerGenderPreference: { type: String, enum: ['any', 'male', 'female', 'no-preference'], default: 'any' },
  socialLinks: {
    instagram: String,
    twitter: String,
    linkedin: String
  },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckInAt: { type: Date },
  badges: [{ type: String }], // e.g. 'early-bird', 'streak-7', 'verified'
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date }
}
```

### Post (new)

```javascript
// backend/models/Post.js
{
  author: { type: ObjectId, ref: 'User', required: true },
  gym: { type: ObjectId, ref: 'Gym' }, // null for user posts
  type: { type: String, enum: ['gym-photo', 'progress', 'transformation', 'update', 'event'], default: 'gym-photo' },
  content: { type: String, maxlength: 2000 },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  likes: [{ type: ObjectId, ref: 'User' }],
  comments: [{
    user: { type: ObjectId, ref: 'User' },
    text: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  saves: [{ type: ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'hidden', 'reported'], default: 'active' },
  reportCount: { type: Number, default: 0 }
}
```

### Conversation & Message (new — for chat)

```javascript
// backend/models/Conversation.js
{
  match: { type: ObjectId, ref: 'Match', required: true, unique: true },
  participants: [{ type: ObjectId, ref: 'User' }],
  lastMessage: { type: ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date }
}

// backend/models/Message.js
{
  conversation: { type: ObjectId, ref: 'Conversation', required: true },
  sender: { type: ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  content: { type: String }, // text or URL for media
  readBy: [{ type: ObjectId, ref: 'User' }],
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }
}
```

### Membership & Payment (new)

```javascript
// backend/models/Membership.js
{
  user: { type: ObjectId, ref: 'User', required: true },
  gym: { type: ObjectId, ref: 'Gym', required: true },
  plan: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
}

// backend/models/Payment.js
{
  user: { type: ObjectId, ref: 'User', required: true },
  gym: { type: ObjectId, ref: 'Gym', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  periodStart: { type: Date },
  periodEnd: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'failed', 'refunded'], default: 'pending' },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  paymentMethod: { type: String }, // 'manual', 'stripe', etc.
  invoiceUrl: { type: String },
  notes: { type: String }
}
```

### OTP & Verification (embedded in User or separate)

```javascript
// Option: add to User
otp: String,
otpExpires: Date,
otpPurpose: { type: String, enum: ['email-verify', 'password-reset'] }
```

### Gym (extensions)

```javascript
// Add to Gym
status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected'], default: 'pending_approval' },
membershipPlans: [{
  name: String,
  type: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
  price: Number,
  features: [String]
}]
```

### Report & Block (new)

```javascript
// backend/models/Report.js
{
  reporter: { type: ObjectId, ref: 'User' },
  reportedUser: { type: ObjectId, ref: 'User' },
  reportedPost: { type: ObjectId, ref: 'Post' },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'action_taken'] }
}

// backend/models/Block.js
{
  blocker: { type: ObjectId, ref: 'User' },
  blocked: { type: ObjectId, ref: 'User' }
}
```

---

## 5. API Architecture

### Base structure

```
backend/
├── config/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   ├── conversationController.js
│   ├── messageController.js
│   ├── gymController.js
│   ├── membershipController.js
│   ├── paymentController.js
│   ├── matchController.js
│   ├── ticketController.js
│   ├── notificationController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   ├── validate.js
│   ├── upload.js (multer for photos)
│   └── errorHandler.js
├── models/
├── routes/
├── services/
│   ├── emailService.js (OTP, verification, reminders)
│   ├── matchingService.js
│   ├── otpService.js
│   └── uploadService.js (local/S3)
└── utils/
```

### API Endpoints (REST)

#### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (photo required in multipart) |
| POST | `/api/auth/send-otp` | Send OTP (email verify or password reset) |
| POST | `/api/auth/verify-otp` | Verify OTP, return temp token if email verify |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request OTP for reset |
| POST | `/api/auth/reset-password` | Reset with OTP or token |
| GET | `/api/auth/me` | Current user |

#### Posts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts` | Feed (paginated, filters) |
| POST | `/api/posts` | Create (multipart for media) |
| GET | `/api/posts/:id` | Single post |
| PUT | `/api/posts/:id` | Update |
| DELETE | `/api/posts/:id` | Delete |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| POST | `/api/posts/:id/save` | Toggle save |

#### Conversations & Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | List user's conversations |
| GET | `/api/conversations/:matchId` | Get or create by match |
| GET | `/api/conversations/:id/messages` | Paginated messages |
| POST | `/api/conversations/:id/messages` | Send message |

*Real-time: WebSocket (Socket.io) for messages, typing, seen.*

#### Memberships & Payments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/memberships` | User's memberships |
| POST | `/api/memberships` | Join gym (create membership) |
| GET | `/api/payments` | User's payments |
| POST | `/api/payments` | Record payment (manual for MVP) |
| GET | `/api/payments/due` | Upcoming due |
| GET | `/api/owner/earnings` | Owner earnings |

#### Extend existing
- `/api/matches`, `/api/tickets`, `/api/gyms`, `/api/notifications`, `/api/admin/*` — add new fields and behaviors as above.

---

## 6. Auth Flow: OTP + Photo Upload

### Signup Flow (with required photo)

```
1. User lands on /register
2. Fills: role, name, email, password (with strength meter)
3. Uploads profile photo (required, drag-drop or file picker)
   - Client: validate file type (jpg, png, webp), size (max 2MB)
   - Preview before submit
4. Submit → POST /api/auth/register (multipart/form-data)
   - Backend: validate all fields, check email unique
   - Hash password, generate OTP (6 digits), set otpExpires = now + 10 min
   - Save user with profilePhoto (URL after upload), isEmailVerified: false
   - Send OTP via email (emailService.sendOTP)
   - Return { needsOtp: true, email, tempToken? } (no full JWT yet)
5. Redirect to /verify-otp?email=xxx
6. User enters 6-digit OTP
7. POST /api/auth/verify-otp { email, otp }
   - Validate OTP, expiry
   - Set isEmailVerified: true, clear otp
   - Generate JWT, return token + user
8. Redirect to /onboarding or /dashboard based on isProfileComplete
```

### Resend OTP

- Button "Resend OTP" disabled for 60 seconds (cooldown)
- POST /api/auth/resend-otp { email }
- Generate new OTP, send email, return success
- Reset cooldown on frontend

### Login Flow

```
1. Email + password
2. If gym owner and !isEmailVerified → show "Verify email first" + resend link
3. Return JWT + user
```

### Forgot Password Flow

```
1. /forgot-password → enter email
2. POST /api/auth/forgot-password { email }
   - Generate OTP, send email
   - Return success
3. /reset-password → enter OTP + new password
4. POST /api/auth/reset-password { email, otp, newPassword }
   - Validate, update password, clear OTP
   - Return token or redirect to login
```

### Validation Rules

| Field | Client | Server |
|-------|--------|--------|
| Name | 2–50 chars | Same + trim |
| Email | Valid format | isEmail, unique |
| Password | Min 8, 1 upper, 1 number, 1 special | Same, bcrypt |
| Photo | jpg/png/webp, max 2MB | Same, store URL |

---

## 7. Chat, Video & Payment Architecture

### Chat Architecture

**Stack:** Socket.io (or native WebSocket) for real-time.

**Flow:**
1. User opens `/chat/:matchId` → join room `conversation_${conversationId}`
2. Emit `typing` when user types
3. Emit `message` → save to DB, broadcast to room
4. Emit `seen` when messages viewed
5. Persist all in `Message` model; fetch history via REST on load

**UI:** WhatsApp-like — message bubbles, sender on right, timestamps, seen ticks, typing indicator bar.

### Video Calling

**Approach:** WebRTC + signaling via Socket.io.

**Flow:**
1. User A clicks "Video Call" in chat
2. Emit `call:initiate` to room with offer SDP
3. User B receives, shows incoming call modal
4. Accept → create answer, emit `call:answer`
5. ICE candidates exchanged via Socket
6. Media streams connected; show local + remote video
7. Hang up → emit `call:end`, cleanup

**UI:** Full-screen call view: remote video dominant, local pip, mute/video toggle, end call.

**Library:** simple-peer or native RTCPeerConnection. For production: consider Daily.co, Twilio, or Agora for TURN/STUN and scalability.

### Payment Architecture (gateway-ready)

**MVP:** Manual payment recording.
- User marks "I paid" → create Payment with status `paid`, paidAt
- Owner sees in earnings; reminders based on dueDate

**Later (Stripe/Razorpay):**
- Payment intent created on "Pay now"
- Webhook updates Payment status
- Same Payment model; add `gatewayId`, `gatewayResponse`

**Reminders:**
- Cron job (node-cron) runs daily: find Payments with dueDate in 3 days, status pending
- Send email + in-app notification
- Overdue: status → overdue, escalate reminders

---

## 8. UI/UX Design System

### Color Palette (dark luxury gym theme)

```css
/* Primary - Electric Teal (energy, fitness) */
--color-primary: #00d9b5;
--color-primary-light: #5effe8;
--color-primary-dark: #00a88a;

/* Accent - Warm Amber (achievement, CTA) */
--color-accent: #f59e0b;
--color-accent-light: #fbbf24;

/* Success, Danger */
--color-success: #10b981;
--color-danger: #ef4444;

/* Backgrounds - Deep dark */
--color-bg-950: #030305;
--color-bg-900: #0a0a0f;
--color-bg-800: #12121a;
--color-bg-700: #1a1a24;
--color-bg-600: #252530;

/* Surface */
--color-surface: rgba(26, 26, 36, 0.9);
--color-border: rgba(0, 217, 181, 0.12);
--color-border-hover: rgba(0, 217, 181, 0.25);

/* Text */
--color-text-primary: #f8fafc;
--color-text-secondary: #94a3b8;
--color-text-muted: #64748b;
```

### Typography

```css
--font-display: 'Clash Display', 'Plus Jakarta Sans', sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--text-4xl: 2.5rem;
```

### Spacing

- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Components

| Component | Style |
|-----------|-------|
| **Button primary** | Teal gradient, rounded-xl, hover lift + glow |
| **Button secondary** | Outline teal, transparent bg |
| **Button ghost** | Transparent, hover bg |
| **Card** | glass-card, border subtle, rounded-2xl |
| **Input** | Dark bg, teal focus ring, rounded-xl |
| **Badge** | Pill shape, status colors (paid=green, pending=amber, overdue=red) |
| **Modal** | Centered, backdrop blur, slide-up animation |
| **Skeleton** | Pulse animation, rounded, dark-600 bg |
| **Toast** | Bottom-right, slide-in, auto-dismiss |

### Animations

- Page transitions: fade + slide up (300ms)
- Card hover: subtle scale (1.02) + border glow
- Button: translateY(-2px) on hover
- Skeleton: pulse 2s infinite
- Success: checkmark draw + scale
- Error: shake + red flash

### Dashboard Layout Ideas

- **User:** Sidebar (collapsible on mobile) → Nav: Dashboard, Feed, Matches, Chat, Tickets, Gyms, Profile
- **Owner:** Same sidebar with Owner-specific items (Gyms, Earnings, Posts)
- **Admin:** Top nav tabs for Users, Gyms, Content, Analytics

### Mobile-First

- Bottom nav bar (Dashboard, Feed, Matches, Chat, Profile)
- Swipe gestures for match cards
- Bottom sheet for filters
- Full-width cards on feed
- Touch-friendly hit areas (min 44px)

---

## 9. Frontend Architecture

### Folder Structure

```
frontend/src/
├── api/                 # API clients
│   ├── client.ts
│   ├── auth.ts
│   ├── posts.ts
│   ├── conversations.ts
│   └── ...
├── components/
│   ├── ui/              # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Skeleton.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── OTPInput.tsx
│   │   └── PhotoUpload.tsx
│   ├── profile/
│   ├── feed/
│   ├── chat/
│   └── shared/
├── context/
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   └── SocketContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useInfiniteScroll.ts
├── pages/
├── routes/
│   └── index.tsx        # Route config
├── styles/
│   ├── index.css
│   └── design-tokens.css
├── types/
├── utils/
│   ├── validation.ts
│   └── format.ts
└── App.tsx
```

### Key Patterns

- **React Query (TanStack Query)** for server state, caching, optimistic updates
- **Context** for auth, socket, notifications
- **Compound components** for complex UI (e.g. ChatRoom)
- **Controlled forms** with validation on blur + submit
- **Error boundaries** for graceful failures
- **Lazy loading** for routes: `React.lazy` + `Suspense`

---

## 10. Phased Implementation Roadmap

### Phase 1: Foundation (Weeks 1–2)

- [ ] Design system: tokens, Button, Input, Card, Badge, Modal, Skeleton
- [ ] Refactor auth: OTP flow, photo upload required, validation
- [ ] Extend User model (cover, height, weight, OTP fields, etc.)
- [ ] Forgot password + reset
- [ ] New landing page with premium dark theme

### Phase 2: Profile & Matching (Week 3)

- [ ] Profile completion bar, verification badge
- [ ] Extended onboarding with new fields
- [ ] Profile page redesign (cover, sections)
- [ ] Matching UX improvements, compatibility breakdown UI

### Phase 3: Social Feed (Week 4)

- [ ] Post model, API
- [ ] Create post (with photo), feed list
- [ ] Like, comment, save
- [ ] Empty states, loading skeletons

### Phase 4: Chat (Weeks 5–6)

- [ ] Conversation, Message models
- [ ] Socket.io setup
- [ ] Chat list, chat room UI
- [ ] Typing, seen, image sharing

### Phase 5: Payments (Week 7)

- [ ] Membership, Payment models
- [ ] Join gym, record payment
- [ ] Payment history, reminders (cron + email)
- [ ] Owner earnings dashboard

### Phase 6: Polish & Launch (Weeks 8–10)

- [ ] Notifications center redesign
- [ ] Admin content moderation
- [ ] Mobile responsive pass
- [ ] Performance, accessibility
- [ ] Security audit

### Phase 7: Advanced (Post-launch)

- [ ] Video calling
- [ ] Streaks, badges, challenges
- [ ] QR check-in, trust score
- [ ] Payment gateway integration
- [ ] "Find a spotter now", SOS

---

## Quick Reference: File Checklist

| Action | Files |
|--------|-------|
| New models | Post, Conversation, Message, Membership, Payment, Report, Block |
| Extend User | coverPhoto, OTP fields, trustScore, streaks, badges |
| Extend Gym | status, membershipPlans |
| New services | otpService, uploadService |
| New routes | posts, conversations, messages, memberships, payments |
| New pages | VerifyOtp, ForgotPassword, ResetPassword, Feed, Chat, Memberships |
| New components | OTPInput, PhotoUpload, PostCard, ChatRoom, PaymentCard |

---

*Document version: 1.0 — Use this as the single source of truth for the Rep (GymBuddy) upgrade.*
