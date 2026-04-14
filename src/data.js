export const positions = []

export const watchlist = [
  { symbol: 'BTC/USDT', change: '+2.84%', note: 'Breakout continuation' },
  { symbol: 'ETH/USDT', change: '+1.12%', note: 'Retest above resistance' },
  { symbol: 'SOL/USDT', change: '+4.91%', note: 'High momentum expansion' },
  { symbol: 'AVAX/USDT', change: '-0.84%', note: 'Compression, waiting trigger' },
]

export const aiSteps = [
  {
    title: 'Collect market data',
    description: 'OpenClaw ingests price feed, candle state, and risk context from the dashboard.',
    status: 'done',
    statusLabel: 'Live',
  },
  {
    title: 'GPT analyzes setup',
    description: 'GPT evaluates trend, volatility, momentum, and confirms trade direction with rationale.',
    status: 'active',
    statusLabel: 'In progress',
  },
  {
    title: 'Validate execution rules',
    description: 'Risk checks ensure max position, stop loss, and execution permissions are satisfied.',
    status: 'pending',
    statusLabel: 'Queued',
  },
  {
    title: 'Send order via OpenClaw agent',
    description: 'Approved trade action is forwarded to your connected execution workflow or broker bridge.',
    status: 'pending',
    statusLabel: 'Awaiting trigger',
  },
]

export const agentMessages = [
  {
    role: 'GPT',
    text: 'BTC/USDT is holding above the intraday breakout level with increasing volume. A controlled long entry is favored.',
  },
  {
    role: 'OpenClaw',
    text: 'Execution permissions available. Waiting for approval mode: Auto Execute. Risk guard remains active.',
  },
  {
    role: 'GPT',
    text: 'Suggested ladder: 40% now, 35% on retest, 25% confirmation add. Invalidate below support zone.',
  },
]
