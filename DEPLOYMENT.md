# EduOps Deployment Setup Guide

This guide will help you set up automated deployment from GitHub to your Hostinger VPS.

## Overview

The deployment system uses GitHub Actions to automatically deploy your application to the VPS whenever you push to the `master` branch. You can also trigger deployments manually.

## Prerequisites

- GitHub repository with the EduOps project
- Hostinger VPS with root access
- SSH access to your VPS
- PM2 installed on VPS
- Nginx installed and configured on VPS

## Setup Instructions

### Step 1: Generate SSH Keys

On your local machine (Windows PowerShell, Git Bash, or WSL), generate an SSH key pair:

```bash
ssh-keygen -t ed25519 -C "github-actions-eduops"
```

When prompted:

- **Save location**: `~/.ssh/eduops_deploy` (or `C:\Users\YourUsername\.ssh\eduops_deploy` on Windows)
- **Passphrase**: Press Enter twice (leave empty for GitHub Actions)

This creates two files:

- `eduops_deploy` (private key - keep secret!)
- `eduops_deploy.pub` (public key - safe to share)

### Step 2: Copy Public Key to VPS

**Option A - Using ssh-copy-id (Linux/Mac/WSL):**

```bash
ssh-copy-id -i ~/.ssh/eduops_deploy.pub root@YOUR_VPS_IP
```

**Option B - Manual method (Windows/All platforms):**

```bash
# Display your public key
cat ~/.ssh/eduops_deploy.pub
# Or on Windows: type C:\Users\YourUsername\.ssh\eduops_deploy.pub

# SSH into your VPS
ssh root@YOUR_VPS_IP

# On VPS, add the key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key on a new line, save and exit

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Test SSH Connection

```bash
ssh -i ~/.ssh/eduops_deploy root@YOUR_VPS_IP
```

If successful, you should connect without a password prompt.

### Step 4: Prepare VPS Deployment Script

SSH into your VPS and ensure the deployment script has execute permissions:

```bash
cd /root/EduOps
chmod +x deploy.sh
```

Verify the paths in `deploy.sh` match your VPS setup:

- API path: `/root/EduOps/api`
- Client path: `/root/EduOps/client`
- Nginx path: `/var/www/eduops`

### Step 5: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### VPS_HOST

- **Name**: `VPS_HOST`
- **Value**: Your VPS IP address (e.g., `123.45.67.89`)

#### VPS_USERNAME

- **Name**: `VPS_USERNAME`
- **Value**: `root` (or your VPS username)

#### VPS_SSH_KEY

- **Name**: `VPS_SSH_KEY`
- **Value**: Contents of your **private key** file

**On Linux/Mac/WSL:**

```bash
cat ~/.ssh/eduops_deploy
```

**On Windows PowerShell:**

```powershell
Get-Content C:\Users\YourUsername\.ssh\eduops_deploy | Out-String
```

Copy the entire output, including:

```
-----BEGIN OPENSSH PRIVATE KEY-----
... (all the key content) ...
-----END OPENSSH PRIVATE KEY-----
```

#### VPS_PORT

- **Name**: `VPS_PORT`
- **Value**: `22` (standard SSH port)

### Step 6: Test the Workflow

#### Manual Test

1. Go to your GitHub repository
2. Click the **Actions** tab
3. Select **Deploy to Production** workflow
4. Click **Run workflow** button
5. Select `master` branch
6. Click **Run workflow**

Watch the deployment progress in the Actions tab. It should take 2-5 minutes.

#### Automatic Test

1. Make a small change (e.g., update README)
2. Commit and push to `master` branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin master
   ```
3. Check the Actions tab to see automatic deployment

## Verification

After deployment completes, verify everything is working:

### Check PM2 Status

```bash
ssh root@YOUR_VPS_IP
pm2 status
pm2 logs eduops-api --lines 50
```

### Check Nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Test the Application

- Visit your domain/IP in a browser
- Check API endpoint: `http://YOUR_DOMAIN/api`
- Test frontend functionality

## Troubleshooting

### SSH Connection Issues

**Error: Permission denied (publickey)**

- Verify public key is in VPS `~/.ssh/authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Ensure VPS allows key-based authentication in `/etc/ssh/sshd_config`

**Error: Connection timeout**

- Check VPS IP address is correct
- Verify firewall allows SSH (port 22)
- Ensure VPS is running: `ping YOUR_VPS_IP`

### Deployment Script Issues

**Error: API path not found**

- Verify paths in `deploy.sh` match your VPS structure
- Check repository is cloned to `/root/EduOps`

**Error: npm install failed**

- Check Node.js version: `node --version` (should be v16+)
- Ensure sufficient disk space: `df -h`
- Try: `npm cache clean --force`

**Error: PM2 command not found**

- Install PM2: `npm install -g pm2`

**Error: Build failed (out of memory)**

- Increase Node.js memory:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run build
  ```

### GitHub Actions Issues

**Error: Host key verification failed**

- Add to workflow (before deploy step):
  ```yaml
  - name: Add VPS to known hosts
    run: ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
  ```

**Error: Invalid private key format**

- Ensure you copied the entire private key including header/footer
- Check for extra spaces or line breaks
- Regenerate key if necessary

## Workflow Details

### What Happens During Deployment

1. **GitHub Actions triggers** on push to master or manual trigger
2. **Connects to VPS** via SSH using stored credentials
3. **Executes deploy.sh** which:
   - Stops existing PM2 process
   - Pulls latest code from GitHub (API)
   - Installs API dependencies
   - Runs Prisma migrations
   - Starts new PM2 process
   - Pulls latest code (Client)
   - Installs Client dependencies
   - Builds React frontend
   - Copies build to Nginx directory
   - Reloads Nginx
   - Saves PM2 configuration

### Deployment Time

- Typical deployment: 2-5 minutes
- First deployment: 5-10 minutes (npm install takes longer)

### Rollback

If deployment fails, the previous version remains running. To rollback:

```bash
cd /root/EduOps
git checkout <previous-commit-hash>
bash deploy.sh
```

## Security Notes

- **Never commit** private SSH keys to repository
- Store all sensitive credentials in GitHub Secrets
- Use separate SSH keys for different purposes
- Regularly rotate SSH keys and secrets
- Monitor deployment logs for suspicious activity

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

If you encounter issues:

1. Check GitHub Actions logs for specific error messages
2. SSH into VPS and check application logs
3. Review this troubleshooting guide
4. Check VPS resources (disk, memory, CPU)
