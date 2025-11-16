# Deployment Quick Start

Follow these steps to set up automated deployment for EduOps.

## Quick Setup (5 minutes)

### 1. Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "github-actions-eduops"
# Save as: ~/.ssh/eduops_deploy
# No passphrase (press Enter twice)
```

### 2. Copy to VPS

```bash
ssh-copy-id -i ~/.ssh/eduops_deploy.pub root@YOUR_VPS_IP
```

### 3. Test Connection

```bash
ssh -i ~/.ssh/eduops_deploy root@YOUR_VPS_IP
```

### 4. Add GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions

Add these 4 secrets:

| Secret Name    | Value                                              |
| -------------- | -------------------------------------------------- |
| `VPS_HOST`     | Your VPS IP (e.g., 123.45.67.89)                   |
| `VPS_USERNAME` | `root`                                             |
| `VPS_SSH_KEY`  | Copy entire content of `~/.ssh/eduops_deploy` file |
| `VPS_PORT`     | `22`                                               |

**To copy private key:**

- Linux/Mac: `cat ~/.ssh/eduops_deploy`
- Windows: `type C:\Users\YourUsername\.ssh\eduops_deploy`

### 5. Make deploy.sh Executable on VPS

```bash
ssh root@YOUR_VPS_IP
cd /root/EduOps
chmod +x deploy.sh
```

### 6. Test Deployment

- Go to GitHub → Actions tab
- Click "Run workflow" button
- Select master branch
- Click "Run workflow"

## That's It!

Now every push to master branch will automatically deploy your app!

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

## Manual Deployment

If you need to deploy manually on the VPS:

```bash
ssh root@YOUR_VPS_IP
cd /root/EduOps
bash deploy.sh
```
