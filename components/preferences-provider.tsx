"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { fetchWithAuth } from "@/lib/api-client"

type ColorScheme = "blue" | "purple" | "green" | "orange" | "pink"
type SidebarDensity = "compact" | "comfortable" | "spacious"

interface PreferencesContextType {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  sidebarDensity: SidebarDensity
  setSidebarDensity: (density: SidebarDensity) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("blue")
  const [sidebarDensity, setSidebarDensityState] = useState<SidebarDensity>("comfortable")
  const { user } = useAuth()

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedScheme = localStorage.getItem("colorScheme") as ColorScheme | null
    const savedDensity = localStorage.getItem("sidebarDensity") as SidebarDensity | null

    if (savedScheme) {
      setColorSchemeState(savedScheme)
      applyColorScheme(savedScheme)
    }
    if (savedDensity) {
      setSidebarDensityState(savedDensity)
    }
  }, [])

  // Sync with Cloud when user logs in
  useEffect(() => {
    if (!user) return

    const fetchPreferences = async () => {
      try {
        const res = await fetchWithAuth("/api/preferences")
        if (res.ok) {
          const data = await res.json()
          const prefs = data.preferences
          if (prefs) {
            if (prefs.colorScheme) {
              setColorSchemeState(prefs.colorScheme)
              applyColorScheme(prefs.colorScheme)
              localStorage.setItem("colorScheme", prefs.colorScheme)
            }
            if (prefs.sidebarDensity) {
              setSidebarDensityState(prefs.sidebarDensity)
              localStorage.setItem("sidebarDensity", prefs.sidebarDensity)
            }
          }
        }
      } catch (error) {
        console.error("Failed to sync preferences", error)
      }
    }

    fetchPreferences()
  }, [user])

  const saveToCloud = async (newPrefs: any) => {
    if (!user) return
    try {
      // We get current state, but better to pass the new change
      // Since react state update is async, we should be passed the full new object or specific field
      // For simplicity, we just PUSH the specific field update effectively
      await fetchWithAuth("/api/preferences", {
        method: "POST",
        body: JSON.stringify({ preferences: newPrefs })
      })
    } catch (e) {
      console.error("Failed to save preference to cloud", e)
    }
  }

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme)
    localStorage.setItem("colorScheme", scheme)
    applyColorScheme(scheme)
    saveToCloud({ colorScheme: scheme })
  }

  const setSidebarDensity = (density: SidebarDensity) => {
    setSidebarDensityState(density)
    localStorage.setItem("sidebarDensity", density)
    saveToCloud({ sidebarDensity: density })
  }

  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement

    // Color scheme definitions
    const schemes = {
      blue: {
        light: {
          primary: "oklch(0.55 0.22 254)",
          secondary: "oklch(0.65 0.2 190)",
          accent: "oklch(0.7 0.25 305)",
        },
        dark: {
          primary: "oklch(0.65 0.25 254)",
          secondary: "oklch(0.72 0.22 190)",
          accent: "oklch(0.75 0.28 305)",
        },
      },
      purple: {
        light: {
          primary: "oklch(0.55 0.24 290)",
          secondary: "oklch(0.6 0.26 320)",
          accent: "oklch(0.65 0.22 260)",
        },
        dark: {
          primary: "oklch(0.65 0.28 290)",
          secondary: "oklch(0.7 0.3 320)",
          accent: "oklch(0.72 0.26 260)",
        },
      },
      green: {
        light: {
          primary: "oklch(0.55 0.2 150)",
          secondary: "oklch(0.6 0.22 170)",
          accent: "oklch(0.65 0.18 130)",
        },
        dark: {
          primary: "oklch(0.65 0.24 150)",
          secondary: "oklch(0.7 0.26 170)",
          accent: "oklch(0.72 0.22 130)",
        },
      },
      orange: {
        light: {
          primary: "oklch(0.6 0.22 35)",
          secondary: "oklch(0.65 0.24 50)",
          accent: "oklch(0.7 0.2 20)",
        },
        dark: {
          primary: "oklch(0.68 0.26 35)",
          secondary: "oklch(0.72 0.28 50)",
          accent: "oklch(0.75 0.24 20)",
        },
      },
      pink: {
        light: {
          primary: "oklch(0.6 0.24 340)",
          secondary: "oklch(0.65 0.26 350)",
          accent: "oklch(0.7 0.22 10)",
        },
        dark: {
          primary: "oklch(0.68 0.28 340)",
          secondary: "oklch(0.72 0.3 350)",
          accent: "oklch(0.75 0.26 10)",
        },
      },
    }

    const isDark = root.classList.contains("dark")
    const colors = schemes[scheme][isDark ? "dark" : "light"]

    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--secondary", colors.secondary)
    root.style.setProperty("--accent", colors.accent)
    root.style.setProperty("--sidebar-primary", colors.primary)
    root.style.setProperty("--ring", colors.primary)
  }

  return (
    <PreferencesContext.Provider value={{ colorScheme, setColorScheme, sidebarDensity, setSidebarDensity }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
