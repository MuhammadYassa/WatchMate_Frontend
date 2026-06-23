import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { screen } from '@testing-library/react'

import { useAuthStore } from '../auth/authStore'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { renderWithProviders } from './renderWithProviders'

function LoginLocationProbe() {
  const location = useLocation()

  return <div>{location.pathname}{location.search}</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: undefined,
      accessTokenExpiry: undefined,
      refreshToken: undefined,
      sessionExpired: false,
      tokenType: undefined,
      username: null,
    })
  })

  it('redirects unauthenticated users to login with a returnTo param', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<div>Private content</div>} path="/dashboard" />
          </Route>
          <Route element={<LoginLocationProbe />} path="/login" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('/login?returnTo=%2Fdashboard')).toBeInTheDocument()
  })
})
