import { CheckCircle2, MailPlus, XCircle } from 'lucide-react'
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

function ResendForm({
  email,
  error,
  isPending,
  isSuccess,
  onChangeEmail,
  onSubmit,
  successMessage,
}: {
  email: string
  error: string | null
  isPending: boolean
  isSuccess: boolean
  onChangeEmail: (value: string) => void
  onSubmit: () => void
  successMessage?: string
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <FormField label="Email">
        <Input
          onChange={(event) => onChangeEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </FormField>
      {isSuccess ? (
        <div className="rounded-[var(--radius-panel)] border border-[rgba(167,243,208,0.22)] bg-[rgba(6,78,59,0.24)] px-4 py-3 text-sm text-white">
          {successMessage || 'Verification email sent.'}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[var(--radius-panel)] border border-[rgba(255,180,171,0.24)] bg-[rgba(147,0,10,0.16)] px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? 'Sending...' : 'Send verification email'}
      </Button>
    </form>
  )
}

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

  if (token) {
    return (
      <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center justify-center py-8 md:py-10">
        <PublicPageAtmosphere variant="verify" />

        <Card className="w-full max-w-xl space-y-6 p-7 text-center md:p-10">
          {verifyQuery.isLoading ? (
            <>
              <div className="mx-auto flex size-20 items-center justify-center rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.04] text-[color:var(--color-text-tertiary)]">
                <MailPlus aria-hidden="true" className="size-9" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl tracking-[-0.03em] text-white md:text-5xl">
                  Verifying your email...
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Confirming your link now.
                </p>
              </div>
            </>
          ) : verifyQuery.isSuccess ? (
            <>
              <div className="mx-auto flex size-20 items-center justify-center rounded-[var(--radius-panel)] border border-[rgba(167,243,208,0.20)] bg-[rgba(6,78,59,0.18)] text-emerald-300">
                <CheckCircle2 aria-hidden="true" className="size-9" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl tracking-[-0.03em] text-white md:text-5xl">
                  Email verified successfully.
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Your account is ready. Log in to start tracking.
                </p>
              </div>
              <Link className={getButtonClassName('primary', 'mx-auto')} to="/login">
                Go to login
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-20 items-center justify-center rounded-[var(--radius-panel)] border border-[rgba(255,180,171,0.20)] bg-[rgba(147,0,10,0.14)] text-[color:var(--color-error)]">
                <XCircle aria-hidden="true" className="size-9" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl tracking-[-0.03em] text-white md:text-5xl">
                  That link didn&apos;t work.
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {verifyError || 'The link may have expired. Request a new one below.'}
                </p>
              </div>
              <ResendForm
                email={email}
                error={resendError}
                isPending={resendMutation.isPending}
                isSuccess={resendMutation.isSuccess}
                onChangeEmail={setEmail}
                onSubmit={() => resendMutation.mutate(email.trim())}
                successMessage={resendMutation.data}
              />
            </>
          )}
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="relative isolate flex min-h-[calc(100dvh-8rem)] items-center justify-center py-8 md:py-10">
      <PublicPageAtmosphere variant="verify" />

      <Card className="w-full max-w-xl space-y-6 p-7 md:p-10">
        <div className="space-y-4">
          <div className="flex size-16 items-center justify-center rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.04] text-[color:var(--color-accent)]">
            <MailPlus aria-hidden="true" className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-4xl tracking-[-0.03em] text-white md:text-5xl">
              Verify your email.
            </h1>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Enter the email you signed up with to receive a new verification link.
            </p>
          </div>
        </div>

        <ResendForm
          email={email}
          error={resendError}
          isPending={resendMutation.isPending}
          isSuccess={resendMutation.isSuccess}
          onChangeEmail={setEmail}
          onSubmit={() => resendMutation.mutate(email.trim())}
          successMessage={resendMutation.data}
        />

        <p className="border-t border-white/10 pt-5 text-sm text-[color:var(--color-text-tertiary)]">
          Already verified?{' '}
          <Link className="text-[color:var(--color-accent-strong)] hover:text-white" to="/login">
            Log in
          </Link>
        </p>
      </Card>
    </PageContainer>
  )
}
