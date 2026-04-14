const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8787'

export async function fetchMarket(symbol) {
  const response = await fetch(`${API_BASE}/api/market/${symbol}`)
  if (!response.ok) throw new Error('Failed to load market data')
  return response.json()
}

export function subscribeMarket(symbol, onMessage, onError) {
  const source = new EventSource(`${API_BASE}/api/stream/${symbol}`)
  source.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch (error) {
      onError?.(error)
    }
  }
  source.onerror = (error) => {
    onError?.(error)
  }
  return () => source.close()
}

export async function analyzeTrade(payload) {
  const response = await fetch(`${API_BASE}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('Failed to analyze trade')
  return response.json()
}

export async function executeTrade(payload) {
  const response = await fetch(`${API_BASE}/api/openclaw/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.message || 'Failed to execute trade')
  return data
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/api/openclaw/orders`)
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

export async function fetchPaperPositions() {
  const response = await fetch(`${API_BASE}/api/paper/positions`)
  if (!response.ok) throw new Error('Failed to fetch paper positions')
  return response.json()
}

export async function fetchPaperSummary() {
  const response = await fetch(`${API_BASE}/api/paper/summary`)
  if (!response.ok) throw new Error('Failed to fetch paper summary')
  return response.json()
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) throw new Error('Failed to fetch health')
  return response.json()
}

export { API_BASE }
