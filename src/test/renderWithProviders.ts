import type { ReactElement } from 'react'
import { render } from '@testing-library/react'

import { TestProviders } from './TestProviders'

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: TestProviders })
}
