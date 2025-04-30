// components/LogoutButton.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LogoutButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    setLoggedIn(!!storedUsername);
  }, [pathname]);

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
    <span className="inline-block">
    {loggedIn ? (
        <button onClick={logout} className="secondary-button py-2 px-3 text-sm rounded-md font-medium transition-colors bg-white text-sm absolute top-4 right-4 hover:text-black">
          Log Out
        </button>
    ) : (
        <Link href="/auth/login" className="secondary-button py-2 px-3 text-sm rounded-md font-medium transition-colors bg-white text-sm absolute top-4 right-4 hover:text-black">
          Log In
        </Link>
    )}
    </span>
  );
}