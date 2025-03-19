// app/page.js or app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import logo from '../resources/logo.png'

export default function Home() {
  return (
    <div className="main-container">
      <div className="content-container">
        <h1 className="main-heading">CareerCompass</h1>
        <div className="my-6 relative w-32 h-32 mx-auto">
          <Image 
            src={logo}
            alt="CareerCompass Logo" 
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h2 className="sub-heading">Your AI-Powered Career Advisor</h2>
        
        <div className="button-container">
          <Link href="/auth/signup" className="secondary-button">
            Sign Up
          </Link>
          <Link href="/auth/login" className="secondary-button">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
