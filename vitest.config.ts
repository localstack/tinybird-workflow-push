import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**'],
      reporter: ['json-summary', 'text', 'lcov']
    }
  }
})
