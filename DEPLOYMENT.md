# Deployment Guide

## Files Ready for Deployment

Your website is ready to deploy! The following files will be hosted:
- `index.html` - Main HTML structure
- `styles.css` - All styles and animations
- `script.js` - JavaScript functionality
- `content.json` - Your portfolio content
- `logo.png` - Your logo image

Docker files (Dockerfile, docker-compose.yml, nginx.conf) are excluded via `.gitignore`.

## Deploy to GitHub Pages

### Step 1: Initialize Git Repository

```bash
cd /home/tetae/Projects/claude-code/WIP/main-website-hannune.ai/v0.0.3
git init
git add index.html styles.css script.js content.json logo.png .gitignore
git commit -m "Initial commit: Portfolio website"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `portfolio` (or any name you prefer)
3. Make it Public
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 3: Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

### Step 5: Access Your Website

Your site will be live at:
```
https://YOUR_USERNAME.github.io/portfolio/
```

It may take 1-2 minutes to deploy initially.

## Update Your Website

When you make changes to content.json or any files:

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Pages will automatically rebuild and update your site.

## Contact Form

Your Formspree form is configured with ID: `xzdbnayo`

Messages will be sent to the email associated with your Formspree account.

## Custom Domain (Optional)

To use a custom domain like `yourname.com`:

1. In GitHub repository settings → Pages
2. Enter your custom domain
3. Add a CNAME record in your domain DNS:
   - Type: CNAME
   - Name: @ (or www)
   - Value: YOUR_USERNAME.github.io
