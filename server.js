import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import WebSocket from 'ws'
import { randomUUID } from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 8787
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-5.4'
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789'
const OPENCLAW_WS_URL = process.env.OPENCLAW_WS_URL || 'ws://127.0.0.1:18789'
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''
const OPENCLAW_EXECUTION_SESSION = process.env.OPENCLAW_EXECUTION_SESSION || 'main'
const MARKET_PROVIDER = process.env.MARKET_PROVIDER || 'hyperliquid'
const HYPERLIQUID_INFO_URL = process.env.HYPERLIQUID_INFO_URL || 'https://api.hyperliquid.xyz/info'
const HYPERLIQUID_WS_URL = process.env.HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws'

app.use(cors())
app.use(express.json())

const symbolAnchors = {
  BTCUSDT: 68200,
  ETHUSDT: 3480,
  SOLUSDT: 180,
  AVAXUSDT: 54,
}

const marketSymbols = {
  BTCUSDT: { hyperliquid: 'BTC', coingecko: 'bitcoin' },
  ETHUSDT: { hyperliquid: 'ETH', coingecko: 'ethereum' },
  SOLUSDT: { hyperliquid: 'SOL', coingecko: 'solana' },
  AVAXUSDT: { hyperliquid: 'AVAX', coingecko: 'avalanche-2' },
}

const marketCache = new Map()
const lastGoodMarketCache = new Map()
const streamClients = new Map()
const orders = new Map()

function buildCandles(symbol = 'BTCUSDT', limit = 120) {
  const seed = symbolAnchors[symbol] || 100
  const candles = []
  let lastClose = seed
  const start = Math.floor(Date.now() / 1000) - limit * 60

  for (let i = 0; i < limit; i++) {
    const open = lastClose
    const drift = (Math.random() - 0.48) * (seed * 0.003)
    const close = Math.max(1, open + drift)
    const high = Math.max(open, close) + seed * 0.0014
    const low = Math.min(open, close) - seed * 0.0014
    candles.push({ time: start + i * 60, open, high, low, close })
    lastClose = close
  }

  return candles
}

function getFallbackMarket(raw, message) {
  return {
    source: 'fallback-demo',
    symbol: raw,
    price: symbolAnchors[raw] || 100,
    changePercent: 1.82,
    high24h: (symbolAnchors[raw] || 100) * 1.02,
    low24h: (symbolAnchors[raw] || 100) * 0.98,
    volume: 12000000,
    candles: buildCandles(raw, 120),
    warning: message,
  }
}

function mapSymbol(symbol = 'BTCUSDT') {
  return marketSymbols[symbol] || { hyperliquid: symbol.replace(/USDT$/, ''), coingecko: null }
}

