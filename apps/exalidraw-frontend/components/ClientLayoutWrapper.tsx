'use client'

import { ThemeProvider } from '@/components/Theme/ThemeProvider'

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
