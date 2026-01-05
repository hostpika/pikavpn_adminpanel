# Deployment Guide for Ubuntu 22.04

This guide will walk you through setting up your Ubuntu 22.04 server to host your Next.js application and ensuring the GitHub Action works correctly.

## Prerequisites

- An Ubuntu 22.04 server.
- SSH access to the server.
- A user with `sudo` privileges.
- A domain name pointing to your server's IP (optional but recommended).

## 1. Initial Server Setup

SSH into your server and run the following commands to update packages and install necessary software:

```bash
# Update package list and upgrade
sudo apt update && sudo apt upgrade -y

# Install Node.js (Version 20.x recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js and NPM
node -v
npm -v

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

## 2. GitHub Secrets Setup

Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

1.  `HOST`: Your server's IP address (e.g., `123.45.67.89`).
2.  `USERNAME`: Your server's SSH username (e.g., `ubuntu` or `root`).
3.  `KEY`: Your SSH **Private Key**.
    - You can generate a new pair on your local machine: `ssh-keygen -t rsa -b 4096 -C "deploy_key"`
    - Copy the content of the private key (`cat deploy_key`) into this secret.
    - **Crucial**: Add the *public key* (`deploy_key.pub`) to your server's `~/.ssh/authorized_keys` file.
4.  `PORT`: `22` (or your custom SSH port).

## 3. First-Time Manual Deployment (Optional but Recommended)

It's often good to run the first clone manually to accept the host authenticity and ensure permissions are correct.

```bash
# On your server
cd ~
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git vpn-admin-panel
cd vpn-admin-panel
npm install
npm run build
pm2 start npm --name "vpn-admin-panel" -- start
pm2 save
pm2 startup
# Run the command output by pm2 startup to valid configuration
```

*Note: The GitHub Action is configured to clone the repo to `~/vpn-admin-panel` if it doesn't exist.*

## 4. Nginx Configuration

1.  Copy the example config:
    ```bash
    sudo cp ~/vpn-admin-panel/nginx_example.conf /etc/nginx/sites-available/vpn-admin-panel
    ```

2.  Edit the config to add your domain/IP:
    ```bash
    sudo nano /etc/nginx/sites-available/vpn-admin-panel
    ```
    Replace `YOUR_DOMAIN_OR_IP` with your actual domain (e.g., `vpn.example.com`) or IP address.

3.  Enable the link:
    ```bash
    sudo ln -s /etc/nginx/sites-available/vpn-admin-panel /etc/nginx/sites-enabled/
    ```

4.  Test Nginx config:
    ```bash
    sudo nginx -t
    ```

5.  Restart Nginx:
    ```bash
    sudo systemctl restart nginx
    ```

## 5. SSL Setup (HTTPS)

If you have a domain name, secure it with Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts to redirect HTTP to HTTPS.

## 6. Deployment

Now, whenever you push changes to the `main` branch, the GitHub Action will automatically:
1.  SSH into your server.
2.  Pull the latest code.
3.  Install dependencies.
4.  Build the app.
5.  Reload PM2.

Check the "Actions" tab in your GitHub repository to see the deployment status.
