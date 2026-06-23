import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { FollowRequestsPage } from '../pages/FollowRequestsPage'
import type { FollowRequestDTO } from '../types/api'
import { ApiClientError } from '../types/errors'
import { renderWithProviders } from './renderWithProviders'

const acceptFollowRequestMock = vi.fn()
const getReceivedFollowRequestsMock = vi.fn()
const rejectFollowRequestMock = vi.fn()

vi.mock('../api/socialApi', () => ({
  socialApi: {
    acceptFollowRequest: (...args: unknown[]) => acceptFollowRequestMock(...args),
    getReceivedFollowRequests: (...args: unknown[]) => getReceivedFollowRequestsMock(...args),
    rejectFollowRequest: (...args: unknown[]) => rejectFollowRequestMock(...args),
  },
}))

function createRequest(overrides: Partial<FollowRequestDTO> = {}): FollowRequestDTO {
  return {
    requestId: 1,
    requestedAt: '2026-06-10T12:00:00',
    requesterUserId: 9,
    requesterUsername: 'cinephile',
    status: 'PENDING',
    targetUserId: 4,
    targetUsername: 'viewer',
    ...overrides,
  }
}

function createPage(content: FollowRequestDTO[]) {
  return {
    content,
    empty: content.length === 0,
    first: true,
    last: true,
    number: 0,
    numberOfElements: content.length,
    size: 10,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
  }
}

describe('FollowRequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-21T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('renders pending follow requests', async () => {
    getReceivedFollowRequestsMock.mockResolvedValue(createPage([createRequest()]))

    renderWithProviders(
      <MemoryRouter initialEntries={['/follow-requests']}>
        <Routes>
          <Route element={<FollowRequestsPage />} path="/follow-requests" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('cinephile')).toBeInTheDocument()
    })

    expect(screen.getByText('Requested on Jun 10, 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  }, 10000)

  it('accepts a request and refreshes the list', async () => {
    const user = userEvent.setup()
    let currentRequests = [createRequest()]

    getReceivedFollowRequestsMock.mockImplementation(() => Promise.resolve(createPage(currentRequests)))
    acceptFollowRequestMock.mockImplementation(() => {
      currentRequests = []
      return Promise.resolve({ newStatus: 'ACCEPTED', requestId: 1 })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/follow-requests']}>
        <Routes>
          <Route element={<FollowRequestsPage />} path="/follow-requests" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('cinephile')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /accept/i }))

    await waitFor(() => {
      expect(screen.getByText('No pending requests')).toBeInTheDocument()
    })

    expect(screen.getByText('cinephile can now see your shared profile.')).toBeInTheDocument()
  })

  it('rejects a request and refreshes the list', async () => {
    const user = userEvent.setup()
    let currentRequests = [createRequest()]

    getReceivedFollowRequestsMock.mockImplementation(() => Promise.resolve(createPage(currentRequests)))
    rejectFollowRequestMock.mockImplementation(() => {
      currentRequests = []
      return Promise.resolve({ newStatus: 'REJECTED', requestId: 1 })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/follow-requests']}>
        <Routes>
          <Route element={<FollowRequestsPage />} path="/follow-requests" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('cinephile')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /decline/i }))

    await waitFor(() => {
      expect(screen.getByText('No pending requests')).toBeInTheDocument()
    })

    expect(screen.getByText('Request from cinephile declined.')).toBeInTheDocument()
  })

  it('shows a friendly message when a request was already handled', async () => {
    const user = userEvent.setup()
    let currentRequests = [createRequest()]

    getReceivedFollowRequestsMock.mockImplementation(() => Promise.resolve(createPage(currentRequests)))
    rejectFollowRequestMock.mockImplementation(() => {
      currentRequests = []
      return Promise.reject(
        new ApiClientError({
          code: 'FOLLOW_REQUEST_STATE_CONFLICT',
          fields: [],
          message: 'Conflict',
          status: 409,
        }),
      )
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/follow-requests']}>
        <Routes>
          <Route element={<FollowRequestsPage />} path="/follow-requests" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('cinephile')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /decline/i }))

    await waitFor(() => {
      expect(screen.getByText('This request was already handled.')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('No pending requests')).toBeInTheDocument()
    })
  })

  it('renders the empty state when there are no pending requests', async () => {
    getReceivedFollowRequestsMock.mockResolvedValue(createPage([]))

    renderWithProviders(
      <MemoryRouter initialEntries={['/follow-requests']}>
        <Routes>
          <Route element={<FollowRequestsPage />} path="/follow-requests" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No pending requests')).toBeInTheDocument()
    })
  })
})
