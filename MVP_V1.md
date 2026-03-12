## GymBuddy V1.0 MVP

### Product Goal
- **Goal**: Help fitness enthusiasts and gym owners connect through a premium, dark-themed platform that makes it easy to find compatible workout partners, discover gyms, and manage basic collaborations and payments.

### Target Users
- **Gym users**: People who already train or want to start training and are looking for accountability partners with similar goals, schedules, and locations.
- **Gym owners**: Owners/managers who want to attract engaged members, receive membership payments on time, and get visibility for their gyms.
- **Future (not core to V1)**: Admin/ops team monitoring platform health and moderation.

### Features In Scope (V1.0)
- **Authentication & Security**
  - Email/password registration with role selection (`user` / `gymOwner` / admin-ready).
  - Required profile photo upload during signup (non-admin roles).
  - JWT-based login/logout with token persistence on the frontend.
  - OTP-based email verification (send, verify, resend) with expiry and clear error messages.
  - Forgot password + reset password via OTP.
  - Protected routes and role-based access for user, gymOwner, admin views.

- **User Experience & UI**
  - Premium dark gym-themed design system using a reusable `PageBackground` layout with gym imagery + overlays.
  - Responsive navbar with role-aware navigation; clicking `GymBuddy` routes to landing or dashboard depending on auth state.
  - Public pages: landing, register, login, OTP verify, forgot/reset password, browse gyms, gym detail, and 404.
  - User pages: dashboard, profile, onboarding/profile completion, matches, tickets, notifications, payments history, feed.
  - Gym owner pages: owner dashboard, onboarding/add gym, manage gyms, edit gym, owner payments/analytics.

- **Gyms & Owners**
  - Public browse gyms page with GPS/city-based discovery, search, and filters.
  - Gym details page with facilities, pricing, hours, and CTAs.
  - Gym owner can add, edit, delete and manage gyms, including gym photos and pricing.
  - Basic visit/ticket stats on owner dashboard (recent tickets, active/completed visits).

- **Partner Discovery & Matching**
  - Onboarding flow to capture fitness basics, goals, preferences, and bio.
  - Matching service that scores compatibility (location, time, goals, experience).
  - Matches page showing compatible users with statuses (available, pending, accepted).
  - Match request and respond (accept/reject) flow with notifications.

- **Collaboration & Payments**
  - Ticket/collaboration creation with a matched partner and selected gym.
  - Basic ticket management (status, recent activity) for users and owners.
  - Stripe-backed payment flow to pay monthly membership to gym owners (dev keys).
  - Payment history for users and payment summary for gym owners.

- **Backend & Infrastructure**
  - Node.js + Express backend with MongoDB Atlas + Mongoose models for User, Match, Gym, Ticket, Notification, Conversation, Message.
  - REST API for auth, users, matches, gyms, tickets, notifications, payments, and health/config endpoints.
  - File upload pipeline (Multer) for profile photos and gym images, served via `/uploads`.
  - Basic email delivery with Nodemailer and graceful fallback when email credentials are missing.
  - TypeScript entrypoint for backend (`src/server.ts`) with `ts-node-dev` and a TS config that allows gradual migration.

### Features Out of Scope (V1.0)
- **Full real-time chat with Socket.io** (websocket events, typing indicators, online status, read receipts).
- **Advanced admin tooling**
  - In-depth analytics dashboards.
  - Content moderation tools and audit logs.
- **Complex recommendation engine**
  - Multi-gym routing, dynamic pricing optimization, or ML-based recommendations.
- **Social features**
  - Public posts feed with comments/likes beyond the existing basic “feed” view.
- **Production-grade payment setup**
  - Live Stripe keys, payouts, invoices, dispute handling, and taxes.
- **Mobile apps**
  - Native iOS/Android applications (web is the primary channel for V1).

### Testing Plan (10 Real Users)
- **Recruitment**
  - 6 gym users (mix of beginner, intermediate, advanced) from 2–3 local gyms.
  - 3 gym owners across different gym sizes (small studio, mid-size gym, larger facility).
  - 1 admin/operator acting as internal tester.

- **Test Scenarios**
  1. **User signup & onboarding**
     - Create account with photo upload, complete OTP verification, finish onboarding, land on dashboard.
  2. **Login, logout, and session restore**
     - Login on one device, refresh, close/open browser, confirm token persistence and protected route behavior.
  3. **Profile completion impact**
     - Update profile, verify that match suggestions improve and dashboard prompts disappear.
  4. **Browse gyms & details**
     - Use GPS and city filter to find a gym, open detail page, explore facilities and pricing.
  5. **Create and manage gyms (owner)**
     - Owner registers, adds a new gym with photo and pricing, edits details, verifies that it appears on the public gyms page.
  6. **Partner discovery & matching**
     - From two user accounts, complete profiles, send match request, accept/reject, and confirm visibility in matches list and notifications.
  7. **Ticket/collaboration flow**
     - From an accepted match, create a collaboration ticket, verify that it appears in both users’ tickets and the owner’s recent activity.
  8. **Payments**
     - Run a test Stripe checkout for a monthly membership, verify redirect and that entries appear in user payment history and owner summary.
  9. **Password recovery**
     - Trigger forgot password, receive OTP (or dev console OTP), reset password, and login with the new password.
  10. **Navigation, responsiveness, and visual quality**
      - Navigate with navbar on desktop and mobile, validate that all key routes work, 404 renders correctly, and gym-themed backgrounds feel consistent and readable.

### Success Criteria
- **Functional**
  - ≥ 90% of test tasks above succeed without developer intervention.
  - All core auth flows (register, login, OTP verify/resend, forgot/reset) work reliably and return clear JSON errors on failure.
  - No critical backend runtime errors when running `npm run dev` in backend and `npm run dev` in frontend with sample env files.

- **User Experience**
  - At least 8/10 test users rate the UI/UX as “good” or better for clarity and aesthetics.
  - All pages present a gym-relevant visual background with readable content on both desktop and mobile.

- **Stability & Maintainability**
  - Frontend and backend TypeScript builds (where applicable) complete without blocking type errors.
  - No “orphan” routes: every frontend API call maps to a real backend endpoint, and unknown frontend routes fall back to the NotFound page.