async function postHyperliquidInfo(body) {
  const response = await fetch(HYPERLIQUID_INFO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Hyperliquid info failed: ${response.status}`)
  }

  return response.json()
}

function normalizeHyperliquidCandle(row) {
  return {
    time: Math.floor(Number(row.t) / 1000),
    open: Number(row.o),
    high: Number(row.h),
    low: Number(row.l),
    close: Number(row.c),
    volume: Number(row.v || 0),
  }
}

async function fetchHyperliquidMarket(symbol = 'BTCUSDT') {
  const { hyperliquid: coin } = mapSymbol(symbol)
  const [mids, metaAndAssetCtxs, candles] = await Promise.all([
    postHyperliquidInfo({ type: 'allMids' }),
    postHyperliquidInfo({ type: 'metaAndAssetCtxs' }),
    postHyperliquidInfo({ type: 'candleSnapshot', req: { coin, interval: '1m', startTime: Date.now() - 120 * 60 * 1000, endTime: Date.now() } }),
  ])

  const mid = Number(mids?.[coin] || 0)
  const assetCtx = Array.isArray(metaAndAssetCtxs?.[1])
    ? metaAndAssetCtxs[1].find((item) => String(item?.coin || '').toUpperCase() === coin.toUpperCase())
    : null

  const parsedCandles = Array.isArray(candles) ? candles.map(normalizeHyperliquidCandle).slice(-120) : []
  const lastPrice = Number(assetCtx?.markPx || assetCtx?.midPx || mid || parsedCandles.at(-1)?.close || symbolAnchors[symbol] || 100)
  const high24h = Number(assetCtx?.dayHigh || Math.max(...parsedCandles.map((item) => item.high), lastPrice))
  const low24h = Number(assetCtx?.dayLow || Math.min(...parsedCandles.map((item) => item.low), lastPrice))
  const prevDayPx = Number(assetCtx?.prevDayPx || lastPrice)
  const changePercent = prevDayPx ? ((lastPrice - prevDayPx) / prevDayPx) * 100 : 0
  const volume = Number(assetCtx?.dayNtlVlm || 0)

  return {
    source: 'hyperliquid',
    symbol,
    price: lastPrice,
    changePercent,
    high24h,
    low24h,
    volume,
    candles: parsedCandles.length ? parsedCandles : buildCandles(symbol, 120),
    lastUpdatedAt: new Date().toISOString(),
  }
}

async function fetchCoinGeckoMarket(symbol = 'BTCUSDT') {
  const assetId = mapSymbol(symbol).coingecko
  if (!assetId) {
    throw new Error(`CoinGecko asset is not mapped for ${symbol}`)
  }

  const [priceResponse, candleResponse] = await Promise.all([
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    ),
    fetch(
      `https://api.coingecko.com/api/v3/coins/${assetId}/ohlc?vs_currency=usd&days=1`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    ),
  ])

  if (!priceResponse.ok) throw new Error(`CoinGecko price failed: ${priceResponse.status}`)
  if (!candleResponse.ok) throw new Error(`CoinGecko OHLC failed: ${candleResponse.status}`)

  const priceJson = await priceResponse.json()
  const candleJson = await candleResponse.json()
  const quote = priceJson?.[assetId]

  if (!quote) {
    throw new Error(`CoinGecko returned empty quote for ${symbol}`)
  }

  const candles = candleJson.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: 0,
  }))

  const latestPrice = Number(quote.usd || candles.at(-1)?.close || symbolAnchors[symbol] || 100)
  const latestHigh = candles.length ? Math.max(...candles.map((item) => item.high)) : latestPrice
  const latestLow = candles.length ? Math.min(...candles.map((item) => item.low)) : latestPrice

  return {
    source: 'coingecko',
    symbol,
    price: latestPrice,
    changePercent: Number(quote.usd_24h_change || 0),
    high24h: latestHigh,
    low24h: latestLow,
    volume: Number(quote.usd_24h_vol || 0),
    candles: candles.slice(-120),
    lastUpdatedAt: quote.last_updated_at ? new Date(quote.last_updated_at * 1000).toISOString() : new Date().toISOString(),
  }
}

function rememberGoodMarket(symbol, payload) {
  if (payload?.source && payload.source !== 'fallback-demo') {
    lastGoodMarketCache.set(symbol, {
      ...payload,
      cachedAt: new Date().toISOString(),
    })
  }
  return payload
}

function getResilientCachedMarket(symbol, reason) {
  const lastGood = lastGoodMarketCache.get(symbol)
  if (lastGood) {
    return {
      ...lastGood,
      source: `${lastGood.source}-cached`,
      note: 'Showing the latest real market snapshot while the live provider reconnects.',
      fallbackReason: reason,
      lastUpdatedAt: new Date().toISOString(),
    }
  }

  return {
    ...getFallbackMarket(symbol, reason),
    fallbackReason: reason,
    lastUpdatedAt: new Date().toISOString(),
  }
}

async function fetchMarketSnapshot(symbol = 'BTCUSDT') {
  const primaryProvider = String(MARKET_PROVIDER || 'hyperliquid').toLowerCase()

  try {
    if (primaryProvider === 'hyperliquid') {
      return rememberGoodMarket(symbol, await fetchHyperliquidMarket(symbol))
    }
  } catch (primaryError) {
    try {
      const market = await fetchCoinGeckoMarket(symbol)
      return rememberGoodMarket(symbol, {
        ...market,
        fallbackReason: primaryError.message,
      })
    } catch (coingeckoError) {
      return getResilientCachedMarket(symbol, `${primaryError.message}; ${coingeckoError.message}`)
    }
  }

  try {
    return rememberGoodMarket(symbol, await fetchHyperliquidMarket(symbol))
  } catch (hyperliquidError) {
    try {
      const market = await fetchCoinGeckoMarket(symbol)
      return rememberGoodMarket(symbol, {
        ...market,
        fallbackReason: hyperliquidError.message,
      })
    } catch (coingeckoError) {
      return getResilientCachedMarket(symbol, `${hyperliquidError.message}; ${coingeckoError.message}`)
    }
  }
}

