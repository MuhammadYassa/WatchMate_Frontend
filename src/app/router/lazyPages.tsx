import { lazy } from 'react'

// Route-level code splitting: each page loads on first navigation instead of
// shipping in the entry chunk. The Suspense boundary lives in AppShell so the
// shell chrome stays visible while a page chunk loads.
export const DiscoverPage = lazy(() => import('../../pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })))
export const DashboardPage = lazy(() => import('../../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
export const FavouritesPage = lazy(() => import('../../pages/FavouritesPage').then((m) => ({ default: m.FavouritesPage })))
export const HomePage = lazy(() => import('../../pages/HomePage').then((m) => ({ default: m.HomePage })))
export const PrivacyPage = lazy(() => import('../../pages/LegalPage').then((m) => ({ default: m.PrivacyPage })))
export const TermsPage = lazy(() => import('../../pages/LegalPage').then((m) => ({ default: m.TermsPage })))
export const LoginPage = lazy(() => import('../../pages/LoginPage').then((m) => ({ default: m.LoginPage })))
export const MovieDetailPage = lazy(() => import('../../pages/MovieDetailPage').then((m) => ({ default: m.MovieDetailPage })))
export const FollowRequestsPage = lazy(() => import('../../pages/FollowRequestsPage').then((m) => ({ default: m.FollowRequestsPage })))
export const ProfilePage = lazy(() => import('../../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
export const ProfileRedirectPage = lazy(() => import('../../pages/ProfileRedirectPage').then((m) => ({ default: m.ProfileRedirectPage })))
export const RegisterPage = lazy(() => import('../../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
export const SeasonEpisodesPage = lazy(() => import('../../pages/SeasonEpisodesPage').then((m) => ({ default: m.SeasonEpisodesPage })))
export const SearchPage = lazy(() => import('../../pages/SearchPage').then((m) => ({ default: m.SearchPage })))
export const ShowDetailPage = lazy(() => import('../../pages/ShowDetailPage').then((m) => ({ default: m.ShowDetailPage })))
export const SocialSearchPage = lazy(() => import('../../pages/SocialSearchPage').then((m) => ({ default: m.SocialSearchPage })))
export const VerifyEmailPage = lazy(() => import('../../pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))
export const WatchlistsPage = lazy(() => import('../../pages/WatchlistsPage').then((m) => ({ default: m.WatchlistsPage })))
