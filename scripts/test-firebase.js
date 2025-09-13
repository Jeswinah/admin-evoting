import { auth, db } from "../src/app/firebase/config.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

// Test script to verify Firebase connection and create admin user
async function testFirebaseConnection() {
  try {
    console.log("🔥 Testing Firebase connection...");

    // Test Firestore connection
    await addDoc(collection(db, "test"), {
      message: "Firebase connection successful!",
      timestamp: new Date(),
    });
    console.log("✅ Firestore connection successful");

    // Test Authentication (uncomment to create admin user)
    /*
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@yourdomain.com', 
        'yourSecurePassword123'
      );
      console.log('✅ Admin user created:', userCredential.user.email);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Admin user already exists');
      } else {
        console.error('❌ Error creating admin user:', authError.message);
      }
    }
    */

    console.log("🎉 Firebase setup is working correctly!");
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    console.log("Please check your .env.local file and Firebase configuration");
  }
}

// Run the test
testFirebaseConnection();
