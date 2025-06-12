
"use client"

import React, { useState } from "react";
import Dashboard from "./dashboard/page";
import GoogleLogin from "./Login/loginpage"; // Assuming this handles login

import { User } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <GoogleLogin onLoginSuccess={(loggedInUser: User) => setUser(loggedInUser)} />
      )}
    </>
  );
}
