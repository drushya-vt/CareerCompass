// components/LogoutButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react'

export default function LogoutButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    setLoggedIn(!!username)
  }, []);

  const logout = async () => {
    if (!username) return;
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    localStorage.removeItem("username");
    router.push("/");
  };

  return (
    <button
      onClick={logout}
      className="secondary-button-logout"
    >
      Log Out
    </button>
  );
}