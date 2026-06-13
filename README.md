Memorify — explained simply
Think of it as a private online photo album delivery service for a photo-booth / photography business. Instead of emailing huge files or sharing a public link anyone can open, each client gets their own locked photo page that only they can unlock with a secret code.

Here's the whole thing in plain words.

🧑‍💼 The Admin side (you / the business)
You log into a private dashboard and, for each client, you:

Create a gallery and type the client's name (e.g. "Sarah & Ahmed's Wedding").
Set a secret access code (like a password) for that gallery.
Upload their photos and videos (drag and drop, many at once).
Click "Copy Link" — this gives you a link to send the client over WhatsApp/email.
You can also see all your galleries in one place, delete old ones, and change your own admin username/password.

👰 The Customer side (your client)
The client opens the link you sent them.
They see a "Private Gallery" page asking for the access code — no photos are visible yet.
They type the code you gave them.
If it's correct, their photos appear in a clean, phone-friendly grid.
They can download one photo at a time, or hit "Download All" to get everything in a single ZIP file.
If the code is wrong, they see nothing. Each gallery also expires after a set time and cleans itself up automatically.

🔒 Why it's safe (the important part)
The access code is scrambled (hashed) before it's stored, so even you can't read it back from the database.
The photos are stored on Cloudinary (a professional image service) as private files — they can only be viewed through a special temporary link that's handed out after the correct code is entered. If someone copies a photo's web address and shares it, it stops working shortly after.
There's brute-force protection: if someone keeps guessing wrong codes, they get blocked for a while.
Admin logins stay secure and expire automatically, and changing your password instantly logs out any other device.
🧩 What it's built with (simple version)
Part	What it is	Job
Frontend	The website pages people see (React)	Looks nice, handles clicks, shows the photos
Backend	The behind-the-scenes brain (Node + Express)	Checks codes, controls who sees what
Database	A small file (SQLite)	Remembers galleries, codes, photo records
Cloudinary	An online photo vault	Safely stores the actual images & videos
📦 Where things stand right now
✅ Everything is built, tested, and working on your computer (both the admin and customer sides).
✅ Connected to your real Cloudinary account.
✅ Safely backed up on GitHub (without any passwords or secrets).
⏳ Not yet live on the internet — that's the last step (the hosting decision we were discussing: free Oracle Cloud, free Render+Netlify, or a cheap ~$4/mo VPS).
