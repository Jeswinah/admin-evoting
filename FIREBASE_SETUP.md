# Firebase Setup Guide for Admin Voting System

## 🔥 Firebase Configuration Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `admin-voting-system`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### Step 3: Create Firestore Database

1. Click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select your nearest location
5. Click "Done"

### Step 4: Get Firebase Configuration

1. Click on the gear icon (Project settings)
2. Scroll down to "Your apps" section
3. Click on "Web" icon (</>) to add a web app
4. Register your app with name: `Admin Voting System`
5. Copy the firebaseConfig object

### Step 5: Update Environment Variables

Replace the values in your `.env.local` file with your actual Firebase config:

```env
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
```

### Step 6: Create Admin User

Since you're using Firebase Authentication, you need to create an admin user:

#### Option A: Through Firebase Console

1. Go to Authentication > Users
2. Click "Add user"
3. Enter email: `admin@yourdomain.com`
4. Enter password: `yourSecurePassword`
5. Click "Add user"

#### Option B: Through the App (First time only)

You can temporarily add a signup function to create the first admin user, then remove it.

### Step 7: Firestore Security Rules (Important!)

For production, update your Firestore rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Elections collection - only authenticated users can read/write
    match /elections/{document} {
      allow read, write: if request.auth != null;
    }

    // Votes collection - only authenticated users can read/write
    match /votes/{document} {
      allow read, write: if request.auth != null;
    }

    // Voters collection - only authenticated users can read/write
    match /voters/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Features Integrated

✅ **Firebase Authentication**: Secure admin login with email/password
✅ **Firestore Database**: Real-time election data storage
✅ **Election Management**: Create, read, update elections
✅ **Vote Tracking**: Real-time vote counting and statistics
✅ **Indian Election Structure**: Complete candidate and constituency data
✅ **Beautiful UI**: Glass morphism design with gradients
✅ **Real-time Updates**: Dashboard reflects live data changes

## 📊 Database Structure

### Elections Collection

```javascript
{
  id: "auto-generated",
  title: "2025 Presidential Election",
  description: "Choose the next President of India",
  category: "National",
  constituency: "All India",
  state: "All States",
  totalVoters: 900000000,
  totalVotes: 0,
  status: "active", // active, completed, scheduled
  startDate: "2025-09-01",
  endDate: "2025-09-30",
  candidates: [
    {
      id: 1,
      name: "Candidate Name",
      party: "Political Party",
      description: "Candidate description",
      votes: 0,
      percentage: 0,
      color: "blue"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Votes Collection

```javascript
{
  id: "auto-generated",
  electionId: "election-doc-id",
  candidateId: 1,
  voterInfo: "Voter ID: V12345",
  timestamp: timestamp
}
```

## 🔧 Next Steps

1. Complete Firebase setup using this guide
2. Update your `.env.local` file with real Firebase credentials
3. Create your first admin user
4. Start the development server: `npm run dev`
5. Login with your admin credentials
6. Create your first election!

## 🛡️ Security Notes

- Never commit your `.env.local` file to version control
- Use strong passwords for admin accounts
- Review and update Firestore security rules for production
- Consider enabling multi-factor authentication for admin accounts

## 📱 Testing

After setup, you can:

1. Create new elections with Indian political structure
2. View real-time statistics
3. Track votes and results
4. Manage multiple constituencies and states

Your admin voting system is now powered by Firebase! 🎉
