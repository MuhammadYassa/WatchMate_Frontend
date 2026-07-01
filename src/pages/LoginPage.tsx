import { ArrowRight, Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { authApi } from '../api/authApi'
import { useAuthStore } from '../auth/authStore'
import { Logo } from '../components/branding/Logo'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { PublicPageAtmosphere } from '../components/public/PublicPageAtmosphere'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { ApiClientError } from '../types/errors'

function getFriendlyLoginError(error: ApiClientError | null) {
  if (!error) {
    return null
  }

  return "That username or password didn't work. You can also request a new verification email if needed."
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { pushToast } = useToast()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')

  const returnTo = new URLSearchParams(location.search).get('returnTo') ?? '/home'

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (tokens) => {
      setAuth(tokens, username.trim())
      pushToast('Welcome back.', 'success')
      navigate(returnTo, { replace: true })
    },
  })

  const error = loginMutation.error instanceof ApiClientError ? loginMutation.error : null

  return (
    <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center py-8 md:py-10">
      <PublicPageAtmosphere variant="auth" />

      <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <section className="hidden max-w-xl space-y-6 lg:block">
          <Logo size="lg" />
          <h2 className="font-display text-6xl tracking-[-0.03em] text-white xl:text-7xl">
            Welcome back.
          </h2>
          <p className="text-base leading-8 text-[color:var(--color-text-secondary)] xl:text-lg">
            Return to your watch history, watchlists, reviews, favourites, and the people you
            follow.
          </p>
        </section>

        <Card className="w-full max-w-xl justify-self-center p-6 md:p-8 lg:justify-self-end xl:p-10">
          <div className="space-y-7">
            <div className="space-y-2">
              <Logo className="mb-3 lg:hidden" size="md" />
              <h1 className="font-display text-5xl tracking-[-0.03em] text-white md:text-6xl">
                Welcome back.
              </h1>
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Pick up your watch history, favourites, and everything queued up next.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                loginMutation.mutate({
                  password,
                  username: username.trim(),
                })
              }}
            >
              <FormField label="Username">
                <div className="relative">
                  <User
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
                  />
                  <Input
                    autoComplete="username"
                    className="pl-11"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    required
                    value={username}
                  />
                </div>
              </FormField>
              <FormField
                label="Password"
                trailing={
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="flex items-center text-[color:var(--color-text-tertiary)] transition hover:text-white"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword
                      ? <EyeOff aria-hidden="true" className="size-4" />
                      : <Eye aria-hidden="true" className="size-4" />}
                  </button>
                }
              >
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
                  />
                  <Input
                    autoComplete="current-password"
                    className="pl-11"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                </div>
              </FormField>

              {error ? (
                <div className="rounded-[var(--radius-panel)] border border-[rgba(255,180,171,0.24)] bg-[rgba(147,0,10,0.16)] px-4 py-3 text-sm text-white">
                  {getFriendlyLoginError(error)}
                </div>
              ) : null}

              <Button className="w-full gap-2" disabled={loginMutation.isPending} type="submit">
                {loginMutation.isPending ? (
                  'Logging in...'
                ) : (
                  <>
                    Log in
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-3 border-t border-white/10 pt-6 text-center text-sm text-[color:var(--color-text-tertiary)]">
              <p>
                Need a new verification email?{' '}
                <Link className="text-[color:var(--color-accent-strong)] hover:text-white" to="/verify-email">
                  Verify your account
                </Link>
              </p>
              <p>
                Don&apos;t have an account yet?{' '}
                <Link className="text-[color:var(--color-accent-strong)] hover:text-white" to="/register">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
