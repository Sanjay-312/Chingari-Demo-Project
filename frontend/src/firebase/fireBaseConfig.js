// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAor8bQrKd6TmmIGOCx0_tYcgZmiw3HrD4",
  authDomain: "authentication-445c9.firebaseapp.com",
  projectId: "authentication-445c9",
  storageBucket: "authentication-445c9.appspot.com",
  messagingSenderId: "765642659550",
  appId: "1:765642659550:web:8ca573095b1de50845d44f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