function broadcast(symbol, payload) {
  const clients = streamClients.get(symbol)
  if (!clients?.size) return
  const data = `data: ${JSON.stringify(payload)}\n\n`
  for (const client of clients) {
    client.write(data)
  }
}

function attachHyperliquidStream(symbol) {
  if (streamClients.has(`${symbol}:socket`)) return

  const { hyperliquid: coin } = mapSymbol(symbol)
  const ws = new WebSocket(HYPERLIQUID_WS_URL)
  streamClients.set(`${symbol}:socket`, ws)

  ws.on('open', () => {
    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'candle', coin, interval: '1m' },
      }),
    )

    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'activeAssetCtx', coin },
      }),
    )
  })

  ws.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString())
      const previous = marketCache.get(symbol) || getFallbackMarket(symbol)

      if (message?.channel === 'candle') {
        const incoming = Array.isArray(message.data)
          ? message.data.map(normalizeHyperliquidCandle)
          : message?.data
            ? [normalizeHyperliquidCandle(message.data)]
            : []

        if (!incoming.length) return

        const byTime = new Map((previous.candles || []).map((candle) => [candle.time, candle]))
        for (const candle of incoming) {
          byTime.set(candle.time, candle)
        }

        const candles = [...byTime.values()].sort((a, b) => a.time - b.time).slice(-120)
        const latest = candles[candles.length - 1]
        const nextPayload = rememberGoodMarket(symbol, {
          ...previous,
          source: 'hyperliquid-stream',
          symbol,
          price: latest?.close ?? previous.price,
          candles,
          lastUpdatedAt: new Date().toISOString(),
        })

        marketCache.set(symbol, nextPayload)
        broadcast(symbol, nextPayload)
        return
      }

      if (message?.channel === 'activeAssetCtx' && message?.data?.ctx) {
        const ctx = message.data.ctx
        const nextPayload = rememberGoodMarket(symbol, {
          ...previous,
          source: 'hyperliquid-stream',
          symbol,
          price: Number(ctx.markPx || ctx.midPx || previous.price),
          high24h: Number(ctx.dayHigh || previous.high24h),
          low24h: Number(ctx.dayLow || previous.low24h),
          volume: Number(ctx.dayNtlVlm || previous.volume || 0),
          changePercent: Number(ctx.prevDayPx)
            ? ((Number(ctx.markPx || ctx.midPx || previous.price) - Number(ctx.prevDayPx)) / Number(ctx.prevDayPx)) * 100
            : previous.changePercent,
          candles: previous.candles || [],
          lastUpdatedAt: new Date().toISOString(),
        })

        marketCache.set(symbol, nextPayload)
        broadcast(symbol, nextPayload)
      }
    } catch {
      // ignore malformed stream payloads
    }
  })

  ws.on('close', () => {
    streamClients.delete(`${symbol}:socket`)
    if ((streamClients.get(symbol)?.size || 0) > 0) {
      setTimeout(() => attachHyperliquidStream(symbol), 2000)
    }
  })

  ws.on('error', () => {
    ws.close()
  })
}

function formatExecutionPrompt(order) {
  return [
    'You are the OpenClaw execution agent for a hackathon trading demo.',
    'Do not place any real external trade unless explicitly wired to a safe paper-trading or broker sandbox.',
    'Treat this as an execution intent and respond with a concise structured acknowledgement.',
    '',
    `Order ID: ${order.id}`,
    `Symbol: ${order.symbol}`,
    `Side: ${order.side}`,
    `Mode: ${order.mode}`,
    `Price: ${order.plan?.price ?? 'n/a'}`,
    `Entry: ${order.plan?.entry ?? 'n/a'}`,
    `Stop Loss: ${order.plan?.stopLoss ?? 'n/a'}`,
    `Take Profit: ${order.plan?.takeProfit ?? 'n/a'}`,
    '',
    'Reply with:',
    '- execution acknowledgement',
    '- safety note',
    '- next action',
  ].join('\n')
}

