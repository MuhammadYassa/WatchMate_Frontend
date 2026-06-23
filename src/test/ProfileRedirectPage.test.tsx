import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { screen } from '@testing-library/react'

import { useAuthStore } from '../auth/authStore'
import { ProfileRedirectPage } from '../pages/ProfileRedirectPage'
import { renderWithProviders } from './renderWithProviders'

function LocationProbe() {
  const location = useLocation()

  return <div>{location.pathname}{location.search}</div>
}

describe('ProfileRedirectPage', () => {
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

  it('redirects to the stored username profile route', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<ProfileRedirectPage />} path="/profile" />
          <Route element={<LocationProbe />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('/social/profile/viewer')).toBeInTheDocument()
  })

  it('shows a helpful state when the stored username is unavailable', () => {
    useAuthStore.setState({ username: null })

    renderWithProviders(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<ProfileRedirectPage />} path="/profile" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Your profile shortcut is unavailable')).toBeInTheDocument()
  })
})
