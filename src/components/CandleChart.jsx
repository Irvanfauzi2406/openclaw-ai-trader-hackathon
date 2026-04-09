import { useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

function generateCandles(seed = 68200, points = 120) {
  const data = []
  let lastClose = seed
  const start = Math.floor(Date.now() / 1000) - points * 60

  for (let i = 0; i < points; i++) {
    const open = lastClose
    const drift = (Math.random() - 0.46) * 130
    const close = Math.max(100, open + drift)
    const high = Math.max(open, close) + Math.random() * 80
    const low = Math.min(open, close) - Math.random() * 80

    data.push({ time: start + i * 60, open, high, low, close })
    lastClose = close
  }

  return data
}

const seeds = {
  BTCUSDT: 68200,
  ETHUSDT: 3480,
  SOLUSDT: 180,
  AVAXUSDT: 54,
}

export function CandleChart({ symbol, candles = [] }) {
  const containerRef = useRef(null)
  const latest = candles?.[candles.length - 1]
  const previous = candles?.[candles.length - 2]
  const direction = latest && previous ? latest.close >= previous.close : true

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.06)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(148,163,184,0.12)' },
      timeScale: {
        borderColor: 'rgba(148,163,184,0.12)',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const safeCandles = candles.length ? candles : generateCandles(seeds[symbol] || 68200)
    series.setData(safeCandles)
    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [symbol, candles])

  return (
    <div className={`chart-shell ${direction ? 'is-up' : 'is-down'}`}>
      <div className="chart-topline">
        <div>
          <span>Market Structure</span>
          <strong>{symbol}</strong>
        </div>
        <div>
          <span>Latest Close</span>
          <strong>{latest?.close ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(latest.close) : 'Loading...'}</strong>
        </div>
        <div>
          <span>Range</span>
          <strong>{latest ? `${latest.low.toFixed(2)} → ${latest.high.toFixed(2)}` : 'Waiting data'}</strong>
        </div>
      </div>
      <div ref={containerRef} className="chart-area" />
    </div>
  )
}
