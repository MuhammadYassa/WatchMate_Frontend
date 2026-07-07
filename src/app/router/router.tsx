import { createBrowserRouter } from 'react-router-dom'

import { AuthGuardedRoute } from '../../auth/AuthGuardedRoute'
import { ProtectedRoute } from '../../auth/ProtectedRoute'
import { AppShell } from '../../components/layout/AppShell'
import {
  DashboardPage,
  DiscoverPage,
  FavouritesPage,
  FollowRequestsPage,
  HomePage,
  LoginPage,
  MovieDetailPage,
  PrivacyPage,
  ProfilePage,
  ProfileRedirectPage,
  RegisterPage,
  SearchPage,
  SeasonEpisodesPage,
  ShowDetailPage,
  SocialSearchPage,
  TermsPage,
  VerifyEmailPage,
  WatchlistsPage,
} from './lazyPages'

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
        element: <TermsPage />,
        path: '/terms',
      },
      {
        element: <PrivacyPage />,
        path: '/privacy',
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
