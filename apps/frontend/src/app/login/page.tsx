'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    // TODO: Firebase signInWithEmailAndPassword → POST /api/v1/auth/session
    setIsLoading(false)
  }

  async function handleGoogleLogin() {
    setIsLoading(true)
    setError(null)
    // TODO: Firebase signInWithPopup (GoogleAuthProvider) → POST /api/v1/auth/session
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#d9d9d9] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">curated.</h1>

        <div className="border border-black bg-[#d9d9d9] p-8 flex flex-col gap-6">
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs uppercase tracking-widest">
                email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border border-black bg-transparent px-3 py-2 text-sm outline-none focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs uppercase tracking-widest">
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border border-black bg-transparent px-3 py-2 text-sm outline-none focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 border border-red-700 px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-[#d9d9d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'signing in...' : 'sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-black" />
            <span className="text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-black" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-[#d9d9d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
          >
            continue with google
          </button>

          <p className="text-xs text-center">
            no account?{' '}
            <a href="/register" className="underline underline-offset-2 hover:opacity-60">
              register
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
