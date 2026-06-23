# 🚀 Memorify — Beginner Deployment Guide (Read this FIRST)

You've never deployed a website before — that's fine. This guide explains everything
in plain words and tells you exactly what to ask your client. Follow it top to bottom.

---

## ⚠️ STEP 0 — The most important thing to understand

Your website is **NOT** a simple HTML site. It is two things working together:

1. **The frontend** — the pages people see (built with React).
2. **The backend** — a live program (Node.js) + a database that stores galleries,
   orders, passwords, and talks to Cloudinary and Gmail.

A backend that runs all the time needs a special kind of hosting called a **VPS**
(a small always-on Linux server). **Normal "shared / web hosting" CANNOT run this app.**

👉 **This is the #1 thing to get right.** If the client bought the wrong plan, nothing
else will work, no matter how many steps you follow.

---

## 📩 STEP 1 — What to ASK your client (copy-paste this to them)

You got the "Invitation to collaborate" email and accepted it — good, you now share
their Hostinger account. Now send them this message:

> "Hi! To put the website online I need to know exactly what we have on Hostinger.
> Can you tell me:
> 1. Which Hostinger plan did you buy? (Is it a **VPS**, or is it **Web/Shared
>    Hosting**? The exact plan name is fine — e.g. 'KVM 1', 'Premium Web Hosting'.)
> 2. Is the domain **memorify.ca** added inside this same Hostinger account?
> 3. Do you (or I) have access to the Hostinger control panel (hPanel)?"

**Why this matters:**
- If they say **VPS** (e.g. "KVM 1", "KVM 2") → ✅ perfect, this app will run. Use the
  full technical steps in `DEPLOY-HOSTINGER-VPS.md` (in this same folder).
- If they say **Web Hosting / Shared / Premium / Business Hosting** → ❌ this plan
  alone will NOT run the backend. You have two choices (see Step 2).

---

## 🛤️ STEP 2 — Pick your path based on the plan

### Path A — Client has a VPS (best, recommended)
Everything runs on the one VPS. Follow **`DEPLOY-HOSTINGER-VPS.md`** step by step.
That file is detailed but I've kept the commands copy-paste ready. You'll:
- connect to the server, install Node + Nginx,
- put the code on it, start the backend with PM2,
- build the frontend, point the domain, turn on free HTTPS (the padlock).

### Path B — Client only has Web/Shared Hosting
Shared hosting can host the **frontend** but not the **backend**. The simplest,
**free**, beginner-friendly fix:
- Put the **backend** on a free service made for it: **Render.com** (free tier).
- Put the **frontend** on **Hostinger** (or also on Render/Netlify — all free).
- Point **memorify.ca** at the frontend.

This works and costs nothing extra. If you want, tell me "use Path B" and I'll write
you the exact Render steps and the small config changes needed. (One caveat: Render's
free backend "sleeps" after 15 min idle and takes ~30 sec to wake on the first visit.
For a real business, a cheap paid VPS or Render paid tier avoids that.)

> 💡 My recommendation for a paying client: **Path A (VPS)**. It's the most
> professional, always-on, and keeps everything in one place under your client's account.

---

## 🔑 STEP 3 — Things YOU must have ready before deploying

These are the secret keys the app needs. You already have them in `backend/.env` on
your PC. You'll copy these onto the server (never into GitHub). They are:

| What | Where it comes from | Status |
|------|--------------------|--------|
| Cloudinary Cloud Name / API Key / API Secret | Cloudinary account | ✅ you have it |
| Gmail address + App Password | Memorify.ca@gmail.com | ✅ you have it |
| Domain `memorify.ca` | Client's Hostinger | ⏳ confirm in Step 1 |

⚠️ **Security:** never paste these secret keys into GitHub, chat, or screenshots.
They live only in the server's `.env` file. (You already shared the Cloudinary secret,
Gmail app password, and a database token in chat earlier — it's worth changing/rotating
those once before going live, to be safe.)

---

## 🧭 STEP 4 — The big picture (what "deploying" actually does)

```
   Your PC (code)  ──push──►  GitHub  ──clone──►  The Server (Hostinger VPS)
                                                        │
                                  ┌─────────────────────┴───────────────────┐
                                  │  Backend (Node + database)  →  port 5000 │
                                  │  Frontend (React, built files) → Nginx   │
                                  └─────────────────────┬───────────────────┘
                                                        │
            memorify.ca (domain)  ──DNS points to──►  Server IP  ──►  HTTPS padlock
```

1. Put code on GitHub (one time).
2. Server downloads the code.
3. Start the backend (PM2 keeps it alive 24/7).
4. Build the frontend, let Nginx serve it.
5. Point `memorify.ca` at the server's IP address.
6. Turn on free HTTPS (the 🔒 padlock) with Certbot.

---

## ✅ STEP 5 — After it's live, test these

1. Open `https://memorify.ca` → site loads with a padlock 🔒.
2. `https://memorify.ca/admin/login` → log in `admin` / `memorifymemorify`,
   then **immediately change the password** (⚙ Account button).
3. Create a private gallery, upload photos, use **Copy Link**, open it in another
   browser, enter the code, view + Download All.
4. Open the **Store**, place a test order, check it appears in the admin **Orders** tab.
5. Submit the **Contact** form → confirm the email arrives at the Gmail inbox.

---

## 🆘 If you get stuck

Tell me:
- which plan the client confirmed (VPS or Web Hosting),
- which step number you're on,
- the exact error text or a screenshot.

I'll walk you through that exact spot. **Don't guess on Step 0/1 — get the plan type
confirmed first, then I'll point you to the right path.**
