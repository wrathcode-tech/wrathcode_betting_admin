import { createContext, useContext, useState, useCallback } from 'react'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), [])
  const closeMobileSidebar = useCallback(() => setSidebarMobileOpen(false), [])

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        sidebarMobileOpen,
        setSidebarMobileOpen,
        closeMobileSidebar,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  return ctx || { sidebarCollapsed: false, toggleSidebar: () => {}, commandPaletteOpen: false, setCommandPaletteOpen: () => {} }
}
