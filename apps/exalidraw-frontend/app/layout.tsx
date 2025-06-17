import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/Theme/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Exalidraw Clone - Draw. Think. Create Together.',
  description: 'The collaborative whiteboard that helps you sketch diagrams that have a hand-drawn feel. Express your ideas freely.',
  keywords: 'exalidraw, whiteboard, collaboration, drawing, diagrams, sketching',
  authors: [{ name: 'Exalidraw Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}