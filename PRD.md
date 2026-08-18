# Product Requirement Document (PRD) - G-Cloister 🛡️☁️

---

## 1. Executive Summary

**G-Cloister** is a real-time, room-based file sharing web application powered by Next.js, Express, Socket.IO, and Google Drive API. It enables users to create temporary or persistent password-protected "rooms" to upload, preview, and stream files in real-time across multiple connected devices without requiring expensive cloud storage infrastructure. Files land directly in the room host's Google Drive (under the `G_Cloister/<roomId>` folder) using the scoped `https://www.googleapis.com/auth/drive.file` permission.

---

## 2. Target Audience & Core Value Proposition

- **Target Audience**: Teams, collaborators, educators, and individuals needing instant, zero-friction file sharing with real-time updates and cloud backing.
- **Value Proposition**:
  - **Zero Storage Overhead**: Storage is hosted on the user's existing Google Drive account.
  - **Real-Time Collaboration**: Uploads, deletes, member presences, and room actions stream instantly via WebSockets (Socket.IO).
  - **Privacy & Security**: Restricted Google Drive OAuth scope (`drive.file`), AES-256-GCM token encryption at rest, bcrypt password hashing.

---

## 3. User Roles & Authentication

| Role | Description & Permissions |
| :--- | :--- |
| **Unauthenticated Visitor** | Can view the landing page (`/`), sign in via Google OAuth 2.0, or enter room join pages. |
| **Room Host** | Authenticated Google user who created the room (`/host`). Retains administrative control: manages room storage limit, views member list, kicks/unkicks members, deletes room files, and purges room Drive folders. |
| **Room Member** | Authenticated user who joined an existing room (`/join` or `/room/[roomId]`) with the correct password. Can upload files, download files, preview supported files, view active member presences, and optionally sync room files to their own Google Drive. |

---

## 4. Key Functional Modules & Features

### 4.1 Authentication & Session Management
- **Google OAuth 2.0 Integration**: Single Sign-On using Google accounts requesting `openid`, `email`, `profile`, and `https://www.googleapis.com/auth/drive.file` scopes.
- **Token Security**: OAuth access and refresh tokens are encrypted at rest in SQLite/LibSQL using `AES-256-GCM`.
- **Session Handling**: Express session cookies with `bcrypt` password protection for rooms.

### 4.2 Room Creation (`/host`)
- **Room ID Assignment**: Auto-generated or custom human-readable room ID.
- **Password Protection**: Optional/required room password, hashed with `bcrypt` before storage.
- **Storage Quota**: Configurable room file storage limit (e.g., 100 MB, 500 MB, 1 GB, 5 GB).
- **Google Drive Initialization**: Automatically creates a dedicated `G_Cloister/<roomId>` folder inside the host's Google Drive.

### 4.3 Room Discovery & Joining (`/join`)
- **Direct Link Joining**: Users can join via URL query params (`/join?room=<roomId>&pw=<password>`).
- **Manual Password Gate**: Users attempting to access `/room/[roomId]` without session credentials are presented with a password modal.

### 4.4 Real-Time Room Workspace (`/room/[roomId]`)
- **Drag-and-Drop Dropzone**: Interactive upload dropzone supporting multi-file uploads with visual progress bars.
- **Real-Time WebSocket Sync**: Instant event broadcasting for:
  - `file:added`: Broadcaster adds new file item to grid.
  - `file:deleted`: File card removed live across all member screens.
  - `file:updated`: Live rename updates.
  - `member:presence`: Online/offline status indicators for active participants.
  - `member:kicked`: Redirects kicked members out of the room immediately.
  - `usage:updated`: Live storage bar update based on current room usage.
- **File Management & Preview**:
  - Grid view of shared files with type icons (PDF, Image, Video, Code, Archive, Text).
  - Preview Modal for supported file types (Images, PDFs, Audio, Video, Code) using temporary 15-minute Google Drive preview URLs.
  - One-click file download.
  - File deletion (allowed by file uploader or room host).
- **Invite Link Generator**: Copyable invite link with pre-filled password query parameter option.

### 4.5 Participant Google Drive Auto-Sync
- Room participants can click **"Save to Drive"** to automatically replicate all room files into a `G_Cloister/<roomId>` directory in their personal Google Drive storage.

### 4.6 Host Moderation & Admin Control
- Live participant stack showing member status (Online, Host, Kicked).
- Host can click on a member to:
  - **Kick Member**: Instantly revokes room access and disconnects WebSocket connection.
  - **Unkick Member**: Restores room access rights.
  - **Purge Room Folder**: Deletes the room folder from Google Drive and removes the room database record.

