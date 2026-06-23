interface JwtPayload {
  sub?: string
  role?: string
}

function safeBase64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const padded = padding === 0 ? normalized : normalized + '='.repeat(4 - padding)

  try {
    return atob(padded)
  } catch {
    return null
  }
}

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  const decoded = safeBase64UrlDecode(parts[1])
  if (!decoded) {
    return null
  }

  try {
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

export function getJwtSubject(token: string | null | undefined) {
  return decodeJwtPayload(token)?.sub ?? null
}