function connectOpenClawAndDispatch(order) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(OPENCLAW_WS_URL)
    const requestId = randomUUID()
    let settled = false

    const finish = (fn, value) => {
      if (settled) return
      settled = true
      socket.close()
      fn(value)
    }

    socket.on('open', () => {
      socket.send(
        JSON.stringify({
          type: 'req',
          id: requestId,
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'ai-trader-hackathon-backend',
              version: '0.2.0',
              platform: 'node',
              mode: 'operator',
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write'],
            caps: [],
            commands: [],
            permissions: {},
            auth: OPENCLAW_GATEWAY_TOKEN ? { token: OPENCLAW_GATEWAY_TOKEN } : {},
            locale: 'en-US',
            userAgent: 'openclaw-ai-trader-demo',
          },
        }),
      )
    })

    socket.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString())

        if (message.type === 'event' && message.event === 'connect.challenge') {
          socket.send(
            JSON.stringify({
              type: 'req',
              id: requestId,
              method: 'connect',
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: {
                  id: 'ai-trader-hackathon-backend',
                  version: '0.2.0',
                  platform: 'node',
                  mode: 'operator',
                },
                role: 'operator',
                scopes: ['operator.read', 'operator.write'],
                caps: [],
                commands: [],
                permissions: {},
                auth: OPENCLAW_GATEWAY_TOKEN ? { token: OPENCLAW_GATEWAY_TOKEN } : {},
                locale: 'en-US',
                userAgent: 'openclaw-ai-trader-demo',
              },
            }),
          )
          return
        }

        if (message.type === 'res' && message.id === requestId && message.ok) {
          const chatRequestId = randomUUID()
          socket.send(
            JSON.stringify({
              type: 'req',
              id: chatRequestId,
              method: 'chat.send',
              params: {
                sessionKey: OPENCLAW_EXECUTION_SESSION,
                text: formatExecutionPrompt(order),
                idempotencyKey: order.id,
              },
            }),
          )
          return
        }

        if (message.type === 'res' && message.ok && message.payload?.runId) {
          finish(resolve, {
            transport: 'openclaw-ws',
            accepted: true,
            runId: message.payload.runId,
            status: message.payload.status || 'started',
          })
        }

        if (message.type === 'res' && message.ok === false) {
          finish(reject, new Error(message.error?.message || 'OpenClaw request failed'))
        }
      } catch (error) {
        finish(reject, error)
      }
    })

    socket.on('error', (error) => finish(reject, error))
    socket.on('close', () => {
      if (!settled) {
        finish(reject, new Error('OpenClaw socket closed before acknowledgement'))
      }
    })
  })
}

app.get('/api/market/:symbol', async (req, res) => {
  const raw = String(req.params.symbol || 'BTCUSDT').toUpperCase()
  const payload = await fetchMarketSnapshot(raw)
  marketCache.set(raw, payload)
  res.json(payload)
})

app.get('/api/stream/:symbol', async (req, res) => {
  const symbol = String(req.params.symbol || 'BTCUSDT').toUpperCase()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  if (!streamClients.has(symbol)) {
    streamClients.set(symbol, new Set())
  }

  streamClients.get(symbol).add(res)

  if (!marketCache.has(symbol)) {
    marketCache.set(symbol, await fetchMarketSnapshot(symbol))
  }

  const bootstrapPayload = marketCache.get(symbol)
  res.write(`data: ${JSON.stringify(bootstrapPayload)}\n\n`)

  attachHyperliquidStream(symbol)

  const refreshInterval = setInterval(async () => {
    try {
      const nextPayload = await fetchMarketSnapshot(symbol)
      marketCache.set(symbol, nextPayload)
      broadcast(symbol, nextPayload)
    } catch {
      // keep latest cached market payload if refresh fails
    }
  }, 10000)

  req.on('close', () => {
    clearInterval(refreshInterval)
    const clients = streamClients.get(symbol)
    clients?.delete(res)
    if (clients && clients.size === 0) {
      streamClients.delete(symbol)
      const ws = streamClients.get(`${symbol}:socket`)
      ws?.close()
      streamClients.delete(`${symbol}:socket`)
    }
  })
})

