// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVnS-3opyjigTLfcWOK8PYKSNFj6hWaE8",
  authDomain: "ai-learning-assistant-639e0.firebaseapp.com",
  projectId: "ai-learning-assistant-639e0",
  storageBucket: "ai-learning-assistant-639e0.firebasestorage.app",
  messagingSenderId: "692877927786",
  appId: "1:692877927786:web:37869d18c55d833cb17113",
  measurementId: "G-SX31XTVY6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export {app};