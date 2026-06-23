import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'

import { useAuthStore } from '../auth/authStore'
import { DesktopNav } from '../components/navigation/DesktopNav'
import { MobileNav } from '../components/navigation/MobileNav'
import { renderWithProviders } from './renderWithProviders'

describe('navigation', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-21T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('shows desktop dashboard and library links for logged-in users', () => {
    renderWithProviders(
      <MemoryRouter>
        <DesktopNav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Watchlists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Favourites' })).toBeInTheDocument()
  })

  it('keeps the mobile nav focused on home, search, dashboard, lists, and profile', () => {
    renderWithProviders(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /lists/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /favourites/i })).not.toBeInTheDocument()
  })
})
