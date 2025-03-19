import Image from 'next/image'
import Link from 'next/link'
import logo from '../resources/logo.png'

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo-container">
          <div className="relative w-10 h-10">
            <Image src={logo} alt="CareerCompass Logo" fill style={{ objectFit: 'contain' }} />
          </div>
          <span className="logo-text">CareerCompass</span>
        </Link>
        <nav>
          {/* <ul className="nav-list">
            <li><Link href="/auth/login" className="login-button">Log In</Link></li>
          </ul> */}
        </nav>
      </div>
    </header>
  )
}