---

## 5. Primary End-to-End User Flows for Automated Testing

### Flow 1: Host Room Creation & Configuration
1. User navigates to `/` and clicks **"Get Started"** or **"Host Room"**.
2. User authenticates via Google OAuth 2.0 flow.
3. User navigates to `/host` dashboard.
4. User enters Room ID (e.g., `test-room-101`), sets a password (e.g., `Pass123!`), selects a 500 MB storage limit, and clicks **"Create Room"**.
5. **Expected Result**: User is redirected to `/room/test-room-101` as Host (`Crown` badge visible), and a `G_Cloister/test-room-101` folder is initialized in Google Drive.

### Flow 2: Member Password Authentication & Room Entrance
1. Unauthenticated or secondary user navigates to `/join` or receives direct link `/room/test-room-101`.
2. App detects user is not a room member and displays the **"Enter password for /test-room-101"** modal.
3. User enters incorrect password `wrongpass` and submits.
4. **Expected Result**: Error toast "Invalid room password" is displayed.
5. User enters valid password `Pass123!` and submits.
6. **Expected Result**: User gains access to `/room/test-room-101`, and the host's live member list updates to reflect the new member.

### Flow 3: Real-Time Multi-File Drag-and-Drop Upload
1. Room member drops single or multiple files (e.g., `document.pdf`, `image.png`) onto the `/room/test-room-101` dropzone.
2. Upload progress bar displays real-time progress percentages.
3. Upon completion, `file:added` WebSocket event broadcasts to all connected clients.
4. **Expected Result**: File cards appear instantly on all connected users' screens without page refresh. The storage usage bar updates proportionally.

### Flow 4: Storage Quota Limit Enforcement
1. Room host sets room storage limit to 10 MB.
2. Room member attempts to upload a 20 MB file (`large_video.mp4`).
3. **Expected Result**: Frontend blocks upload or backend API returns `400 Bad Request` with message "Upload exceeds room storage limit". Error toast is displayed on the client.

### Flow 5: File Preview & Download
1. User clicks on a file card (`sample_image.png`) in the file grid.
2. Modal opens displaying the image preview via Google Drive preview stream.
3. User clicks **"Download"**.
4. **Expected Result**: Browser initiates file download directly from backend/Drive stream.

### Flow 6: Host Moderation (Member Kick & Real-Time Eviction)
1. Host views the member stack and selects Member B.
2. Host clicks **"Kick Member"**.
3. Server emits `member:kicked` event for Member B's user ID.
4. **Expected Result**: Member B's browser instantly displays error toast "You have been kicked from this room by the host" and redirects to `/home`. Host's member stack marks Member B as kicked.

### Flow 7: Participant Drive Sync
1. Member B clicks **"Save to Drive"** inside room `/room/test-room-101`.
2. App checks Google Drive OAuth permissions. If absent, prompts user with Drive permission modal.
3. Upon granting permission, server copies room files to Member B's Google Drive (`G_Cloister/test-room-101`).
4. **Expected Result**: Toast confirms "Saved X files to your Google Drive under G_Cloister / test-room-101."

---

## 6. Technical Stack & Environmental Requirements

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS v4, Framer Motion, Phosphor Icons, Zustand.
- **Backend**: Node.js v20/v22, Express 4.21, Socket.IO 4.8.
- **Database**: SQLite / LibSQL (Turso Cloud Database client `@libsql/client`).
- **Integrations**: Google Cloud Console API (`google-api-nodejs-client` - `googleapis` Drive API v3).
- **Security**: `AES-256-GCM` token encryption, `bcrypt` password hashing, HTTPS enforced in production.

---

## 7. Key Assertion Criteria for TestSprite Automated Test Suites

- **HTTP Status Codes**: `200 OK` for valid API routes (`/api/rooms/...`), `401 Unauthorized` for missing auth, `403 Forbidden` for invalid room passwords/kicked status, `404 Not Found` for invalid room IDs.
- **DOM Elements**: 
  - Host Room Form (`input[placeholder="Room ID"]`, `input[type="password"]`, `select[name="storageLimit"]`).
  - Room Page Header (`h1` containing `/<roomId>`, `Crown` host badge, connection status indicator `Live`).
  - Dropzone (`div` with drag-and-drop dropzone triggers).
  - File Grid (`div` rendering file items with uploader name and timestamp).
- **WebSocket Behavior**: Confirm bi-directional event emission on file add, delete, rename, presence, and kick.
