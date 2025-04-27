import Image from 'next/image'
import Link from 'next/link'
import logo5 from '../resources/logo5.png'
import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";

export default function Header() {

  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [username, setUsername] = useState<string | null>(null);
 

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    setLoggedIn(!!storedUsername);
  }, []);

  const handleLogout = async () => {
    if (!username) return

    fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).then(() => {
      localStorage.removeItem('username')
      setLoggedIn(false)
      router.push("/");
    }).catch(err => console.error("Logout failed", err))
  }

  return (
    <header className="header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%]
">
      <div className="header-container">
        <Link href="/" className="logo-container">
          <div className="relative w-10 h-10">
            <Image src={logo5} alt="CareerCompass Logo" fill style={{ objectFit: 'contain' }} />
          </div>
          <span className="logo-text">CareerCompass</span>
        </Link>
        <nav>


            <ul className="flex space-x-6 text-base font-bold text-white-700">
            <li><Link href="/" className="hover:text-black">Home</Link></li>
            <li><Link href="/chatbot" className="hover:text-black">Chatbot</Link></li>
            <li><Link href="/datavisualization" className="hover:text-black">Insights</Link></li>
            {loggedIn ? (
            <li>
              <button onClick={handleLogout} className="secondary-button">
                Log Out
              </button>
            </li>
          ) : (
            <li>
              <Link href="/auth/login" className="secondary-button">Log In</Link>
            </li>
          )}
          </ul>
        </nav>
      </div>
    </header>
)
}
