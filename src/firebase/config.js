import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyClaBJ6U8McKh6I2t0d2XnUpjRvA9ooj-M",
  authDomain: "so-il-report.firebaseapp.com",
  projectId: "so-il-report",
  storageBucket: "so-il-report.firebasestorage.app",
  messagingSenderId: "1019290805877",
  appId: "1:1019290805877:web:82b470babbd7e19e1d7a3c",
  measurementId: "G-VXC24KWL3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available in this browser');
    }
  });
}

export default app;
