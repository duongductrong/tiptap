/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeProvider } from "@/components/ui/theme-provider"
import { routing } from "@/i18n/routing"
import { TanstackQueryClientProvider } from "@/lib/tanstack-query"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import "../globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Next Starter",
  description: "Next Starter",
}

export interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = (await params).locale || "en"

  if (!routing.locales.includes(locale as any)) {
    return notFound()
  }

  const [messages] = await Promise.all([getMessages({ locale: locale })])

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.variable, "font-sans antialiased")}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class">
            <TanstackQueryClientProvider>
              {/* <SessionProvider session={session}>{children}</SessionProvider> */}
              {children}
            </TanstackQueryClientProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
