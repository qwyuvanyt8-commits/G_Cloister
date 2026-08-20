# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router (React, TypeScript, Tailwind v4, Motion), Node socket.io realtime server, Google Drive API (`drive.file` scope), bcrypt room passwords, AES-256-GCM token encryption, 15-minute self-revoking share links.

## Users

Hosts and members working in small private groups (teams, friends, collaboratives) who want to move files between each other in real time without renting cloud storage. The host "donates" a folder inside their own Google Drive; members join by room ID + password. The room content in the product is modeled on creative/collaborative file drops (video, design files, PDFs, zips).

## Product Purpose

G_Cloister creates private, password-locked "file rooms". Anyone with the room code drops up to 5 GB of files; every upload streams to all open screens in real time and lands in a dedicated folder inside the host's Google Drive. Why it exists: private real-time file swapping with no storage bill, because the host already owns the space.

## Positioning

The mechanism no neighbor can truthfully copy: each room's storage is a folder inside the *host's own Google Drive*, with real-time sync to every member — free, private, and revocable by the host at any time.

## Operating Context

- Host flow: sign in with Google → pick a room ID → set a password → a dedicated G_Cloister folder is created in the host's Drive.
- Member flow: enter room ID + password → join → drop files.
- Room runtime: live presence of members, real-time file sync, host panel with kick/re-admit, limits, and folder purge.
- Privacy model: the app holds only `drive.file` access (sees only the folder it creates); revoking Drive access removes everything (the stated privacy policy).

## Capabilities and Constraints

- Rooms: ID + password, 5 GB per room, real-time streaming to every open screen.
- Storage: host's Google Drive folder, `drive.file` scope only.
- Security: bcrypt-hashed room passwords, AES-256-GCM at rest, 15-minute self-revoking preview links.
- Host controls: kick/re-admit members, limits, purge folder.
- No storage bill; free to host.
- Web application with authenticated app routes: `/home`, `/host`, `/join`, `/room/[roomId]`.
- Terminology used across product: room, host, member, room code / password, Drive, scriptorium-style room names.

## Brand Commitments

- Name: G_Cloister (styled "G_/CLOISTER", logotype `G_` in a cobalt tile + CLOISTER).
- Voice: direct, plain-spoken, craft-oriented; mono uppercase labels and short declarative claim lines.
- Approved visual identity (user-pinned, Prototype F): near-black ground (`#0b0d12`), cream ink (`#f4f6f9`), cobalt block accent (deep cobalt `#1e3bf3`/`#4456e8`), monospaced details, one marquee strip, oversized black display type, grid/editorial-graphic-studio composition. Dark-only; the light theme and theme toggle are removed.
- Public landing CTA: "Host a room" (Google sign-in) and "Join with a code"; both open the existing auth/join flow.
- Source link: github.com/qwyuvanyt8-commits/G_Cloister.

## Evidence on Hand

- Public landing copy and product mechanics in `web/src/app/page.tsx` and `web/src/app/prototypes/*` (Prototype F is the approved direction).
- Working authenticated flows in `web/src/app/home/page.tsx`, `host`, `join`, `room/[roomId]`.
- Design tokens in `web/src/app/globals.css`.
- No testimonials, customers, benchmarks, or press exist; future work must not fabricate them.

## Product Principles

1. Privacy is non-negotiable and stated plainly: the app cannot see what it does not create.
2. The host's own Drive is the product's storage; no rented cloud, ever.
3. Real time is a promise: every screen sees the same room at the same moment.
4. The interface earns its craft — premium materials, no decorative noise.
5. One world, one identity: the approved dark cobalt "graphic studio" system applies across landing and app screens.

## Accessibility & Inclusion

No product-specific accessibility requirement was established beyond the repo baseline: focus-visible styling, `prefers-reduced-motion` handling, color contrast on interactive surfaces.