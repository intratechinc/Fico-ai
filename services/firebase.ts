// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPZGBgu9OHxngb2J1sREt7kHxxNURnE0E",
  authDomain: "ai-fico-simulator.firebaseapp.com",
  projectId: "ai-fico-simulator",
  storageBucket: "ai-fico-simulator.firebasestorage.app",
  messagingSenderId: "177439270302",
  appId: "1:177439270302:web:bc5ffc70c64ac2cb3c228f",
  measurementId: "G-0T9YMZ2L19"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
