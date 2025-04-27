'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          email  // Include email in request
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful:', data.message);
        router.push("/chatbot");
      } else {
        setError(data.detail || 'Signup failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Signup error:', err);
    }
  };

  return (
    <div>
      <Header />
      <div className="auth-container">
        <div className="auth-form-card header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%]">
          <h1 className="auth-heading">Sign Up</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
            Already have an account?{' '}
            <Link href="/auth/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
