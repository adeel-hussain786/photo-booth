# 🆓 Memorify — Free Deployment Guide (Render + Hostinger + Turso)

This is the **zero-extra-cost** setup. Your client's Hostinger **Premium** plan is used
for the website pages; the backend runs free on Render; the database is free on Turso;
photos stay on Cloudinary. A free uptime pinger keeps the backend awake 24/7.

```
   memorify.ca  →  Hostinger Premium  (frontend: the pages people see)
                          │  calls the API
                          ▼
   Render.com (free)  →  Backend (Node.js)  →  Turso (free database)
                          │
                          ▼
                     Cloudinary (photos)
```

✅ Already done for you in the code:
- The database now uses **Turso** (persistent on free hosting). Verified working.
- Backend auto-detects Turso from environment variables.

---

## Phase 1 — Put the code on GitHub (one time)
Render installs your code from GitHub. From your PC, in the project root:
```
git add .
git commit -m "Turso DB + free deploy ready"
git push
```
> ⚠️ Your secrets in `backend/.env` are **gitignored** — they will NOT be uploaded.
> That's correct. We'll type the secret values into Render's dashboard instead.

---

## Phase 2 — Deploy the BACKEND on Render (free)
1. Go to **https://render.com** → sign up (use GitHub login — easiest).
2. Click **New +** → **Web Service**.
3. Connect your GitHub and pick the **photo-booth** repository.
4. Fill the settings:
   - **Name:** `memorify-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** **Free**
5. Scroll to **Environment Variables** → add each of these (key → value):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `FRONTEND_ORIGIN` | `https://memorify.ca,https://www.memorify.ca` |
   | `TURSO_DATABASE_URL` | (from your backend/.env) |
   | `TURSO_AUTH_TOKEN` | (make a FRESH one — see note below) |
   | `CLOUDINARY_CLOUD_NAME` | `da7fjzvsb` |
   | `CLOUDINARY_API_KEY` | (from backend/.env) |
   | `CLOUDINARY_API_SECRET` | (from backend/.env) |
   | `EMAIL` | `Memorify.ca@gmail.com` |
   | `PASSWORD` | (Gmail app password from backend/.env) |

   > 🔐 **Fresh Turso token:** before going live, go to app.turso.tech → your database →
   > create a new auth token, paste THAT here, and revoke the old one. (The old token was
   > shown in plain chat, so treat it as public.)

6. Click **Create Web Service**. Wait ~2–3 min for it to build.
7. When done, Render gives you a URL like **`https://memorify-api.onrender.com`**.
   Test it: open `https://memorify-api.onrender.com/api/products` in your browser —
   you should see the 7 products as JSON. ✅ Backend is live.

> 📌 **Copy that Render URL** — you need it in the next phase.

---

## Phase 3 — Build the FRONTEND and put it on Hostinger
On your PC:
1. In `photo-booth-frontend/`, create a file named `.env` with one line
   (use YOUR Render URL):
   ```
   VITE_API_URL=https://memorify-api.onrender.com
   ```
2. Build it:
   ```
   cd photo-booth-frontend
   npm install
   npm run build
   ```
   This creates a **`dist`** folder — that's your finished website.

3. Upload `dist` to Hostinger:
   - hPanel → **Websites** → your site → **File Manager**.
   - Open the **`public_html`** folder. Delete any default files inside it.
   - Upload **everything INSIDE the `dist` folder** (the `index.html` and the
     `assets` folder) into `public_html`. (Upload the contents, not the `dist` folder itself.)

4. **Important for React routing** — create a file so deep links (like `/store`,
   `/admin/login`) don't 404. In `public_html`, make a file named **`.htaccess`** with:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
   (A copy of this file is in `deploy/.htaccess` — you can just upload that.)

---

## Phase 4 — Point memorify.ca at Hostinger
If the domain is already inside this Hostinger account and attached to the website,
it usually works automatically. If not:
- hPanel → **Domains** → make sure **memorify.ca** points to this hosting.
- Hostinger gives free SSL — enable it under **Security → SSL** so you get the 🔒 padlock.

---

## Phase 5 — Keep the free backend awake (no more "sleeping")
Render's free backend sleeps after 15 min idle. A free pinger fixes it:
1. Go to **https://uptimerobot.com** → sign up (free).
2. **Add New Monitor** → type **HTTP(s)**.
3. URL: `https://memorify-api.onrender.com/api/products`
4. Monitoring interval: **5 minutes**.
5. Save. Now the backend gets a tap every 5 min and never falls asleep. ✅

---

## Phase 6 — Final test (do all of these)
1. Open `https://memorify.ca` → site loads with padlock 🔒.
2. `https://memorify.ca/admin/login` → log in `admin` / `memorifymemorify` →
   click ⚙ Account → set a strong new password.
3. Create a private gallery → upload a photo → **Copy Link** → open in another browser →
   enter the code → view + **Download All**.
4. Open **Store** → place a test order → confirm it shows in admin **Orders**.
5. Submit the **Contact** form → confirm the email arrives in the Gmail inbox.

---

## Updating the site later
- **Backend change:** `git push` → Render auto-rebuilds. Nothing else to do.
- **Frontend change:** `npm run build` again → re-upload `dist` contents to `public_html`.

## Notes / limits of the free setup
- Render free has limited monthly hours but is plenty for one small site with the pinger.
- If the business grows or you want guaranteed always-on with no pinger, upgrade Render
  to its cheapest paid tier, or move everything to a Hostinger VPS later
  (guide: `DEPLOY-HOSTINGER-VPS.md`). No code changes needed — same app.
