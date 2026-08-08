# Deploying G_Cloister

**Architecture**: Express API on **Render** + Next.js frontend on **Vercel**

---

## Prerequisites

- [Render Account](https://render.com)
- [Vercel Account](https://vercel.com) (or Vercel CLI)
- A Google Cloud project with OAuth configured (see `.env.example`)

---

## Step 1 — Deploy the Server to Render

### Option A: Deploy via Render Blueprints (Recommended)

1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Blueprint**.
3. Connect your GitHub repository (`G_Cloister`).
4. Render will automatically detect `render.yaml` and configure the `gcloister-server` Web Service.
5. In the environment variables setup step, enter your secrets:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `GOOGLE_REDIRECT_URI`: `https://<your-render-app>.onrender.com/api/auth/callback`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
6. Click **Apply**.

---

### Option B: Deploy via Render Dashboard (Manual)

1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
2. Connect your GitHub repository (`G_Cloister`).
3. Set the following fields:
   - **Name**: `gcloister-server`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./server/Dockerfile`
   - **Region**: Choose closest to your users
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `PORT` | `4000` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `DATABASE_PATH` | `/var/data/gcloister.db` |
   | `GOOGLE_CLIENT_ID` | `your_google_client_id` |
   | `GOOGLE_CLIENT_SECRET` | `your_google_client_secret` |
   | `GOOGLE_REDIRECT_URI` | `https://your-render-app.onrender.com/api/auth/callback` |
   | `SESSION_SECRET` | `random_long_string` |
   | `ENCRYPTION_KEY` | `base64_32_byte_string` |

5. Under **Advanced** -> **Add Disk**:
   - **Name**: `gcloister_data`
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB
6. Click **Create Web Service**.

---

### Verify Server Deployment

```bash
curl https://your-render-app.onrender.com/api/health
# → {"ok":true,"service":"gcloister","time":...}
```

Your API is now live at `https://your-render-app.onrender.com`.

---

## Step 2 — Deploy the Frontend to Vercel

### 2a. Connect your GitHub repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`G_Cloister`)
3. **Set the Root Directory** to `web` (important!)
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-render-app.onrender.com` |
5. Click **Deploy**

---

### 2b. Or deploy via CLI

```bash
cd web
vercel --prod
```

When prompted:
- Root directory: `./`
- Environment variable `NEXT_PUBLIC_API_URL`: `https://your-render-app.onrender.com`

Your frontend is now live at `https://your-app.vercel.app`.

---

## Step 3 — Connect the Services & Google OAuth

### 3a. Update Render's `FRONTEND_URL`

Ensure `FRONTEND_URL` in your Render Web Service environment settings matches your Vercel URL exactly:
```
https://your-app.vercel.app
```

### 3b. Update Google OAuth URIs

Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**:

1. Edit your OAuth client ID
2. Add the production callback URL to **Authorized redirect URIs**:
   ```
   https://your-render-app.onrender.com/api/auth/callback
   ```
3. Add your Vercel URL to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```

---

## Step 4 — Verify End-to-End

1. Open your Vercel URL in the browser.
2. Sign in with Google.
3. Create a room.
4. Share the room ID + password with another user.
5. Have them join and upload a file.
6. Verify real-time updates work via WebSockets.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Not authenticated" after sign-in | Check that `FRONTEND_URL` on Render matches your Vercel URL exactly (no trailing slash) |
| Google OAuth error | Verify redirect URI in Google Console matches `https://your-render-app.onrender.com/api/auth/callback` |
| CORS errors in browser console | Ensure `FRONTEND_URL` is set correctly on Render |
| WebSocket not connecting | Ensure `NEXT_PUBLIC_API_URL` on Vercel is set to your Render URL (`https://your-render-app.onrender.com`) |
