import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid',
    },
  })
}

// jsdom does not implement the native <dialog> element's modal behavior.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
