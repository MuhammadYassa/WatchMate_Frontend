import { MailCheck, MailPlus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

import { authApi } from '../api/authApi'
import { PageContainer } from '../components/layout/PageContainer'
import { PublicPageAtmosphere } from '../components/public/PublicPageAtmosphere'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { getButtonClassName } from '../components/ui/buttonStyles'
import { ApiClientError } from '../types/errors'

export function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const verifyQuery = useQuery({
    enabled: Boolean(token),
    queryFn: () => authApi.verifyEmail(token ?? ''),
    queryKey: ['verify-email', token],
    retry: false,
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setEmail('')
    },
  })

  const resendError = resendMutation.error instanceof ApiClientError ? resendMutation.error.message : null
  const verifyError = verifyQuery.error instanceof ApiClientError ? verifyQuery.error.message : null

  return (
    <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center py-8 md:py-10">
      <PublicPageAtmosphere variant="verify" />

      <div className="grid w-full gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
        <Card className="space-y-6 p-6 md:p-8 xl:p-10">
          <div className="space-y-4">
            <div className="flex size-18 items-center justify-center rounded-[24px] border border-white/10 bg-[rgba(216,226,255,0.08)] text-[color:var(--color-accent)]">
              <MailCheck aria-hidden="true" className="size-8" />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
                Verify your account
              </p>
              <h1 className="font-display text-5xl tracking-[-0.05em] text-white md:text-6xl">
                Finish setting up WatchMate.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Open your verification link or request a fresh email below.
              </p>
            </div>
          </div>

          {token ? (
            <div className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6">
              {verifyQuery.isLoading ? (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Verifying
                  </p>
                  <h2 className="font-display text-4xl tracking-[-0.04em] text-white">
                    Checking your link...
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    We&apos;re confirming your email right now.
                  </p>
                </div>
              ) : verifyQuery.isSuccess ? (
                <div className="space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#d1fae5]">Verified</p>
                  <h2 className="font-display text-4xl tracking-[-0.04em] text-white">
                    You&apos;re verified.
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {verifyQuery.data}
                  </p>
                  <Link className={getButtonClassName('primary')} to="/login">
                    Continue to login
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-warning)]">
                    Link issue
                  </p>
                  <h2 className="font-display text-4xl tracking-[-0.04em] text-white">
                    That verification link didn&apos;t work.
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {verifyError || 'The link may have expired. Request a new one below.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No token in the URL? You can still resend a verification email below.
            </div>
          )}

          <div className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-start gap-3">
              <Sparkles aria-hidden="true" className="mt-1 size-5 text-[color:var(--color-accent)]" />
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                After verification, your existing login flow stays the same. No extra setup, no
                extra steps beyond confirming the email you signed up with.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5 p-6 md:p-8">
          <div className="space-y-3">
            <div className="flex size-14 items-center justify-center rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
              <MailPlus aria-hidden="true" className="size-6" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-tertiary)]">
              Resend verification
            </p>
            <h2 className="font-display text-4xl tracking-[-0.04em] text-white">
              Send a fresh verification email.
            </h2>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Use the same email you signed up with. We&apos;ll send you a new verification link.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              resendMutation.mutate(email.trim())
            }}
          >
            <FormField label="Email">
              <Input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </FormField>
            {resendMutation.isSuccess ? (
              <div className="rounded-[22px] border border-[rgba(167,243,208,0.22)] bg-[rgba(6,78,59,0.24)] px-4 py-3 text-sm text-white">
                {resendMutation.data}
              </div>
            ) : null}
            {resendError ? (
              <div className="rounded-[22px] border border-[rgba(255,180,171,0.24)] bg-[rgba(147,0,10,0.16)] px-4 py-3 text-sm text-white">
                {resendError}
              </div>
            ) : null}
            <Button className="w-full" disabled={resendMutation.isPending} type="submit">
              {resendMutation.isPending ? 'Sending...' : 'Send verification email'}
            </Button>
          </form>

          <p className="border-t border-white/10 pt-5 text-sm text-[color:var(--color-text-tertiary)]">
            Already verified?{' '}
            <Link className="text-[color:var(--color-accent-strong)] hover:text-white" to="/login">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </PageContainer>
  )
}
