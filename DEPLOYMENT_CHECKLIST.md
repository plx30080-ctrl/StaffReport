# Deployment Checklist

Use this checklist to deploy your Team KPI Tracking System.

## Pre-Deployment Setup

### 1. Firebase Configuration

- [ ] Enable Authentication (Email/Password) in Firebase Console
- [ ] Create Firestore Database in Firebase Console
- [ ] Update manager email in `src/firebase/auth.js` (line 9)
- [ ] Update manager email in `firestore.rules` (line 16)
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`

### 2. Code Configuration

- [ ] Update `base` in `vite.config.js` to match your GitHub repo name
- [ ] Review and update location data in `src/constants/locations.js` if needed
- [ ] Test locally with `npm run dev`

### 3. GitHub Setup

- [ ] Push code to GitHub repository
- [ ] Enable GitHub Pages in repository Settings > Pages
- [ ] Set source to "GitHub Actions"

## Deployment Steps

### 1. Initial Deployment

```bash
# Install dependencies
npm install

# Test build locally
npm run build
npm run preview

# Commit and push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Verify Deployment

- [ ] Check GitHub Actions tab for successful deployment
- [ ] Visit your GitHub Pages URL: `https://yourusername.github.io/StaffReport/`
- [ ] Test sign-up functionality
- [ ] Test data entry form
- [ ] Test manager dashboard
- [ ] Test on mobile device

### 3. Post-Deployment

- [ ] Create first user account (your manager email)
- [ ] Create test accounts for team members
- [ ] Share GitHub Pages URL with team
- [ ] Provide login instructions
- [ ] Set up monitoring in Firebase Console

## Team Onboarding

### Send to Team Members

```
Subject: New Team KPI Tracking System

Team,

We've launched a new web-based KPI tracking system. Here's how to get started:

1. Go to: https://yourusername.github.io/StaffReport/
2. Click "Sign Up" and create an account with your work email
3. Choose your location (this will be saved for future visits)
4. Start entering your weekly KPI data

Features:
- Works on any device (phone, tablet, computer)
- Auto-saves every 60 seconds
- Real-time updates visible to management
- Deadline: Friday 5 PM each week

Need help? Contact [Manager Name] at [Manager Email]

Thanks!
```

## Ongoing Maintenance

### Weekly Tasks
- [ ] Review submissions by Friday 5 PM
- [ ] Export weekly report to PDF
- [ ] Follow up on missing submissions

### Monthly Tasks
- [ ] Review Firebase usage in console
- [ ] Check for any error logs
- [ ] Backup data (optional)

### As Needed
- [ ] Add new team members in Firebase Authentication
- [ ] Update locations in `src/constants/locations.js`
- [ ] Deploy updates: `git push origin main`

## Troubleshooting Quick Reference

### Users Can't Sign In
1. Check Firebase Authentication is enabled
2. Verify email/password is correct
3. Check browser console for errors

### Data Not Saving
1. Verify Firestore rules are deployed
2. Check Firebase quota limits
3. Test internet connection

### GitHub Pages Not Updating
1. Check GitHub Actions for build errors
2. Verify `base` in vite.config.js
3. Clear browser cache

## Support Contacts

- Firebase Console: https://console.firebase.google.com/
- GitHub Repository: [Your Repo URL]
- Technical Support: [Your Contact Info]

## Emergency Procedures

### If Site Goes Down
1. Check GitHub Actions for deployment failures
2. Check Firebase service status: https://status.firebase.google.com/
3. Revert to last working commit if needed: `git revert HEAD`

### Data Recovery
1. Access Firestore Console
2. Export collection as JSON
3. Re-import if needed using Firebase Admin SDK

### Security Incident
1. Disable affected user in Firebase Authentication
2. Review Firestore audit logs
3. Update security rules if needed
4. Redeploy: `firebase deploy --only firestore:rules`