function getFallbackAnalysis(symbol, mode, note = 'OpenAI analysis is currently unavailable.') {
  return {
    source: 'fallback-demo',
    summary: `${symbol} shows bullish structure with controlled volatility. Suitable for monitored long exposure.`,
    action: 'OPEN_LONG',
    confidence: 0.82,
    entry: 'Scale in 40% now, 35% retest, 25% breakout confirmation',
    stopLoss: 'Below intraday support / 1.2% risk cap',
    takeProfit: 'Partial TP at 1.5R, trail remainder',
    mode,
    reasoning: [
      'Trend bias remains constructive on short timeframe candles.',
      'Volume expansion suggests real participation, not weak drift.',
      'Risk guard should remain enabled before execution.',
    ],
    note,
  }
}

app.post('/api/ai/analyze', async (req, res) => {
  const { symbol = 'BTCUSDT', market, mode = 'Auto Execute' } = req.body || {}

  if (!OPENAI_API_KEY) {
    return res.json(getFallbackAnalysis(symbol, mode, 'Set OPENAI_API_KEY to enable live AI analysis.'))
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You are a crypto trading copilot for a hackathon demo. Return JSON only with keys: summary, action, confidence, entry, stopLoss, takeProfit, reasoning (array of short strings). Keep it practical, cautious, and easy to present.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({ symbol, mode, market }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'trade_analysis',
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['summary', 'action', 'confidence', 'entry', 'stopLoss', 'takeProfit', 'reasoning'],
              properties: {
                summary: { type: 'string' },
                action: { type: 'string' },
                confidence: { type: 'number' },
                entry: { type: 'string' },
                stopLoss: { type: 'string' },
                takeProfit: { type: 'string' },
                reasoning: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `OpenAI failed ${response.status}`)
    }

    const data = await response.json()
    const payload = data.output?.[0]?.content?.[0]?.text
    const parsed = JSON.parse(payload)

    res.json({ source: 'openai', mode, ...parsed })
  } catch (error) {
    res.json(getFallbackAnalysis(symbol, mode, `Live AI analysis unavailable: ${error.message}`))
  }
})

app.post('/api/openclaw/execute', async (req, res) => {
  const { symbol, side, plan, mode = 'Auto Execute' } = req.body || {}
  const id = randomUUID()

  const order = {
    id,
    symbol,
    side,
    mode,
    plan,
    createdAt: new Date().toISOString(),
    status: 'submitted',
    provider: 'demo',
    transport: 'local',
  }

  orders.set(id, order)

  try {
    const result = await connectOpenClawAndDispatch(order)
    const next = {
      ...order,
      ...result,
      status: result.accepted ? 'approved' : 'failed',
      updatedAt: new Date().toISOString(),
      provider: 'openclaw',
    }
    orders.set(id, next)

    setTimeout(() => {
      const latest = orders.get(id)
      if (!latest || latest.status !== 'approved') return
      orders.set(id, {
        ...latest,
        status: 'executed',
        updatedAt: new Date().toISOString(),
      })
    }, 3000)

    return res.json({
      ok: true,
      id,
      message: 'Execution request submitted to OpenClaw agent.',
      nextStep: 'Track this order in the execution status panel.',
      order: next,
    })
  } catch (error) {
    const failed = {
      ...order,
      status: 'failed',
      updatedAt: new Date().toISOString(),
      error: error.message,
    }
    orders.set(id, failed)

    return res.status(500).json({
      ok: false,
      id,
      message: 'Failed to dispatch execution request to OpenClaw.',
      order: failed,
    })
  }
})

app.get('/api/openclaw/orders', (_req, res) => {
  const list = [...orders.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  res.json({ ok: true, orders: list.slice(0, 20) })
})

app.get('/api/openclaw/orders/:id', (req, res) => {
  const order = orders.get(req.params.id)
  if (!order) {
    return res.status(404).json({ ok: false, message: 'Order not found' })
  }
  res.json({ ok: true, order })
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'openclaw-ai-trader-api',
    marketProvider: MARKET_PROVIDER,
    hyperliquidInfoUrl: HYPERLIQUID_INFO_URL,
    hyperliquidWsUrl: HYPERLIQUID_WS_URL,
    openclawUrl: OPENCLAW_URL,
    openclawWsUrl: OPENCLAW_WS_URL,
    executionSession: OPENCLAW_EXECUTION_SESSION,
  })
})

app.listen(PORT, () => {
  console.log(`AI Trader API running at http://127.0.0.1:${PORT}`)
})
