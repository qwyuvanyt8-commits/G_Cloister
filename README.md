# G_Cloister 🛡️☁️

> **Real-time, room-based file sharing powered by your own Google Drive.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio)](https://socket.io/)
[![SQLite / LibSQL](https://img.shields.io/badge/Database-SQLite%2FLibSQL-003B57?logo=sqlite)](https://turso.tech/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**G_Cloister** allows users to create password-protected, real-time file sharing "rooms" without needing expensive third-party file hosting or cloud subscriptions. Storage is hosted directly on the room creator's Google Drive via the official Google Drive API (`drive.file` scope).

---

## 🌟 Key Features

- 🔐 **Password-Protected Rooms**: Every room has an auto-generated (or custom) password, hashed with `bcrypt` before storage.
- ⚡ **Real-Time Synchronization**: Uploads, deletes, renames, member presences, and kicks stream instantly across all active clients via Socket.IO.
- 📁 **Google Drive Native**: Files land in a dedicated `G_Cloister/<roomId>` folder inside the host's Google Drive.
- 🔄 **Participant Auto-Sync**: Room members can opt to automatically sync room files directly into their own Google Drive account with zero friction.
- 🛡️ **Host Moderation**: Room hosts retain full authority to manage room storage limits, kick/unkick members, and purge room folders from Google Drive.
- 🔒 **Zero-Knowledge Token Security**: Google OAuth access and refresh tokens are encrypted at rest using AES-256-GCM.
- 🎨 **Modern Minimalist UI**: Dark-mode glassmorphic interface built with Next.js App Router, TailwindCSS v4, Framer Motion, and Phosphor Icons.

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────┐
                        │     Next.js 16 Web Frontend     │
                        │    (Vercel / Next.js Server)    │
                        └────────────────┬────────────────┘
                                         │ REST API / WebSockets
                                         ▼
                        ┌─────────────────────────────────┐
                        │     Express & Socket.IO API     │
                        │       (Render / Node.js)        │
                        └───────┬─────────────────┬───────┘
                                │                 │
               OAuth 2.0 &      │                 │ Local SQLite / LibSQL
               Drive API v3     ▼                 ▼
             ┌─────────────────────┐    ┌────────────────────┐
             │  Google Drive API   │    │  SQLite Database   │
             │  (Host's Storage)   │    │  (Users, Sessions, │
             └─────────────────────┘    │   Rooms, Files)    │
                                        └────────────────────┘
```

---

## 📁 Repository Structure

```
G_Cloister/
├── server/                   # Express backend API & Socket.IO server
│   ├── src/
│   │   ├── auth.js           # OAuth 2.0 authentication & session handling
│   │   ├── config.js         # Environment configuration & validation
│   │   ├── crypto.js         # AES-256-GCM token encryption/decryption
│   │   ├── db.js             # LibSQL / SQLite schema & database operations
│   │   ├── drive.js          # Google Drive API v3 file operations & sync engine
│   │   ├── index.js          # Express app entrypoint & middleware
│   │   ├── rooms.js          # REST API endpoints for rooms and files
│   │   └── socket.js         # Real-time WebSocket event handlers
│   ├── Dockerfile            # Container definition for Fly.io backend deployment
│   └── package.json
│
├── web/                      # Next.js 16 App Router frontend
│   ├── src/
│   │   ├── app/              # Routes: /, /home, /host, /join, /room/[roomId]
│   │   ├── components/       # UI components & room views
│   │   └── lib/              # API client, WebSocket client, Zustand state store
│   ├── Dockerfile            # Container definition for frontend deployment
│   └── package.json
│
├── .env.example              # Template environment variables
├── DEPLOY.md                 # Step-by-step production deployment guide (Render + Vercel)
├── render.yaml               # Render Blueprint deployment config
└── package.json              # Root monorepo scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or v22 LTS
- **npm**: v10+
- **Google Cloud Console Account**: For OAuth 2.0 credentials.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/qwyuvanyt8-commits/G_Cloister.git
cd G_Cloister
```

---

### Step 2: Set Up Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `G_Cloister`).
3. Enable the **Google Drive API** under **APIs & Services > Library**.
4. Configure the **OAuth Consent Screen**:
   - User Type: **External**
   - Add scopes: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/drive.file`
   - Add your email address as a **Test User**.
5. Create **OAuth 2.0 Client ID Credentials**:
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:4000/api/auth/callback`
   - Authorized JavaScript origins: `http://localhost:3000`
6. Save your **Client ID** and **Client Secret**.

---

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Fill in your secrets in `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./data/gcloister.db
SESSION_SECRET=a_very_long_random_string_for_session_cookies
ENCRYPTION_KEY=your_base64_32_byte_key
```

> 💡 **Generating Encryption Keys**:
> Generate a secure 32-byte base64 string for `ENCRYPTION_KEY`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

---

### Step 4: Install Dependencies & Run Locally

Install all monorepo dependencies:

```bash
npm install
npm --prefix server install
npm --prefix web install
```

Start both the backend server and frontend web app concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

---

## 🔒 Security & Privacy Architecture

1. **Restricted OAuth Scope**: G_Cloister uses `https://www.googleapis.com/auth/drive.file`. It can **only** view and manage files and folders created by the app itself. It has zero access to the user's personal Google Drive files.
2. **Encrypted Token Storage**: OAuth access tokens and refresh tokens are encrypted in SQLite using `AES-256-GCM` before being written to disk.
3. **Password Security**: Room passwords are never saved in plaintext; they are hashed with `bcrypt`.
4. **Temporary Preview Links**: Direct Google Drive view links generated for preview modals expire after 15 minutes and permissions are automatically revoked.

---

## 📦 Production Deployment Guide

Deploy G_Cloister in production using **Render** for the Express backend API and **Vercel** for the Next.js frontend web app.

---

### Step 1: Deploy Backend API to Render

#### Method A: Automatic Deployment using Render Blueprint (Recommended)

1. Fork or push this repository to your GitHub account.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → Select **Blueprint**.
4. Connect your GitHub repository (`G_Cloister`).
5. Render will automatically detect `render.yaml` and configure the `gcloister-server` Web Service.
6. Provide required environment variables when prompted:
   - `GOOGLE_CLIENT_ID`: Your Google Cloud OAuth Client ID.
   - `GOOGLE_CLIENT_SECRET`: Your Google Cloud OAuth Client Secret.
   - `GOOGLE_REDIRECT_URI`: `https://<your-render-app>.onrender.com/api/auth/callback`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
7. Click **Apply**.

#### Method B: Manual Web Service Creation

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `gcloister-server`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./server/Dockerfile`
4. Add the required **Environment Variables**:
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
   - `DATABASE_PATH`: `/var/data/gcloister.db`
   - `GOOGLE_CLIENT_ID`: `your_client_id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `your_client_secret`
   - `GOOGLE_REDIRECT_URI`: `https://<your-render-app>.onrender.com/api/auth/callback`
   - `SESSION_SECRET`: Long random string
   - `ENCRYPTION_KEY`: 32-byte base64 string
5. Under **Advanced** → **Add Disk**:
   - **Name**: `gcloister_data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`
6. Click **Create Web Service**.

> 🔍 **Verify Backend Deployment**:
> Test your live API endpoint:
> ```bash
> curl https://<your-render-app>.onrender.com/api/health
> # Output: {"ok":true,"service":"gcloister","time":...}
> ```

---

### Step 2: Deploy Frontend Web App to Vercel

#### Method A: Via Vercel Dashboard (Recommended)

1. Sign in to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository (`G_Cloister`).
3. Set **Root Directory** to `web` (Important!).
4. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://<your-render-app>.onrender.com`
5. Click **Deploy**.

#### Method B: Via Vercel CLI

```bash
cd web
vercel --prod
```
When prompted, set:
- **Root Directory**: `./`
- **NEXT_PUBLIC_API_URL**: `https://<your-render-app>.onrender.com`

---

### Step 3: Connect Services & Finalize Google OAuth

1. **Update Render `FRONTEND_URL`**: Set `FRONTEND_URL` in your Render Web Service settings to match your live Vercel URL (e.g. `https://g-cloister.vercel.app`).
2. **Update Google Cloud Console Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
   - Edit your OAuth Client ID.
   - Add to **Authorized redirect URIs**:
     ```
     https://<your-render-app>.onrender.com/api/auth/callback
     ```
   - Add to **Authorized JavaScript origins**:
     ```
     https://<your-vercel-app>.vercel.app
     ```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
