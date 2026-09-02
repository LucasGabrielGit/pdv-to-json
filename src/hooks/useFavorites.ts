'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

const FAVORITES_KEY = 'dev_kit_favorites'
const RECENTS_KEY = 'dev_kit_recents'
const MAX_RECENTS = 8
const CHANGE_EVENT = 'dev-kit-favorites-change'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  // 1. Initial instant load from localStorage
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

  // 2. Cloud sync if user is authenticated
  useEffect(() => {
    loadData()

    let isMounted = true

    async function syncWithCloud() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !isMounted) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_tools, recent_tools')
          .eq('id', user.id)
          .single()

        if (profile && isMounted) {
          const rawFavs = localStorage.getItem(FAVORITES_KEY)
          const rawRecs = localStorage.getItem(RECENTS_KEY)
          const localFavs: string[] = rawFavs ? JSON.parse(rawFavs) : []
          const localRecs: string[] = rawRecs ? JSON.parse(rawRecs) : []

          const cloudFavs: string[] = profile.favorite_tools || []
          const cloudRecs: string[] = profile.recent_tools || []

          // Merge: Cloud + Local, preserving uniqueness
          const mergedFavs = Array.from(new Set([...cloudFavs, ...localFavs]))
          // Keep chronological order: local recents take precedence, then cloud
          const mergedRecs = Array.from(new Set([...localRecs, ...cloudRecs])).slice(0, MAX_RECENTS)

          localStorage.setItem(FAVORITES_KEY, JSON.stringify(mergedFavs))
          localStorage.setItem(RECENTS_KEY, JSON.stringify(mergedRecs))
          setFavorites(mergedFavs)
          setRecents(mergedRecs)

          // Update cloud if local has new additions
          if (mergedFavs.length !== cloudFavs.length || mergedRecs.length !== cloudRecs.length) {
            await supabase
              .from('profiles')
              .update({
                favorite_tools: mergedFavs,
                recent_tools: mergedRecs,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)
          }
        }
      } catch {
        // Offline / network failure fallback
      }
    }

    syncWithCloud()

    const handleStorage = () => loadData()
    window.addEventListener(CHANGE_EVENT, handleStorage)
    window.addEventListener('storage', handleStorage)

    return () => {
      isMounted = false
      window.removeEventListener(CHANGE_EVENT, handleStorage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [loadData, supabase])

  const notifyChange = () => {
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  )

  const toggleFavorite = useCallback(
    async (toolId: string) => {
      try {
        const next = favorites.includes(toolId)
          ? favorites.filter((id) => id !== toolId)
          : [...favorites, toolId]

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
        setFavorites(next)
        notifyChange()

        // Sync to cloud if user is logged in
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({
              favorite_tools: next,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      } catch {
        // ignore storage errors
      }
    },
    [favorites, supabase]
  )

  const addRecent = useCallback(
    async (toolId: string) => {
      try {
        const raw = localStorage.getItem(RECENTS_KEY)
        const current: string[] = raw ? JSON.parse(raw) : []
        const filtered = current.filter((id) => id !== toolId)
        // Most recent ALWAYS at index 0
        const next = [toolId, ...filtered].slice(0, MAX_RECENTS)

        localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
        setRecents(next)
        notifyChange()

        // Sync to cloud if user is logged in
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({
              recent_tools: next,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      } catch {
        // ignore storage errors
      }
    },
    [supabase]
  )

  const clearRecents = useCallback(
    async () => {
      try {
        localStorage.removeItem(RECENTS_KEY)
        setRecents([])
        notifyChange()

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({
              recent_tools: [],
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      } catch {
        // ignore storage errors
      }
    },
    [supabase]
  )

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
