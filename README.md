# 🏋️ GymBuddy

GymBuddy is a full-stack fitness platform that connects gym-goers with compatible workout partners based on fitness goals, schedules, and workout preferences. The platform helps users stay consistent in their fitness journey through partner matching, gym discovery, and collaboration sessions.

---

## 🚀 Features

### 🔐 Authentication

* User registration with profile photo
* OTP email verification
* Secure login using JWT authentication
* Forgot password functionality
* Role-based access (User, Gym Owner, Admin)

### 👤 Fitness Profiles

* Complete fitness profile setup
* Profile completion progress bar
* Avatar and cover photo upload
* Fitness goals, experience level, and workout preferences

### 🤝 Smart Partner Matching

* Compatibility-based partner matching
* Suggestions based on:

  * Fitness goals
  * Workout schedule
  * Experience level
* Swipe-style interaction

### 🏋️ Gym Directory

* Browse gyms by city and area
* View gym facilities and details
* Gym owners can list and manage their gyms

### 📱 Social Feed

* Create posts with gym photos
* Like and comment on posts
* Community interaction

### 💬 Chat & Collaboration

* Messaging between matched users
* Collaboration session tickets for workout planning

### 🔔 Notifications

* In-app notification center
* Alerts for matches, messages, and session updates

---

## 🛠 Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Authentication

* JWT (JSON Web Token)
* OTP Email Verification

### Email Service

* Nodemailer

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

* Node.js (v18 or higher)
* MongoDB (Local or MongoDB Atlas)
* npm or yarn

---

## Backend Setup

cd backend
npm install
cp .env.example .env

Edit the `.env` file with your credentials:

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gymbuddy
JWT_SECRET=your_secret_min_32_chars
PORT=5000
EMAIL_USER=[your@gmail.com](mailto:your@gmail.com)
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173

Start backend server:

npm run dev

Backend will run on:

http://localhost:5000

---

## Frontend Setup

cd frontend
npm install

(Optional) create `.env` inside frontend:

VITE_API_URL=http://localhost:5000/api

Start frontend:

npm run dev

Frontend will run on:

http://localhost:5173

---

## 🌱 Seed Demo Data

Run the seed script to add demo users and gyms:

cd backend
npm run seed

### Demo Accounts

User
Email: [arjun@example.com](mailto:arjun@example.com)
Password: Password1!

Gym Owner
Email: [gymowner@example.com](mailto:gymowner@example.com)
Password: Password1!

Admin
Email: [admin@gymbuddy.com](mailto:admin@gymbuddy.com)
Password: Admin1!

---

## 🔐 Environment Variables

| Variable     | Description                       |
| ------------ | --------------------------------- |
| MONGODB_URI  | MongoDB connection string         |
| JWT_SECRET   | Secret key for JWT                |
| PORT         | Backend port                      |
| EMAIL_USER   | Gmail account used for OTP emails |
| EMAIL_PASS   | Gmail App Password                |
| FRONTEND_URL | Frontend base URL                 |
| VITE_API_URL | Backend API URL                   |

---

## 📂 Project Structure

GymBuddy
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   └── utils
│   │
│   └── vite.config.ts
│
└── README.md

---

## 📈 Future Improvements

* AI-based workout partner recommendation
* Real-time chat using WebSockets
* Workout progress tracking
* Fitness challenges and leaderboards
* Mobile application

---

## 👩‍💻 Author

Sruthi Kommati
B.Tech Computer Science
IIIT Sri City

GitHub: https://github.com/Sruthi141
