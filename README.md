# 🩸 LifePulse — Blood Donor and Finder Management System

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web platform connecting voluntary blood donors directly with families and hospitals experiencing critical medical emergencies in real time.

---

## 🌟 Key Highlights & Features

### 🎨 Clean, Trustworthy 60-30-10 Design
- **60% Whites & Light Neutrals**: Open space, breathable card layouts, clean backgrounds.
- **30% Red / Crimson Accents**: Primary CTAs, urgency badges, life-saving highlights.
- **10% Charcoal Details**: Crisp typography, icons, and structured borders.
- Fully responsive across desktop, tablets, and mobile devices.

---

## 🚀 Core Functionalities

### 1. Home Page
- **Hero & Mission**: Highlights the value of every blood donation.
- **Live Counters**: Real-time stats on registered donors, available donors, and lives saved.
- **Emergency Board**: Urgent blood request broadcasts with direct pledge triggers.
- **Interactive Compatibility Checker**: Instant matrix showing who can donate and receive from each blood type (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **Step-by-Step Guide**: How voluntary connection works.

### 2. Find a Donor (Public Search)
- Filter donors by **Blood Group**, **City**, and **Availability Status**.
- Keyword search by donor name or location.
- Detailed donor cards with verified badges, total donation count, and last donation interval.
- **Direct Contact Triggers**: Instant phone call, email, or direct emergency assistance request.

### 3. Blood Requests Board
- Browse active hospital and patient requests with urgency classifications:
  - 🚨 **Urgent** (Within 24 Hours)
  - ⚠️ **Moderate** (48–72 Hours)
  - ℹ️ **Routine** (Scheduled Procedure)
- **Public Request Form**: Post emergency needs with patient name, hospital, city, and units needed.
- **Pledge System**: Registered donors can pledge units directly to any open request.

### 4. Donor Registration & Login
- **Donor Registration**: Form with frontend & backend validation (email, password, phone, blood group, city, age, gender, last donation date).
- **Secure Authentication**: Passwords securely hashed with `bcryptjs`, authenticated via JWT Bearer tokens.
- **Unified Login**: Standard login portal for registered Donors and System Administrators with role-based routing.

### 5. Donor Dashboard (`/donor/dashboard`)
- **Readiness Status**: Toggle between **Available** and **Resting** in real-time.
- **Eligibility Countdown**: 90-day safe donation calculator based on last donation date.
- **Digital Donor ID Card**: Interactive printable ID card with verified status and unique donor number.
- **Donation History**: Log new hospital donations with celebratory confetti animation.
- **My Pledges**: Track requests you have pledged to support.

### 6. Admin Management Console (`/admin`)
- **Secure Administrator Access**: Configured securely via environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).
- **Analytics Overview**: Donors breakdown by blood group, requests by status, total donations.
- **Donor Management**: Search, filter, edit donor information, toggle availability, add new donors, or delete records.
- **Request Oversight**: Manage live requests, update fulfillment status (*Open*, *In Progress*, *Fulfilled*, *Cancelled*), or broadcast emergency requests.
- **Role-Based Server Guards**: Admin endpoints are strictly protected with JWT authentication and role verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Lucide Icons, Canvas Confetti, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Morgan, Cors |
| **Database** | MongoDB (External connection or automatic zero-config In-Memory MongoDB Server fallback) |

---

## 📂 Project Structure

```
blood-donar-mangement-system/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BloodGroupBadge.jsx
│   │   │   ├── CompatibilityChecker.jsx
│   │   │   ├── DonorCard.jsx
│   │   │   ├── DonorIdCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RequestCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BloodRequests.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── FindDonors.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── BloodRequest.js
│   │   ├── DonationRecord.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── donorRoutes.js
│   │   └── requestRoutes.js
│   ├── utils/
│   │   └── seed.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Leave empty for zero-config built-in MongoDB in development)
MONGODB_URI=

# JWT Secret & Expiry
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Admin Account Configuration (Securely configured via environment)
ADMIN_EMAIL=your_admin_email@domain.com
ADMIN_PASSWORD=your_secure_admin_password

# Development Seeding (Set to true only when explicitly populating sample dev data)
SEED_DEV_DATA=false
```

---

## 🏃 Quick Start & Local Execution

### 1. Install Dependencies
Run the command below from the root folder:
```bash
# In the root directory
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Start Backend & Frontend Concurrently
Run from the root directory:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

Or run each service separately in two terminal windows:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## 🚀 Deployment on Render

1. **Push your code to GitHub/GitLab**.
2. **Create a new Web Service** on [Render](https://render.com) or use **Render Blueprints** (`render.yaml`).
3. Set the following configuration settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build --prefix client && npm install --prefix server`
   - **Start Command**: `npm run start --prefix server`
4. Add the following **Environment Variables** in the Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render)
   - `MONGODB_URI`: Your production MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/blood_donor_db`)
   - `JWT_SECRET`: A long, random secure secret string
   - `ADMIN_EMAIL`: Your private administrator email address
   - `ADMIN_PASSWORD`: Your private administrator password
   - `SEED_DEV_DATA`: `false` (keeps existing production database intact)
5. Click **Deploy**. Render will automatically build the React client, install backend dependencies, and serve the unified production application.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register donor account
- `POST /api/auth/login` — Authenticate user (Donor or Admin)
- `GET /api/auth/me` — Get current profile
- `PUT /api/auth/profile` — Update user profile & availability

### Donors (`/api/donors`)
- `GET /api/donors` — Search donors by blood group, city, availability
- `GET /api/donors/stats` — Overall aggregate statistics
- `GET /api/donors/:id` — Public donor profile
- `GET /api/donors/me/donations` — Logged-in donor donation history
- `POST /api/donors/me/donations` — Log completed donation
- `GET /api/donors/me/pledges` — Requests pledged by logged-in donor

### Blood Requests (`/api/requests`)
- `GET /api/requests` — Filter active requests
- `GET /api/requests/urgent` — Top urgent requests
- `GET /api/requests/:id` — Single request details & pledges
- `POST /api/requests` — Create emergency blood request
- `POST /api/requests/:id/pledge` — Submit donor pledge
- `PUT /api/requests/:id/status` — Update fulfillment status
- `DELETE /api/requests/:id` — Remove request

### Admin (`/api/admin`)
- `GET /api/admin/overview` — Dashboard analytics
- `GET /api/admin/donors` — Search and manage donors
- `POST /api/admin/donors` — Create new donor
- `PUT /api/admin/donors/:id` — Edit donor record
- `DELETE /api/admin/donors/:id` — Delete donor
- `GET /api/admin/requests` — View all blood requests
- `PUT /api/admin/requests/:id` — Edit blood request
- `DELETE /api/admin/requests/:id` — Delete blood request

---

## 📄 License
MIT License. Created for the LifePulse Blood Donor and Finder Management System.
