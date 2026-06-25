import { createContext, useContext } from 'react'

import type { ShellMode } from './shellMode'

export const shellModeContext = createContext<ShellMode>('topbar')

export function useShellMode() {
  return useContext(shellModeContext)
}
