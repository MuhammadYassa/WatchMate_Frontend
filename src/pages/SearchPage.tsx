import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { Clock3, Search as SearchIcon, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { searchApi } from '../api/searchApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SearchResultCard } from '../components/media/SearchResultCard'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import type { PaginatedSearchResponseDTO } from '../types/api'
import {
  clearRecentSearches,
  readRecentSearches,
  writeRecentSearch,
} from '../utils/recentSearches'

function SearchLoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-[24px]" />
      <Skeleton className="h-32 rounded-[24px]" />
      <Skeleton className="h-32 rounded-[24px]" />
    </div>
  )
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''
  const [draftQuery, setDraftQuery] = useState(queryParam)
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam)
  const [, setRecentSearchesVersion] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextValue = draftQuery.trim()
      setDebouncedQuery(nextValue)

      const nextParams = new URLSearchParams()
      if (nextValue) {
        nextParams.set('q', nextValue)
      }
      setSearchParams(nextParams, { replace: true })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [draftQuery, setSearchParams])

  const searchQuery = useInfiniteQuery<
    PaginatedSearchResponseDTO,
    Error,
    InfiniteData<PaginatedSearchResponseDTO>,
    [string, string],
    number
  >({
    enabled: debouncedQuery.length > 0,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => searchApi.searchMedia(debouncedQuery, pageParam),
    queryKey: ['search', debouncedQuery],
  })

  useEffect(() => {
    const firstPage = searchQuery.data?.pages[0]
    if (debouncedQuery && firstPage && firstPage.searchResults.length > 0) {
      writeRecentSearch(debouncedQuery)
    }
  }, [debouncedQuery, searchQuery.data])

  const recentSearches = readRecentSearches()

  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page: PaginatedSearchResponseDTO) => page.searchResults) ?? [],
    [searchQuery.data],
  )

  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:space-y-12 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(10,11,14,0.98)_100%)] px-5 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:px-8 md:py-10 lg:px-10 lg:py-12">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(173,198,255,0.15)_0%,rgba(173,198,255,0)_72%)]" />
        <div className="relative space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Search
            </p>
            <h1 className="max-w-4xl font-display text-5xl tracking-[-0.06em] text-white md:text-6xl xl:text-[5.1rem]">
              Find your next movie or show.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
              Search across the supported WatchMate catalog, save the names you keep returning to,
              and jump straight into the title you want to track next.
            </p>
          </div>

          <FormField label="Search for a movie or show">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
              />
              <Input
                className="h-16 rounded-[22px] border-white/10 bg-[rgba(255,255,255,0.04)] pl-14 pr-24 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 focus:border-[rgba(173,198,255,0.32)] focus:shadow-[0_0_0_1px_rgba(173,198,255,0.18),0_18px_55px_rgba(0,0,0,0.28)] md:h-20 md:text-lg"
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Search for a title"
                value={draftQuery}
              />
              {draftQuery ? (
                <button
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[color:var(--color-text-tertiary)] transition hover:text-white"
                  onClick={() => setDraftQuery('')}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </FormField>

          {!debouncedQuery && recentSearches.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                  Recent searches
                </p>
                <Button
                  onClick={() => {
                    clearRecentSearches()
                    setRecentSearchesVersion((current) => current + 1)
                  }}
                  variant="ghost"
                >
                  Clear recent
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((search) => (
                  <Button key={search} onClick={() => setDraftQuery(search)} variant="secondary">
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!debouncedQuery ? (
        <div className="relative z-10">
          <EmptyState
            body={
              recentSearches.length > 0
                ? 'Pick up from a recent search or start typing a title.'
                : 'Search for a movie or show to start browsing.'
            }
            heading={recentSearches.length > 0 ? 'Recent searches' : 'Start with a title'}
            icon={
              recentSearches.length > 0 ? (
                <Clock3 aria-hidden="true" className="size-5" />
              ) : (
                <Sparkles aria-hidden="true" className="size-5" />
              )
            }
          />
        </div>
      ) : null}

      {debouncedQuery && searchQuery.isLoading ? (
        <div className="relative z-10">
          <SearchLoadingState />
        </div>
      ) : null}

      {debouncedQuery && searchQuery.isError ? (
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => searchQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
          />
        </div>
      ) : null}

      {debouncedQuery && !searchQuery.isLoading && !searchQuery.isError && results.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            body={`No results for "${debouncedQuery}". Try another title or browse Discover instead.`}
            heading="No matches yet"
            icon={<SearchIcon aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {results.length > 0 ? (
        <section className="relative z-10 space-y-5">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Results
            </p>
            <h2 className="font-display text-3xl tracking-[-0.045em] text-white md:text-5xl">
              Results for "{debouncedQuery}"
            </h2>
          </div>
          <div className="space-y-4">
            {results.map((item) => (
              <SearchResultCard item={item} key={`${item.mediaType}-${item.id}`} />
            ))}
          </div>
          {searchQuery.hasNextPage ? (
            <Button
              className="w-full"
              disabled={searchQuery.isFetchingNextPage}
              onClick={() => void searchQuery.fetchNextPage()}
              variant="secondary"
            >
              {searchQuery.isFetchingNextPage ? 'Loading more...' : 'Load more'}
            </Button>
          ) : null}
        </section>
      ) : null}
    </PageContainer>
  )
}
