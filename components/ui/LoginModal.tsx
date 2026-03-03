'use client'

import { useState, useEffect } from 'react'
import { useKeycloak } from '@/lib/auth/keycloak'

const AUTH_REDIRECT_KEY = 'auth_redirect'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, isKeycloakEnabled, isLoading, isAuthenticated, keycloak } = useKeycloak()
  const [showCreateAccount, setShowCreateAccount] = useState(false)

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose()
    }
  }, [isAuthenticated, isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const isGoogleEnabled = true // Always show Google option; API returns 503 if not configured
  const authConfigured = isKeycloakEnabled || isGoogleEnabled

  const redirect = typeof window !== 'undefined' ? window.location.pathname || '/dashboard' : '/dashboard'
  const googleLoginUrl = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`

  const handleLogin = () => {
    if (isKeycloakEnabled) {
      try {
        sessionStorage.setItem(AUTH_REDIRECT_KEY, redirect)
      } catch {
        /* ignore */
      }
      login()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {showCreateAccount ? 'Create Account' : 'Log in'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!authConfigured ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Sign-in is not configured. Set up Keycloak or Google (NEXT_PUBLIC_GOOGLE_CLIENT_ID) to enable login.
              </p>
            </div>
          ) : (
            <>
              {/* Social Login Section */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center mb-4">
                  {showCreateAccount
                    ? 'Sign up with your account'
                    : 'Sign in with your account'}
                </p>

                {/* Keycloak Login Button */}
                {isKeycloakEnabled && (
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 group-hover:text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                      {isLoading ? 'Connecting...' : 'Continue with Keycloak'}
                    </span>
                  </button>
                )}

                {/* Google Login Button */}
                {isGoogleEnabled && (
                  <a
                    href={googleLoginUrl}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                      Continue with Google
                    </span>
                  </a>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Email/Password Section (Placeholder - can be extended) */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email login coming soon. Please use Keycloak or Google to sign in.
                    </p>
                  </div>

                  {!showCreateAccount && (
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        placeholder="Enter your password"
                        disabled
                      />
                      <div className="mt-2 text-right">
                        <button className="text-sm text-primary-600 hover:text-primary-700">
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  )}

                  {showCreateAccount && (
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        placeholder="Confirm your password"
                        disabled
                      />
                    </div>
                  )}

                  <button
                    disabled
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showCreateAccount ? 'Create Account' : 'Log in'}
                  </button>
                </div>
              </div>

              {/* Toggle between Login and Create Account */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowCreateAccount(!showCreateAccount)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showCreateAccount
                    ? 'Already have an account? Log in'
                    : "Don't have an account? Create Account"}
                </button>
              </div>

              {/* Terms */}
              <p className="mt-4 text-xs text-gray-500 text-center">
                By {showCreateAccount ? 'registering' : 'logging in'}, you agree to our{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
