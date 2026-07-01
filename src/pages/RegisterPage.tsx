import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { authApi } from '../api/authApi'
import { Logo } from '../components/branding/Logo'
import { PageContainer } from '../components/layout/PageContainer'
import { PublicPageAtmosphere } from '../components/public/PublicPageAtmosphere'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { getButtonClassName } from '../components/ui/buttonStyles'
import { ApiClientError } from '../types/errors'

function validatePassword(password: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)
}

function getRegisterError(error: ApiClientError | null) {
  if (!error) {
    return null
  }

  if (error.code === 'DUPLICATE_USERNAME') {
    return 'That username is already taken.'
  }

  if (error.code === 'DUPLICATE_EMAIL') {
    return 'That email address is already in use.'
  }

  if (error.code === 'REGISTRATION_CONFLICT') {
    return 'That account already exists. Try logging in instead.'
  }

  return error.message
}

export function RegisterPage() {
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState('')

  const passwordIsValid = useMemo(() => validatePassword(password), [password])
  const passwordMatches = confirmPassword.length > 0 && password === confirmPassword

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  })

  const error = registerMutation.error instanceof ApiClientError ? registerMutation.error : null

  if (registerMutation.isSuccess) {
    return (
      <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center justify-center py-8 md:py-10">
        <PublicPageAtmosphere variant="verify" />
        <Card className="w-full max-w-2xl space-y-6 p-7 text-center md:p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[var(--radius-panel)] border border-white/10 bg-[rgba(47,174,126,0.07)] text-[color:var(--color-accent)]">
            <ShieldCheck aria-hidden="true" className="size-9" />
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-5xl tracking-[-0.03em] text-white md:text-6xl">
              Your account is almost ready.
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
              We&apos;ve sent a verification link to <span className="text-white">{email}</span>.
              Verify your email before logging in.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link className={getButtonClassName('primary')} to="/verify-email">
              Verify or resend email
            </Link>
            <Link className={getButtonClassName('secondary')} to="/login">
              Go to login
            </Link>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center py-8 md:py-10">
      <PublicPageAtmosphere variant="auth" />

      <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <section className="hidden max-w-xl space-y-6 lg:block">
          <Logo size="lg" />
          <h2 className="font-display text-6xl tracking-[-0.03em] text-white xl:text-7xl">
            Start tracking for free.
          </h2>
          <p className="text-base leading-8 text-[color:var(--color-text-secondary)] xl:text-lg">
            Create your WatchMate account and keep discovery, progress, reviews, watchlists, and
            your social circle in one cinematic place.
          </p>
        </section>

        <Card className="w-full max-w-xl justify-self-center p-6 md:p-8 lg:justify-self-end xl:p-10">
          <div className="space-y-7">
            <div className="space-y-2">
              <Logo className="mb-3 lg:hidden" size="md" />
              <h1 className="font-display text-5xl tracking-[-0.03em] text-white md:text-6xl">
                Start tracking for free.
              </h1>
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Create your WatchMate account and keep your watch history, progress, and favourites
                in one place.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                if (!passwordIsValid || !passwordMatches) {
                  return
                }

                registerMutation.mutate({
                  email: email.trim(),
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
                    placeholder="Choose a username"
                    required
                    value={username}
                  />
                </div>
              </FormField>
              <FormField label="Email">
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
                  />
                  <Input
                    autoComplete="email"
                    className="pl-11"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </FormField>
              <FormField
                error={password.length > 0 && !passwordIsValid ? 'Use at least 8 characters with a letter, number, and symbol.' : null}
                hint="Use at least 8 characters, including a letter, number, and symbol."
                label="Password"
                trailing={
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="flex items-center text-[color:var(--color-text-tertiary)] transition hover:text-white"
                    onClick={() => setShowPassword((c) => !c)}
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
                    autoComplete="new-password"
                    className="pl-11"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                </div>
              </FormField>
              <FormField
                error={confirmPassword.length > 0 && !passwordMatches ? 'Passwords need to match.' : null}
                label="Confirm password"
                trailing={
                  <button
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="flex items-center text-[color:var(--color-text-tertiary)] transition hover:text-white"
                    onClick={() => setShowConfirmPassword((c) => !c)}
                    type="button"
                  >
                    {showConfirmPassword
                      ? <EyeOff aria-hidden="true" className="size-4" />
                      : <Eye aria-hidden="true" className="size-4" />}
                  </button>
                }
              >
                <div className="relative">
                  <ShieldCheck
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
                  />
                  <Input
                    autoComplete="new-password"
                    className="pl-11"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                  />
                </div>
              </FormField>

              {error ? (
                <div className="rounded-[var(--radius-panel)] border border-[rgba(255,180,171,0.24)] bg-[rgba(147,0,10,0.16)] px-4 py-3 text-sm text-white">
                  {getRegisterError(error)}
                </div>
              ) : null}

              <Button
                className="w-full gap-2"
                disabled={registerMutation.isPending || !passwordIsValid || !passwordMatches}
                type="submit"
              >
                {registerMutation.isPending ? (
                  'Creating account...'
                ) : (
                  <>
                    Sign up
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="border-t border-white/10 pt-6 text-center text-sm text-[color:var(--color-text-tertiary)]">
              Already have an account?{' '}
              <Link className="text-[color:var(--color-accent-strong)] hover:text-white" to="/login">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
