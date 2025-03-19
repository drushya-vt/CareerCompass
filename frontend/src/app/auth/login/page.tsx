'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would implement the login logic
    console.log('Login attempt with:', { username, password })
  }

  return (
    <div>
    <Header/>
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-heading">Login</h1>
        <form onSubmit={handleSubmit} className="form-container">
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
            Log in
          </button>
        </form>
        
        <p className="auth-link-text">
          Don't have an account? <Link href="/auth/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
    </div>
  )
}
