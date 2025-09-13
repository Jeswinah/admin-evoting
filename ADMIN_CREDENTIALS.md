# Admin User Creation Guide

## 🔑 Creating Your First Admin User

Since your application now uses Firebase Authentication, you need to create an admin user account. Here are your options:

### Method 1: Firebase Console (Easiest)

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Authentication" in the left sidebar
4. Go to "Users" tab
5. Click "Add user"
6. Enter:
   - **Email**: `admin@election.gov` (or your preferred admin email)
   - **Password**: `Election2025!` (or your preferred secure password)
7. Click "Add user"

### Method 2: Using Test Script

1. Open `scripts/test-firebase.js`
2. Uncomment the admin user creation section
3. Replace the email and password with your desired credentials
4. Run: `node scripts/test-firebase.js`

### Method 3: Temporary Signup Page

I can create a temporary signup page for you to create the first admin user, then remove it.

### Recommended Admin Credentials:

```
Email: admin@election.gov
Password: Election2025!
```

**Important**:

- Use a strong password in production
- Never share credentials in code or documentation
- Consider using your real email address for password recovery

### After Creating Admin User:

1. Go to http://localhost:3000/admin/login
2. Enter your admin email and password
3. You'll be redirected to the dashboard
4. Start creating elections!

### Security Notes:

- Your credentials are now stored securely in Firebase
- No hardcoded passwords in the application
- Firebase handles password hashing and security
- You can reset passwords through Firebase Console
