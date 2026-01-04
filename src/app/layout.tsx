/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeProvider } from "@/components/ui/theme-provider"
import { TanstackQueryClientProvider } from "@/lib/tanstack-query"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Shadcn + Tiptap Editor",
  description: "Shadcn + Tiptap Editor",
}

export interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={cn(inter.variable, "font-sans antialiased")}>
        <ThemeProvider attribute="class">
          <TanstackQueryClientProvider>{children}</TanstackQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
