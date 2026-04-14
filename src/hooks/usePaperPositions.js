import { useEffect, useState } from 'react'
import { fetchPaperPositions } from '../lib/api'

export function usePaperPositions() {
  const [positions, setPositions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await fetchPaperPositions()
        if (!active) return
        setPositions(data.positions || [])
        setSummary(data.summary || null)
      } catch {
        if (!active) return
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return { positions, summary, loading }
}
