'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would implement the signup logic
    console.log('Signup attempt with:', { email, username, password })
  }

  return (
    <div>
    <Header/>
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-heading">Sign Up</h1>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <button type="submit" className="form-button">
            Create Account
          </button>
        </form>
        
        <p className="auth-link-text">
          Already have an account? <Link href="/auth/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
    </div>
  )
}