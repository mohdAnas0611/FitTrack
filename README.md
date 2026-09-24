# 🎮🏋️ FitTrack App

**FitTrack** is an innovative **gamified fitness & territory capture application** that transforms real-world walking and workouts into an interactive virtual conquest. Users walk, track workouts, earn coins/XP, unlock walker avatars, and battle rivals (Marcus, Priya, Jake) for territory dominance across a dynamic 17×26 sector grid.

Built with a modular fullstack architecture:
* 📱 **Frontend**: React / React Native (Expo Router) with interactive HTML5 Canvas territory map.
* ⚙️ **Backend**: Node.js & Express REST API with JWT authentication, leveling engine, and persistent storage.

---

## 🚀 Key Features

* 🎮 **Gamified Fitness Experience** – Level up, earn coins, and conquer sectors through physical activity.
* 🗺️ **Territory Capture & Battles** – Capture neutral sectors or battle rival AI players for contested zones.
* 👤 **User Authentication** – Secure JWT authentication + 1-Click Instant Demo Login mode.
* 📊 **Live Activity Tracking** – Track steps, distance, active time, pace, and calories in real time.
* 🛍️ **Avatar Customization Store** – Unlock 6 unique walker avatars (Blaze, Cyber Bot, Fire Fox, Space Walker, Frost Nova, Legendary).
* 🏆 **Dynamic Global Leaderboards** – Live territory control percentage rankings.
* 🎯 **Daily Challenges & Achievements** – 8k steps, zone claiming, streaks, and badge rewards.
* 💻 **Multi-Platform Support** – Run directly in your Web Browser (Vite/React) or on Mobile (Expo/iOS/Android).

---

## 📋 Prerequisites

