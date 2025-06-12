import React, { useState } from "react";
import { User } from "firebase/auth";
import { auth, provider, signInWithPopup } from "./firebase"; // adjust path
import "./loginpage.css";

interface GoogleLoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function GoogleLogin({ onLoginSuccess }: GoogleLoginProps) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess(result.user); // notify parent component
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Welcome Back!</h1>
        <p>Please sign in to continue and access our exclusive content.</p>
        <button className="login-btn" onClick={handleLogin}>
          Sign in with Google
        </button>
        <footer className="login-footer">
          <p>&copy; {new Date().getFullYear()} Your App Name. All rights reserved.</p>
          <p>
            <a href="/privacy">Privacy Policy</a> |{" "}
            <a href="/terms">Terms of Service</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
