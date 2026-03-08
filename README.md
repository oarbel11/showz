# ShowZ — Social Network for Entertainment Professionals 🎬

A full-stack social networking platform built for actors, directors, producers, and entertainment industry professionals in Israel. Features real-time chat, job board, user profiles, and professional discovery.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Node.js + Express |
| **Database** | SQLite (via sql.js — zero setup) |
| **Real-time** | Socket.IO |
| **Auth** | JWT + bcrypt |

## Features

- 🔐 **Authentication** — Register & login with email/password (JWT tokens)
- 👤 **User Profiles** — Edit bio, skills, location, showreel, avatar upload
- 🎬 **Job Board** — Post and browse casting calls, auditions, gigs with category filters
- 💬 **Real-time Chat** — Direct messaging between users via Socket.IO
- 🔍 **Discover** — Search and browse other professionals, filter by role
- 📱 **Responsive** — Works on desktop and mobile
- 🌍 **RTL** — Full Hebrew right-to-left support

## Prerequisites

- **Node.js** v18+ installed ([download](https://nodejs.org))

## Quick Start

### 1. Install dependencies

Open a terminal in the project root:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Start the backend server

```bash
cd server
npm start
```

The server will start on **http://localhost:5000**.

### 3. Start the frontend dev server

Open a **new terminal** window:

```bash
cd client
npm run dev
```

The app will open on **http://localhost:5173**.

### 4. Use the app

1. Open **http://localhost:5173** in your browser
2. Click **"הירשם עכשיו"** (Register) to create a new account
3. Fill in your name, email, password, and select your role
4. Start exploring: edit your profile, post jobs, discover colleagues, chat!

## Project Structure

```
ShowZ-Final V/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── Navbar.jsx
│   │   ├── context/         # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Discover.jsx
│   │   ├── services/        # API client
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app with auth routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind + custom styles
│   ├── vite.config.js       # Vite config with API proxy
│   └── package.json
├── server/                  # Node.js backend
│   ├── config/
│   │   └── db.js            # SQLite database setup
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js          # Login/Register/Me
│   │   ├── users.js         # Profile CRUD + avatar
│   │   ├── jobs.js          # Job board CRUD
│   │   └── chat.js          # Conversations & messages
│   ├── uploads/             # User-uploaded files
│   ├── server.js            # Express + Socket.IO entry
│   ├── .env                 # Environment variables
│   └── package.json
├── showz.db                 # SQLite database file (auto-created)
└── README.md
```

## Environment Variables

The server uses a `.env` file in the `server/` directory:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `JWT_SECRET` | (pre-set) | JWT signing secret — **change in production!** |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | List/search users |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update profile |
| POST | `/api/users/:id/avatar` | Upload avatar |
| GET | `/api/jobs` | List/search jobs |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/chat/conversations` | List chats |
| POST | `/api/chat/conversations` | Start chat |
| GET | `/api/chat/conversations/:id/messages` | Get messages |
| POST | `/api/chat/conversations/:id/messages` | Send message |