Before running the project locally, make sure you have:
* **Node.js** (v18.0.0 or higher) – [Download Node.js](https://nodejs.org/)
* **npm** (comes with Node.js) or **yarn** / **pnpm**
* **Git** installed

---

## ⚡ Quick Start (Run Locally in 2 Steps)

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
npm --prefix backend install

# 3. Install frontend dependencies
npm --prefix frontend install --legacy-peer-deps
```

---

### Step 2: Start the Application

You need two terminal windows:

#### Terminal 1 — Start the Backend API Server:
```bash
npm run server
```
* 🟢 **Backend URL:** `http://localhost:5000`
* 🩺 **Health Check:** `http://localhost:5000/api/health`

#### Terminal 2 — Start the Frontend Web App:
```bash
npm run frontend:web
```
* 🌐 **Frontend URL:** `http://localhost:3000` (Opens in your web browser!)

---

## 🔑 Demo Account Credentials

You can create a new account or use the pre-seeded demo account:

| Field | Demo Credentials |
|---|---|
| **Email** | `demo@fittrack.app` |
| **Password** | `demo123` |

> 💡 **Tip:** You can also click the **"⚡ One-Click Demo Mode"** button on the sign-in screen for instant access!

---

## 📱 Running with Expo Mobile (iOS / Android)

To run the mobile version using Expo:

```bash
# Start Expo development server
npm run frontend

# Or run directly on Android emulator
npm run frontend:android

# Or run on iOS simulator (macOS only)
npm run frontend:ios
```

* Scan the generated QR code using the **Expo Go** app on your physical iPhone or Android device.

---

## 🧪 Running Automated API Tests

To verify that all backend endpoints, territory calculations, authentication, and database features work properly:

```bash
npm run test:api
```

---

## 📂 Project Structure

```
FitTrack-App/
├── 🌐 frontend/              # Frontend Web & Mobile Client (React / Expo)
│   ├── app/                  # File-based routes & tab screens
│   │   ├── (tabs)/           # Tab Navigation (Home, Territory, Track, Shop, Profile)
│   │   │   ├── index.jsx     # Home screen (Stats & Challenges)
│   │   │   ├── territory.jsx # Territory War Canvas
│   │   │   ├── track.jsx     # Live Workout Tracker
│   │   │   ├── shop.jsx      # Avatar Store
│   │   │   └── profile.jsx   # Profile, Badges & Leaderboard
│   │   ├── components/       # UI Components (Map, StatusBar, Avatars, Modals)
│   │   ├── index.jsx         # Auth / Sign In / Sign Up Screen
│   │   └── _layout.jsx       # Root App Layout & Context Provider
│   ├── constants/            # Themes, configurations, badges
│   ├── hooks/                # Custom React hooks (AppContext, Territory, Tracking)
│   ├── services/             # API client (services/api.js)
│   ├── utils/                # Territory calculations
│   ├── index.html            # Web browser entry HTML
│   ├── vite.config.js        # Vite browser bundler configuration
│   ├── tsconfig.json         # Frontend TypeScript config
│   └── package.json          # Frontend dependencies
│
├── ⚙️ backend/               # REST API Server (Node.js & Express)
│   ├── src/
│   │   ├── controllers/      # Auth, User, Territory, Tracking, Shop, Leaderboard
│   │   ├── db/               # Persistent JSON DB engine with auto-seeding
│   │   ├── middleware/       # JWT Auth verification & Error handler
│   │   ├── routes/           # Express router endpoints
│   │   ├── server.js         # Express app entry point
│   │   └── test-api.js       # Automated test suite
│   ├── data/                 # JSON database storage file
│   ├── package.json          # Backend dependencies
│   ├── .env                  # Environment variables
│   └── .gitignore            # Backend ignore rules
│
├── 📜 package.json           # Root workspace script manager
├── 📄 tsconfig.json          # Root TypeScript configuration
├── 🛡️ .gitignore             # Root git ignore
└── 📖 README.md              # Documentation
```

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Sign in with email & password |
| `POST` | `/api/auth/demo` | 1-Click instant demo authentication |
| `GET` | `/api/auth/me` | Fetch currently authenticated user |

### 👤 User Profile (`/api/user`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/profile` | Get user profile, stats, level, coins, badges |
| `PUT` | `/api/user/profile` | Update profile settings, username, avatar |
| `POST` | `/api/user/xp` | Add XP with automatic level-up calculation |
| `POST` | `/api/user/coins` | Update user coin balance |
| `GET` | `/api/user/badges` | List all badges with unlock status |

### 🗺️ Territory War (`/api/territory`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/territory/grid` | Fetch current 17×26 map grid & sector ownership |
| `POST` | `/api/territory/claim` | Claim an adjacent sector or battle an opponent |
| `POST` | `/api/territory/ai-turn` | Trigger AI rival territory expansion |
| `GET` | `/api/territory/stats` | Get territory percentage control breakdown |

### 🏃 Tracking & Workouts (`/api/tracking`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tracking/session` | Save completed workout (steps, distance, time, calories) |
| `GET` | `/api/tracking/history` | Get past workout history & aggregates |
| `POST` | `/api/tracking/step-sync` | Incremental real-time step synchronization |

### 🛍️ Avatar Shop (`/api/shop`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shop/avatars` | List all avatars with pricing and ownership |
| `POST` | `/api/shop/buy` | Purchase an avatar with coins |
| `POST` | `/api/shop/equip` | Equip an owned avatar |

### 🏆 Leaderboard (`/api/leaderboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leaderboard` | Get live rankings of player vs opponents |

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>Port 5000 or 3000 is already in use</b></summary>

* You can change the backend port in `backend/.env` (e.g., `PORT=5001`).
* You can change the frontend port in `frontend/vite.config.js` (e.g., `port: 3001`).
</details>

<details>
<summary><b>How to reset the database?</b></summary>

Run the seed script to reset demo accounts, rival stats, and territory grid:
```bash
npm run backend:seed
```
</details>

---

## 👨‍💻 Author & License

* **Neeraj Chauhan** & FitTrack Team
* Licensed under the **ISC License**.
