import { useEffect, useState } from 'react'
import { fetchMarket, subscribeMarket } from '../lib/api'

export function useMarketData(symbol) {
  const [market, setMarket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    let active = true
    let unsubscribe = null

    async function load() {
      try {
        setLoading(true)
        const data = await fetchMarket(symbol)
        if (!active) return
        setMarket(data)
        setError('')
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to fetch market data')
      } finally {
        if (active) setLoading(false)
      }
    }

    load().then(() => {
      if (!active) return
      unsubscribe = subscribeMarket(
        symbol,
        (payload) => {
          if (!active) return
          setMarket(payload)
          setError('')
          setStreaming(['binance-stream', 'binance', 'coingecko'].includes(payload?.source))
        },
        () => {
          if (!active) return
          setStreaming(false)
        },
      )
    })

    return () => {
      active = false
      unsubscribe?.()
      setStreaming(false)
    }
  }, [symbol])

  return { market, loading, error, streaming }
}
