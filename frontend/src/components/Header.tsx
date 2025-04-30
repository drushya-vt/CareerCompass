import Image from 'next/image'
import Link from 'next/link'
import logo5 from '../resources/logo5.png'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from "next/navigation";
import React from 'react';

export default function Header() {

  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
 

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    setLoggedIn(!!storedUsername);
  }, [pathname]);

  const handleLogout = async () => {
    if (!username) return

    fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).then(() => {
      localStorage.removeItem('username');
      setLoggedIn(false)
      router.push("/");
    }).catch(err => console.error("Logout failed", err))
  }

  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  return (
    <header
      className={`header ${
        pathname === "/homepage"
          ? "bg-transparent shadow-none border-none outline-none"
          : "bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] shadow-lg"
      }`}
    >
      <div className="header-container">
        <Link href="/" className="logo-container">
          <div className="relative w-10 h-10">
            <Image src={logo5} alt="CareerCompass Logo" fill style={{ objectFit: 'contain' }} />
          </div>
          <span className="logo-text">CareerCompass</span>
        </Link>
 
        {!isAuthPage && (
          <nav>
            <ul className="flex items-center space-x-4 text-base font-bold text-white">
              <li><Link href="/" className="hover:text-black">Home</Link></li>
              {loggedIn && (
                <>
                  <li><Link href="/chatbot" className="hover:text-black">Chatbot</Link></li>
                  <li><Link href="/datavisualization" className="hover:text-black">Insights</Link></li>
                </>
              )}
              {loggedIn ? (
                <li>
                  <button onClick={handleLogout} className="secondary-button text-sm px-3 hover:text-black">
                    Log Out
                  </button>
                </li>
              ) : (
                <>
                <li>
                    <Link href="/auth/signup" className="secondary-button text-sm px-3 hover:text-black">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="secondary-button text-sm px-3 hover:text-black">
                      Log In
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
)
}
