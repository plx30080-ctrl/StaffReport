# Team KPI Tracking System

A professional web-based KPI tracking system for Employbridge staffing operations in Southern Illinois. Built with React, Firebase, and deployed on GitHub Pages.

## Features

- **Real-time Sync**: Changes appear instantly across all devices
- **Mobile-First Design**: Optimized for phone and tablet use
- **Auto-Save**: Automatically saves drafts every 60 seconds
- **Role-Based Access**: Team member view and Manager dashboard
- **Offline Support**: Works offline and syncs when connection is restored
- **Data History**: Track who changed what and when
- **PDF Export**: Export weekly reports to PDF
- **Edit Locking**: Submissions lock after Monday 9 AM

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Deployment**: GitHub Pages
- **PDF Generation**: jsPDF

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase account
- GitHub account

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project is already created: `so-il-report`
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" authentication
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Select a location (us-central1 recommended)
5. Deploy Firestore rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use so-il-report
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

### 2. Update Manager Email

Edit [src/firebase/auth.js](src/firebase/auth.js:9) line 9:

```javascript
const MANAGER_EMAIL = 'your.actual.email@employbridge.com';
```

Also update [firestore.rules](firestore.rules:16) line 16:

```
function isManager() {
  return isAuthenticated() &&
         request.auth.token.email == 'your.actual.email@employbridge.com';
}
```

Then redeploy rules:
```bash
firebase deploy --only firestore:rules
```

### 3. Update Vite Config for GitHub Pages

Edit [vite.config.js](vite.config.js:10) line 10 to match your GitHub repo name:

