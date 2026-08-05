# Deploying G_Cloister

**Architecture**: Express API on **Fly.io** + Next.js frontend on **Vercel**

---

## Prerequisites

- [Fly.io CLI](https://fly.io/docs/flyctl/install/) (`brew install flyctl`)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) — or use the Vercel dashboard
- A Google Cloud project with OAuth configured (see `.env.example`)

---

## Step 1 — Deploy the Server to Fly.io

### 1a. Install and sign in to Fly.io

```bash
# Install (macOS)
brew install flyctl

# Sign up / log in
fly auth signup   # or: fly auth login
```

### 1b. Launch the app (first time only)

```bash
# From the project root
fly launch --no-deploy
```

This creates the app and a Fly volume for SQLite. The `fly.toml` is already configured.

### 1c. Create the persistent volume (for SQLite data)

```bash
fly volumes create gcloister_data --size 1 --region iad
```

### 1d. Set secrets

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="your_client_secret" \
  GOOGLE_REDIRECT_URI="https://g-cloister.fly.dev/api/auth/callback" \
  SESSION_SECRET="$(openssl rand -base64 32)" \
  ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

### 1e. Deploy

```bash
fly deploy
```

### 1f. Verify

```bash
curl https://g-cloister.fly.dev/api/health
# → {"ok":true,"service":"gcloister","time":...}
```

Your API is now live at **`https://g-cloister.fly.dev`**.

---

## Step 2 — Deploy the Frontend to Vercel

### 2a. Connect your GitHub repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`G_Cloister`)
3. **Set the Root Directory** to `web` (important!)
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://g-cloister.fly.dev` |
5. Click **Deploy**

### 2b. Or deploy via CLI

```bash
cd web
vercel --prod
# When prompted, set the root directory to ./
# Add the env var when asked, or set it after:
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://g-cloister.fly.dev
```

Your frontend is now live at something like **`https://g-cloister.vercel.app`**.

---

## Step 3 — Connect the two services

### 3a. Update Fly.io's FRONTEND_URL

The server needs to know the Vercel URL for CORS and OAuth redirects:

```bash
# Replace with your actual Vercel URL
fly secrets set FRONTEND_URL="https://g-cloister.vercel.app"
```

Or edit `fly.toml` and redeploy:
```toml
[env]
  FRONTEND_URL = "https://g-cloister.vercel.app"
```

### 3b. Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**:

1. Edit your OAuth client ID
2. Add the production callback URL to **Authorized redirect URIs**:
   ```
   https://g-cloister.fly.dev/api/auth/callback
   ```
3. Add your Vercel URL to **Authorized JavaScript origins**:
   ```
   https://g-cloister.vercel.app
   ```

### 3c. Publish the OAuth consent screen (for friends)

Go to **OAuth consent screen**:

- **Option A** (quick): Add each friend's email as a **Test User** (max 100 users, no review needed)
- **Option B** (permanent): Click **Publish App** to make it available to everyone (Google may request a review since you use the `drive.file` scope)

---

## Step 4 — Verify everything works

1. Open your Vercel URL in the browser
2. Sign in with Google
3. Create a room
4. Share the room ID + password with a friend
5. Have them join and upload a file
6. Verify real-time updates work

---

## Custom Domain (Optional)

### For the frontend (Vercel)
- Vercel Dashboard → Project → Settings → Domains → Add your domain

### For the API (Fly.io)
```bash
fly certs create api.yourdomain.com
# Then add a CNAME record: api.yourdomain.com → g-cloister.fly.dev
```

Update `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, and Google OAuth URIs to match.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Not authenticated" after sign-in | Check that `FRONTEND_URL` on Fly.io matches your Vercel URL exactly (no trailing slash) |
| Google OAuth error | Verify redirect URI in Google Console matches `https://g-cloister.fly.dev/api/auth/callback` exactly |
| CORS errors in browser console | Ensure `FRONTEND_URL` is set correctly on Fly.io; redeploy if changed in `fly.toml` |
| Friends can't sign in | Publish the OAuth consent screen or add them as test users |
| WebSocket not connecting | The Socket.IO client uses `NEXT_PUBLIC_API_URL` — make sure it's set to the Fly.io URL |
