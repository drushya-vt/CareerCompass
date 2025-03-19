import './globals.css'
import { ReactNode } from 'react'
import Header from '../components/Header'

export const metadata = {
  title: 'CareerCompass - Your AI-Powered Career Advisor',
  description: 'Navigate your career path with AI-driven insights and guidance',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  )
}
