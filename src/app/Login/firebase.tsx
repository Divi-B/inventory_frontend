// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC_KIHGiQuVqvPceQYespS1zXoyHubxIFA",
    authDomain: "scm-app-50ba0.firebaseapp.com",
    projectId: "scm-app-50ba0",
    storageBucket: "scm-app-50ba0.firebasestorage.app",
    messagingSenderId: "527043035507",
    appId: "1:527043035507:web:2fd0c5296221fe11290506",
    measurementId: "G-2HVJD9VRG4"
  };
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
