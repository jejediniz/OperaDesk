import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    globals: true,
    setupFiles: ['tests/setup.js']
  }
})
