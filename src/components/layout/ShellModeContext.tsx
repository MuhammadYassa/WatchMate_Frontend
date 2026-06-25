import type { ReactNode } from 'react'

import type { ShellMode } from './shellMode'
import { shellModeContext } from './useShellMode'

export function ShellModeProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ShellMode
}) {
  return <shellModeContext.Provider value={value}>{children}</shellModeContext.Provider>
}
