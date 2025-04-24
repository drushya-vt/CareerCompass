import Image from 'next/image'
import Link from 'next/link'
import logo5 from '../resources/logo5.png'

export default function Header() {
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
          {/* <ul className="nav-list">
            <li><Link href="/auth/login" className="login-button">Log In</Link></li>
          </ul> */}

            <ul className="flex space-x-6 text-base font-bold text-white-700">
            <li><Link href="/" className="hover:text-black">Home</Link></li>
            <li><Link href="/chatbot" className="hover:text-black">Chatbot</Link></li>
            <li><Link href="/datavisualization" className="hover:text-black">Insights</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}