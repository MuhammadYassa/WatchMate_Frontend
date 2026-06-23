import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { RegisterPage } from '../pages/RegisterPage'
import { renderWithProviders } from './renderWithProviders'

const registerMock = vi.fn()

vi.mock('../api/authApi', () => ({
  authApi: {
    register: (...args: unknown[]) => registerMock(...args),
  },
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the verification-needed success state after registration', async () => {
    registerMock.mockResolvedValueOnce('Registration successful')

    renderWithProviders(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Choose a username'), {
      target: { value: 'newviewer' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'newviewer@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'Password1!' },
    })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), {
      target: { value: 'Password1!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() => {
      expect(screen.getByText('Your account is almost ready.')).toBeInTheDocument()
    })

    expect(screen.getByText(/newviewer@example.com/i)).toBeInTheDocument()
    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(registerMock.mock.calls[0]?.[0]).toEqual({
      email: 'newviewer@example.com',
      password: 'Password1!',
      username: 'newviewer',
    })
  })
})
