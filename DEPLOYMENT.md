# 🚀 Splito Deployment Guide (DigitalOcean + GitHub Actions)

This guide walks you through deploying the Splito application to a DigitalOcean Droplet with an automated CI/CD pipeline using GitHub Actions.

## Phase 1: Droplet Provisioning & Setup

1. **Access your Droplet:**
   SSH into your DigitalOcean droplet:
   ```bash
   ssh root@<YOUR_DROPLET_IP>
   ```

2. **Install Dependencies:**
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js (v20 recommended)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Nginx and Git
   sudo apt install -y nginx git
   
   # Install PM2 (Process Manager for Node.js) globally
   sudo npm install -g pm2
   ```

3. **Initial Clone & Setup:**
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/<YOUR_USERNAME>/Splito.git
   cd Splito
   ```

4. **Environment Variables:**
   You must create the `.env` files manually on the server for the first time.
   
   **Backend:**
   ```bash
   cd /var/www/Splito/backend
   nano .env
   ```
   *Add your Supabase credentials, OpenAI key, and PORT=5000*
   
   **Frontend:**
   ```bash
   cd /var/www/Splito/frontend
   nano .env
   ```
   *Add your REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY and REACT_APP_API_URL=/api*

5. **Start the Backend with PM2:**
   ```bash
   cd /var/www/Splito/backend
   npm install
   pm2 start src/index.js --name "splito-backend"
   pm2 save
   pm2 startup
   ```

6. **Build the Frontend:**
   ```bash
   cd /var/www/Splito/frontend
   npm install
   npm run build
   ```

## Phase 2: Nginx Configuration

We will use Nginx to serve the React frontend build folder and reverse-proxy requests starting with `/api` to the Node backend.

1. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/splito
   ```
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name <YOUR_DROPLET_IP_OR_DOMAIN>;

       # Serve React Frontend
       location / {
           root /var/www/Splito/frontend/build;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       # Reverse Proxy for Node.js Backend
       location /api/ {
           proxy_pass http://localhost:5000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/splito /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Phase 3: GitHub Actions CI/CD Setup

We have already included the GitHub Actions workflow file in the repository at `.github/workflows/deploy.yml`.

### 1. Add GitHub Repository Secrets
To allow GitHub Actions to SSH into your server, go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following three secrets:
- `DROPLET_IP`: The public IP address of your DigitalOcean droplet (e.g., `123.45.67.89`).
- `SSH_USERNAME`: Your SSH username (usually `root`).
- `SSH_PASSWORD`: The password you use to SSH into your droplet.

### 2. How the Pipeline Works
Once the secrets are added, any time you run `git push origin main`, GitHub Actions will automatically:
1. Build the React frontend production bundle inside the high-memory GitHub runner.
2. Securely copy (SCP) the built `frontend/build` folder to your droplet.
3. SSH into your droplet, pull the latest code, install backend dependencies, and restart PM2.
4. Your live site updates instantly without crashing the droplet's memory!

---

## Phase 4: Local Development vs Production Notes

- **Local Development:** 
  You will continue to run `npm start` in the frontend, and `nodemon src/index.js` in the backend just like you always do. Because your local `.env` doesn't have `REACT_APP_API_URL` specified (or it points to `http://localhost:5000`), the local React proxy handles API requests seamlessly.
  
- **Production:** 
  In production, Nginx serves the static React build and uses the `/api` prefix to know when to proxy requests to your background Node service (which runs on port 5000). By setting `REACT_APP_API_URL=/api` in the production frontend `.env` file, the React app knows to send requests like `/api/groups` instead of hardcoded localhost URLs.