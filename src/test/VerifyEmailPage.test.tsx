import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'

import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { renderWithProviders } from './renderWithProviders'

const resendVerificationMock = vi.fn()
const verifyEmailMock = vi.fn()

vi.mock('../api/authApi', () => ({
  authApi: {
    resendVerification: (...args: unknown[]) => resendVerificationMock(...args),
    verifyEmail: (...args: unknown[]) => verifyEmailMock(...args),
  },
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies a token from the URL and shows the success state', async () => {
    verifyEmailMock.mockResolvedValueOnce('Email verified successfully')

    renderWithProviders(
      <MemoryRouter initialEntries={['/verify-email?token=abc123']}>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Email verified successfully.')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument()
    expect(verifyEmailMock).toHaveBeenCalledWith('abc123')
  })
})
