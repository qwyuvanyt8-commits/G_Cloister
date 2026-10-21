# Google OAuth verification — G_Cloister

Everything below is already live except the two items marked **ACTION**.

| Item | Value | Where |
|---|---|---|
| App name | G_Cloister | Branding page |
| Client ID | `318804389634-noibvjtbo87t14jjs6duou9o8uhivuer.apps.googleusercontent.com` | OAuth client |
| Homepage | `https://gcloister.vercel.app` | Branding → Application home page |
| Privacy policy | `https://gcloister.vercel.app/privacy` | Branding → Privacy policy link |
| Terms of service | `https://gcloister.vercel.app/terms` | Branding → Terms of Service link |
| Authorised domains | `gcloister.vercel.app`, `gcloister-server.onrender.com`, `gcloister.is-a.dev` | Branding → Authorised domains |
| Authorized JS origins | `https://gcloister.vercel.app`, `https://g-cloister-sage.vercel.app` | OAuth client |
| Redirect URI | `https://gcloister-server.onrender.com/api/auth/callback` | OAuth client |
| Support email | `yuvanreddy404@gmail.com` | Branding + Contact page |
| App logo | `branding/gcloister-logo-120.png` (120×120 PNG) | Branding → App logo |
| Demo video | `branding/gcloister-demo.mp4` — upload to YouTube (unlisted is fine) and paste the link | Verification request form |
| Source code | `https://github.com/qwyuvanyt8-commits/G_Cloister` | Verification request form |

## ACTION 1 — flip the app out of Testing

Google Auth Platform → **Audience** → Publishing status → **In production** → Save.

While the app is in *Testing* status, only accounts on the test-user list can sign
in, refresh tokens expire after 7 days, and the consent screen carries the
"this app is currently being tested" notice. In *In production* the app works for
everyone; the only remaining artifact is the unverified-app warning, which
verification removes.

## ACTION 2 — submit the verification request

Google Auth Platform → **Verification** → **Add the request**. Paste the values
below.

### Scope justifications

**`openid`**, **`email`**, **`profile`**
Used only to identify the signed-in person so a room can record who is in it and
so the host panel can show member names. The app stores the Google account ID,
email address and display name, and nothing else from the profile.

**`https://www.googleapis.com/auth/drive.file`**
This is the storage layer of the product. When a user creates a room, the app
creates one folder inside that user's own Google Drive and stores every uploaded
file in it. This scope grants access **only** to files and folders the app itself
created for that user — it cannot read the user's existing Drive content, and the
app has no feature that lists or searches the rest of the Drive. Files are never
downloaded to or cached on our servers: bytes move between the browser and Drive
through the Drive API, and our servers only keep file names, sizes and Drive file
IDs. The access and refresh tokens are encrypted with AES-256-GCM before they are
written to the database.

### Justification narrative (paste as the app description)

> G_Cloister is a free, open-source (MIT), non-commercial file-sharing app. A
> user signs in with Google, creates a "room", and the app creates a single
> dedicated folder inside that user's own Google Drive. Anyone who has the room
> ID and the room password can upload files into that folder and download them
> again; every change is broadcast to everyone in the room over a WebSocket.
>
> The Google Drive `drive.file` scope is required because the Drive folder *is*
> the product's storage — it is where the room's files live, in the host's own
> Drive, not on our servers. The scope is limited to files and folders the app
> created, so G_Cloister cannot and does not access any other file in the user's
> Drive. The `openid`, `email` and `profile` scopes are used solely to identify
> the signed-in user, associate them with the rooms they host or join, and display
> member names in the room UI.
>
> There is no advertising, no analytics, no third-party tracking, no paid tier
> and no resale of data. The full source code is public at
> https://github.com/qwyuvanyt8-commits/G_Cloister, and the privacy policy at
> https://gcloister.vercel.app/privacy describes exactly what is stored and where.

### Demo video

`branding/gcloister-demo.mp4` shows the live app: the landing page, the About
page, the Contact page (support address), the privacy policy and the terms of
service. If Google wants the full flow, record 60–90 seconds of:

1. Clicking **Host a room** → the Google sign-in → returning to the app.
2. Creating a room → the folder appearing in the host's Google Drive.
3. A second browser joining with the room ID and password, then a file being
   dropped and appearing in both windows at once.

Upload it to YouTube (unlisted is fine) and put the link in the verification
request. Keep the video public or unlisted — a private link cannot be reviewed.

## What the user sees until verification lands

After ACTION 1, Google shows the consent screen with the standard
"Google hasn't verified this app" notice and an "Advanced → Go to G_Cloister
(unsafe)" link. The sign-in works, but that extra click is what verification
removes. There is no way to suppress the notice before the review is finished.
