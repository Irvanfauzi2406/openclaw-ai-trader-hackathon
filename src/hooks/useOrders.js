import { useEffect, useState } from 'react'
import { fetchOrders } from '../lib/api'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await fetchOrders()
        if (!active) return
        setOrders(data.orders || [])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 2500)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return { orders, loading }
}
