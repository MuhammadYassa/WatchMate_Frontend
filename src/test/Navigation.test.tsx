import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { authApi } from '../api/authApi'
import { useAuthStore } from '../auth/authStore'
import { DesktopNav } from '../components/navigation/DesktopNav'
import { MobileNav } from '../components/navigation/MobileNav'
import { MobileTopBar } from '../components/navigation/MobileTopBar'
import { renderWithProviders } from './renderWithProviders'

vi.mock('../api/authApi', () => ({
  authApi: {
    logout: vi.fn(),
  },
}))

const mockedAuthApi = vi.mocked(authApi)

function LocationProbe() {
  const location = useLocation()

  return <div data-testid="location">{location.pathname}</div>
}

describe('navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuthApi.logout.mockResolvedValue('Logged out successfully')
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

  it('exposes a logout control from the mobile account menu', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter initialEntries={['/home']}>
        <MobileTopBar />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('menuitem', { name: /log out/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /account menu for viewer/i }))

    const logoutItem = screen.getByRole('menuitem', { name: /log out/i })
    expect(logoutItem).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /view profile/i })).toBeInTheDocument()

    await user.click(logoutItem)

    await waitFor(() => {
      expect(mockedAuthApi.logout).toHaveBeenCalledWith({ refreshToken: 'refresh-token' })
    })
    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeUndefined()
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })

  it('closes the mobile account menu on outside click without logging out', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <MemoryRouter initialEntries={['/home']}>
        <MobileTopBar />
        <div data-testid="outside">outside</div>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /account menu for viewer/i }))
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))

    expect(screen.queryByRole('menuitem', { name: /log out/i })).not.toBeInTheDocument()
    expect(mockedAuthApi.logout).not.toHaveBeenCalled()
  })
})
