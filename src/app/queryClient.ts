import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = typeof error === 'object' && error && 'status' in error
          ? Number(error.status)
          : undefined

        if (status && status >= 400 && status < 500) {
          return false
        }

        return failureCount < 2
      },
      staleTime: 30_000,
    },
  },
})
