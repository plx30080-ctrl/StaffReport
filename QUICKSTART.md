# Quick Start Guide - 10 Minutes to Deployment

This guide will get your Team KPI Tracker live in 10 minutes.

## Step 1: Firebase Setup (3 minutes)

1. Open [Firebase Console](https://console.firebase.google.com/project/so-il-report)
2. Click "Authentication" → "Get Started"
3. Enable "Email/Password" (toggle it on)
4. Click "Firestore Database" → "Create Database"
5. Select "Production mode" → Choose "us-central1" → Create

## Step 2: Deploy Firebase Rules (2 minutes)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the project
firebase use so-il-report

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Step 3: Update Manager Email (1 minute)

Open `src/firebase/auth.js` and update line 9:

```javascript
const MANAGER_EMAIL = 'your-actual-email@employbridge.com';
```

Open `firestore.rules` and update line 18:

```javascript
request.auth.token.email == 'your-actual-email@employbridge.com';
```

Redeploy rules:
```bash
firebase deploy --only firestore:rules
```

## Step 4: Configure Repository Name (1 minute)

Open `vite.config.js` and update line 10 if your repo name is different:

```javascript
base: '/StaffReport/', // Change this to match your GitHub repo name
```

## Step 5: Deploy to GitHub Pages (3 minutes)

```bash
# Commit all files
git add .
git commit -m "Initial deployment of KPI Tracker"
git push origin main
```

Then on GitHub:
1. Go to your repository
2. Click Settings → Pages
3. Under "Build and deployment", set Source to: **GitHub Actions**
4. Wait 2-3 minutes for deployment
5. Your site will be at: `https://your-username.github.io/StaffReport/`

## Step 6: Test It Out

1. Visit your GitHub Pages URL
2. Click "Sign Up"
3. Create account with your manager email
4. You should see both "Dashboard" and "Submit Report" tabs
5. Test creating a submission

## You're Done!

Share the URL with your team and have them sign up with their work emails.

## Next Steps

- Create accounts for your team (or have them self-register)
- Add them to the location team lists in `src/constants/locations.js`
- Test on mobile devices
- Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed setup

## Common Issues

**"Permission denied" errors?**
→ Make sure you deployed Firestore rules: `firebase deploy --only firestore:rules`

**GitHub Pages shows 404?**
→ Check that `base` in vite.config.js matches your repo name exactly

**Can't log in?**
→ Verify Email/Password authentication is enabled in Firebase Console

## Support

Full documentation: [README.md](README.md)
Deployment checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
