import { useState, useEffect } from 'react'

export function useLoading(ms = 400) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}

export function skeletonTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    baseColor:      isDark ? '#2a2d35' : '#e4e4e7',
    highlightColor: isDark ? '#383c47' : '#f4f4f5',
  }
}
