'use client'

import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'dev_kit_favorites'
const RECENTS_KEY = 'dev_kit_recents'
const MAX_RECENTS = 8
const CHANGE_EVENT = 'dev-kit-favorites-change'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = useCallback(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY)
      const rec = localStorage.getItem(RECENTS_KEY)
      if (favs) setFavorites(JSON.parse(favs))
      if (rec) setRecents(JSON.parse(rec))
    } catch {
      // ignore storage errors
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleStorage = () => loadData()
    window.addEventListener(CHANGE_EVENT, handleStorage)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleStorage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [loadData])

  const notifyChange = () => {
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  )

  const toggleFavorite = useCallback(
    (toolId: string) => {
      try {
        const next = favorites.includes(toolId)
          ? favorites.filter((id) => id !== toolId)
          : [...favorites, toolId]

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
        setFavorites(next)
        notifyChange()
      } catch {
        // ignore storage errors
      }
    },
    [favorites]
  )

  const addRecent = useCallback((toolId: string) => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY)
      const current: string[] = raw ? JSON.parse(raw) : []
      const filtered = current.filter((id) => id !== toolId)
      const next = [toolId, ...filtered].slice(0, MAX_RECENTS)

      localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
      setRecents(next)
      notifyChange()
    } catch {
      // ignore storage errors
    }
  }, [])

  const clearRecents = useCallback(() => {
    try {
      localStorage.removeItem(RECENTS_KEY)
      setRecents([])
      notifyChange()
    } catch {
      // ignore storage errors
    }
  }, [])

  return {
    favorites,
    recents,
    isLoaded,
    isFavorite,
    toggleFavorite,
    addRecent,
    clearRecents,
  }
}