```javascript
base: '/StaffReport/', // Replace with your actual repo name
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. GitHub Pages Deployment

#### Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Build and deployment":
   - Source: GitHub Actions
4. The GitHub Action workflow is already set up in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

#### Deploy

Push to the `main` branch:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

The GitHub Action will automatically build and deploy. Your site will be available at:
```
https://yourusername.github.io/StaffReport/
```

## Usage Guide

### First-Time Setup for Team Members

1. Go to the GitHub Pages URL
2. Click "Sign Up"
3. Create an account with your work email
4. Select your location (this will be saved)
5. Start entering data

### Team Member View

1. **Location Selection**: Choose your location (saved for future visits)
2. **Week Selection**: Defaults to upcoming Friday, can select any week
3. **Daily Metrics Section**: Update these anytime during the week
   - Current open orders
   - Candidates sent to interviews (cumulative)
   - Assignment starts (cumulative)
   - Assignment ends (cumulative)
   - Net headcount change (auto-calculated)
4. **Weekly Wrap-Up Section**: Fill once at week end
   - Sales activity (meetings, communications)
   - Wins this week
   - Sales plan for next week
   - Branch goals/targets
   - Current challenges
   - Additional notes
5. **Actions**:
   - "Save Progress": Manual save (also auto-saves every 60 seconds)
   - "Mark as Submitted": Marks submission as complete

### Manager Dashboard

1. **Week Selector**: View any historical week
2. **Summary Cards**: See totals across all locations
   - Total open orders
   - Net headcount change
   - Candidates interviewed
   - Sales activity
3. **Location Cards**: View each location's data side-by-side
   - Status indicators (Green=submitted, Blue=updated today, Yellow=stale, Red=no data)
   - Expandable details for full information
4. **Export to PDF**: Download the current week's report

### Data Submission Deadline

- **Deadline**: Friday 5 PM each week
- **Edit Lock**: After Monday 9 AM, previous week becomes read-only
- **Status Tracking**:
  - Green = Submitted
  - Blue = Updated today (draft)
  - Yellow = Last updated 2+ days ago
  - Red = No data submitted

## Adding Team Members

### Method 1: Self-Registration
Team members can sign up themselves using their work email.

### Method 2: Manual Creation (Manager Only)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and set a temporary password
5. Share credentials with team member
6. They can change password on first login

## Managing Data

### Backup Data

From the Manager Dashboard (or via console):
```javascript
// In browser console
import { getAllSubmissions } from './firebase/submissions';
const allData = await getAllSubmissions();
console.log(JSON.stringify(allData, null, 2));
// Copy and save to a file
```

### Restore Data

If needed, you can manually add documents back to Firestore through the Firebase Console:
1. Go to Firestore Database
2. Navigate to the `submissions` collection
3. Add documents manually or use Firebase Admin SDK

### View Revision History

Each submission tracks changes in the `updateHistory` array:
- Timestamp of change
- Field that was changed
- Old and new values
- Who made the change

Access this in Firebase Console or through the app by inspecting the submission object.

## Security Rules

The Firestore security rules ensure:
- Only authenticated users can access data
- Users can only update submissions before Monday 9 AM deadline
- Manager has full read/write access
- All submissions are readable by all authenticated users

Rules are in [firestore.rules](firestore.rules)

## Troubleshooting

### "Permission Denied" Errors

1. Ensure Firestore rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check that user is authenticated
3. Verify manager email in auth.js and firestore.rules match

### Auto-Save Not Working

1. Check browser console for errors
2. Verify internet connection
3. Check Firebase quota limits (free tier: 50K reads/day, 20K writes/day)

### GitHub Pages Not Updating

1. Check GitHub Actions tab for deployment status
2. Verify `base` in vite.config.js matches your repo name
3. Ensure GitHub Pages is enabled in repository settings

### Offline Mode Issues

1. Firestore persistence is enabled by default
2. Clear browser cache/data if sync issues occur
3. Check browser console for persistence errors

## Firebase Quotas (Free Tier)

- **Firestore**:
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
  - 1 GB storage
- **Authentication**: 10,000 verifications/month
- **Hosting**: 10 GB storage, 360 MB/day transfer

**Estimate for your use case**:
- 3 locations × 5 team members = 15 users
- ~100-200 reads per user per week
- ~20-50 writes per user per week
- Well within free tier limits

## Customization

### Add New Locations

Edit [src/constants/locations.js](src/constants/locations.js):

```javascript
export const LOCATIONS = [
  {
    code: '30080',
    name: 'Granite City',
    lead: 'Jae',
    team: ['Zire', 'Greg', 'Shantez']
  },
  // Add more locations here
];
```

### Change Auto-Save Interval

Edit [src/components/TeamMemberForm.jsx](src/components/TeamMemberForm.jsx:86):

```javascript
const { saving, lastSaved, error: autoSaveError, saveNow } = useAutoSave(
  formData,
  saveFunction,
  60000 // Change this value (in milliseconds)
);
```

### Modify Form Fields

Edit [src/components/TeamMemberForm.jsx](src/components/TeamMemberForm.jsx) to add/remove fields.

Remember to also update:
- Firebase submission structure in [src/firebase/submissions.js](src/firebase/submissions.js)
- Manager dashboard in [src/components/ManagerDashboard.jsx](src/components/ManagerDashboard.jsx)
- PDF export in [src/utils/exportPDF.js](src/utils/exportPDF.js)

## Project Structure

```
StaffReport/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── Login.jsx           # Authentication component
│   │   ├── TeamMemberForm.jsx  # Data entry form
│   │   └── ManagerDashboard.jsx # Manager view
│   ├── firebase/
│   │   ├── config.js           # Firebase initialization
│   │   ├── auth.js             # Authentication service
│   │   └── submissions.js      # Firestore operations
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication hook
│   │   └── useAutoSave.js      # Auto-save hook
│   ├── utils/
│   │   ├── formatters.js       # Date/time formatting
│   │   └── exportPDF.js        # PDF generation
│   ├── constants/
│   │   └── locations.js        # Location configuration
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── firestore.rules             # Security rules
├── firestore.indexes.json      # Database indexes
├── firebase.json               # Firebase config
├── vite.config.js              # Build configuration
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies
```

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Check browser console for JavaScript errors
3. Review GitHub Actions logs for deployment issues
4. Contact your Firebase administrator

## License

Proprietary - Employbridge Internal Use Only

## Credits

Built for Employbridge Southern Illinois Market Management