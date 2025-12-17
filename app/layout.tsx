import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Parkinsans, Delius } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { PreferencesProvider } from "@/components/preferences-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const parkinsans = Parkinsans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})
const delius = Delius({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
})

export const metadata: Metadata = {
  title: "CloudVPN Pro - Admin Panel",
  description: "Secure VPN management dashboard with advanced analytics and control",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${parkinsans.variable} ${delius.variable}`}>
      <body className="font-sans antialiased h-full overflow-auto bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" storageKey="cloudvpn-theme" enableSystem>
          <PreferencesProvider>
            <AuthProvider>{children}</AuthProvider>
          </PreferencesProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
