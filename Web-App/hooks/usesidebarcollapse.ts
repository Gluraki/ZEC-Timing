"use client"

import { useCallback, useState } from "react"

export function useSidebarCollapse(defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return {
    collapsed,
    setCollapsed,
    toggle,
  }
}
