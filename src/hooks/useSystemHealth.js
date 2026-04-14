import { useEffect, useState } from 'react'
import { fetchHealth } from '../lib/api'

export function useSystemHealth() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await fetchHealth()
        if (!active) return
        setHealth(data)
      } catch {
        if (!active) return
        setHealth(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 10000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return { health, loading }
}
