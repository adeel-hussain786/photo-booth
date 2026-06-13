# Deploying memorify.ca on a Hostinger VPS

One Ubuntu VPS runs everything: the React frontend (served by Nginx) and the
Node/Express backend (kept alive by PM2), all under https://memorify.ca.

Replace `SERVER_IP` with your VPS IP throughout. Run commands one line at a time.

---

## Phase 1 — Buy & set up the VPS
1. Hostinger → VPS → **KVM 1** plan.
2. OS template: **Ubuntu 22.04 64-bit** (no control panel).
3. Location: a US / North America datacenter.
4. Note the **server IP** and **root password** Hostinger gives you.

## Phase 2 — Point the domain at the VPS
In your domain's DNS settings (Hostinger hPanel → Domains → DNS, or your registrar):
- **A record:** Host `@`   → Points to `SERVER_IP`
- **A record:** Host `www` → Points to `SERVER_IP`

DNS can take 5 minutes to a few hours. Check with: https://dnschecker.org (search `memorify.ca`).

## Phase 3 — Connect to the server
From your Windows PowerShell:
```
ssh root@SERVER_IP
```
Type `yes` if asked, then the root password. (Or use Hostinger's "Browser terminal".)

## Phase 4 — Install the software stack
```
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx
npm install -g pm2
```
Verify: `node -v` should print v20.x.

## Phase 5 — Get the code onto the server
First push your code to GitHub from your PC (one time):
```
git init
git add .
git commit -m "Deploy memorify"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/photo-booth.git
git push -u origin main
```
Then on the server:
```
mkdir -p /var/www/memorify
cd /var/www/memorify
git clone https://github.com/YOUR-USERNAME/photo-booth.git .
```

## Phase 6 — Configure & start the backend
```
cd /var/www/memorify/backend
npm install
nano .env
```
Paste this into the editor (fill in real values), then Ctrl+O, Enter, Ctrl+X:
```
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=https://memorify.ca,https://www.memorify.ca
CLOUDINARY_CLOUD_NAME=da7fjzvsb
CLOUDINARY_API_KEY=617686925686957
CLOUDINARY_API_SECRET=your-api-secret
EMAIL=your-gmail@gmail.com
PASSWORD=your-gmail-app-password
```
Start it and make it auto-start on reboot:
```
pm2 start server.js --name memorify-api
pm2 startup systemd -u root --hp /root
pm2 save
```
Test: `curl http://localhost:5000/health` → should print `{"status":"ok"}`.

## Phase 7 — Build the frontend
```
cd /var/www/memorify/photo-booth-frontend
echo "VITE_API_URL=https://memorify.ca" > .env
npm install
npm run build
```
This creates `photo-booth-frontend/dist`. Point Nginx at it:
```
ln -s /var/www/memorify/photo-booth-frontend/dist /var/www/memorify/dist
```

## Phase 8 — Configure Nginx
```
cp /var/www/memorify/deploy/nginx-memorify.conf /etc/nginx/sites-available/memorify
ln -s /etc/nginx/sites-available/memorify /etc/nginx/sites-enabled/memorify
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```
Now http://memorify.ca should load the site (no padlock yet).

## Phase 9 — Enable HTTPS (free SSL)
```
apt install -y certbot python3-certbot-nginx
certbot --nginx -d memorify.ca -d www.memorify.ca
```
Choose "redirect HTTP to HTTPS" when asked. Certbot auto-renews.

## Phase 10 — Final checks
1. Open https://memorify.ca/admin/login → log in `admin` / `memorifymemorify`.
2. Click ⚙ Account → set a strong new password.
3. Create a gallery, upload photos, use **Copy Link**, open it in another browser.

---

## Updating the site later
On the server:
```
cd /var/www/memorify
git pull
cd backend && npm install && pm2 restart memorify-api
cd ../photo-booth-frontend && npm install && npm run build
```
(No Nginx reload needed — it serves the freshly built files.)

## Handy commands
- Backend logs:        `pm2 logs memorify-api`
- Restart backend:     `pm2 restart memorify-api`
- Nginx errors:        `tail -f /var/log/nginx/error.log`
