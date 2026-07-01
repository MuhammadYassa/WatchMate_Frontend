import { createBrowserRouter } from 'react-router-dom'

import { AuthGuardedRoute } from '../../auth/AuthGuardedRoute'
import { ProtectedRoute } from '../../auth/ProtectedRoute'
import { AppShell } from '../../components/layout/AppShell'
import { DiscoverPage } from '../../pages/DiscoverPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { FavouritesPage } from '../../pages/FavouritesPage'
import { HomePage } from '../../pages/HomePage'
import { LoginPage } from '../../pages/LoginPage'
import { MovieDetailPage } from '../../pages/MovieDetailPage'
import { FollowRequestsPage } from '../../pages/FollowRequestsPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { ProfileRedirectPage } from '../../pages/ProfileRedirectPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { SeasonEpisodesPage } from '../../pages/SeasonEpisodesPage'
import { SearchPage } from '../../pages/SearchPage'
import { ShowDetailPage } from '../../pages/ShowDetailPage'
import { SocialSearchPage } from '../../pages/SocialSearchPage'
import { VerifyEmailPage } from '../../pages/VerifyEmailPage'
import { WatchlistsPage } from '../../pages/WatchlistsPage'

export const appRouter = createBrowserRouter([
  {
    element: <AppShell />,
    path: '/',
    children: [
      {
        element: <HomePage />,
        path: '/',
      },
      {
        element: <AuthGuardedRoute element={<LoginPage />} />,
        path: '/login',
      },
      {
        element: <AuthGuardedRoute element={<RegisterPage />} />,
        path: '/register',
      },
      {
        element: <VerifyEmailPage />,
        path: '/verify-email',
      },
      {
        element: <HomePage />,
        path: '/home',
      },
      {
        element: <DiscoverPage />,
        path: '/discover',
      },
      {
        element: <SearchPage />,
        path: '/search',
      },
      {
        element: <MovieDetailPage />,
        path: '/movies/:tmdbId',
      },
      {
        element: <ShowDetailPage />,
        path: '/shows/:tmdbId',
      },
      {
        element: <SeasonEpisodesPage />,
        path: '/shows/:tmdbId/seasons/:seasonNumber/episodes',
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <WatchlistsPage />,
            path: '/watchlists',
          },
          {
            element: <FavouritesPage />,
            path: '/favourites',
          },
          {
            element: <DashboardPage />,
            path: '/dashboard',
          },
          {
            element: <ProfileRedirectPage />,
            path: '/profile',
          },
          {
            element: <ProfilePage />,
            path: '/social/profile/:username',
          },
          {
            element: <FollowRequestsPage />,
            path: '/follow-requests',
          },
          {
            element: <SocialSearchPage />,
            path: '/social/search',
          },
        ],
      },
    ],
  },
])
