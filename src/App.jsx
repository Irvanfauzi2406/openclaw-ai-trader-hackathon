import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bot,
  CircleDollarSign,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { CandleChart } from './components/CandleChart'
import { TradePanel } from './components/TradePanel'
import { MetricCard } from './components/MetricCard'
import { SignalCard } from './components/SignalCard'
import { ExecutionTimeline } from './components/ExecutionTimeline'
import { LoadingState } from './components/LoadingState'
import { OrderStatusPanel } from './components/OrderStatusPanel'
import { watchlist, positions } from './data'
import { analyzeTrade } from './lib/api'
import { useMarketData } from './hooks/useMarketData'
import { useOrders } from './hooks/useOrders'

const marketOptions = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT']
const formatPair = (symbol) => `${symbol.slice(0, -4)}/USDT`
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function getMarketSourceLabel(source) {
  if (source === 'binance-stream') return 'Binance Realtime'
  if (source === 'binance') return 'Binance Live API'
  if (source === 'binance-cached') return 'Binance Cached Snapshot'
  if (source === 'coingecko') return 'CoinGecko Live Fallback'
  if (source === 'coingecko-cached') return 'CoinGecko Cached Snapshot'
  return 'Demo Fallback Feed'
}

export default function App() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [mode, setMode] = useState('Auto Execute')
  const [analysis, setAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const { market, loading, streaming } = useMarketData(symbol)
  const { orders } = useOrders()

  async function runAnalysis() {
    if (!market) return

    try {
      setAnalysisLoading(true)
      const result = await analyzeTrade({ symbol, market, mode })
      setAnalysis(result)
      setAnalysisError('')
    } catch (err) {
      setAnalysisError(err.message || 'Analysis failed')
    } finally {
      setAnalysisLoading(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [symbol, market, mode])

  const summary = useMemo(() => {
    const price = market?.price ?? 0
    const change = market?.changePercent ?? 0
    const pnl = (price * 0.0125) || 0

    return {
      price: currency.format(price),
      change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
      pnl: `${pnl >= 0 ? '+' : '-'}${currency.format(Math.abs(pnl))}`,
      confidence: `${Math.round((analysis?.confidence ?? 0.82) * 100)}%`,
      risk: mode === 'Auto Execute' ? 'Managed Auto Risk' : 'Manual Guarded Risk',
      high: currency.format(market?.high24h ?? 0),
      low: currency.format(market?.low24h ?? 0),
      volume: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(market?.volume ?? 0),
    }
  }, [market, analysis, mode])

  const timeline = useMemo(() => {
    const hasAnalysis = Boolean(analysis)
    return [
      {
        title: 'Market feed connected',
        description: market?.source === 'binance' || market?.source === 'binance-stream'
          ? 'Live market data is flowing from Binance with continuous refresh for trading decisions.'
          : market?.source === 'coingecko'
            ? 'Live market snapshots are served from CoinGecko because Binance is unreachable from this network.'
            : market?.source?.includes('cached')
              ? 'The dashboard is showing the latest real market snapshot while the provider reconnects.'
              : 'Demo candles are active because remote market feeds are currently unavailable.',
        status: 'done',
        statusLabel: market?.source?.includes('cached') ? 'Stabilized' : market?.source === 'coingecko' ? 'Live Fallback' : market?.source?.includes('binance') ? 'Live' : 'Demo',
      },
      {
        title: 'AI analyzes market structure',
        description: analysis?.summary || 'Waiting for the AI engine to evaluate trend, volatility, and momentum.',
        status: hasAnalysis ? 'done' : 'active',
        statusLabel: hasAnalysis ? 'Complete' : 'Running',
      },
      {
        title: 'Validate execution controls',
        description: `${mode} mode keeps stop loss, sizing, and operator safeguards inside defined limits.`,
        status: hasAnalysis ? 'active' : 'pending',
        statusLabel: hasAnalysis ? 'Ready' : 'Queued',
      },
      {
        title: 'Route order to OpenClaw',
        description: 'Validated order plans can be forwarded into your OpenClaw-connected execution workflow.',
        status: 'pending',
        statusLabel: 'Awaiting trigger',
      },
    ]
  }, [analysis, market, mode])

  const agentMessages = useMemo(() => {
    if (!analysis) {
      return [
        {
          role: 'GPT',
          text: 'Preparing an AI trade brief from the latest candles, volatility, and market context...',
        },
      ]
    }

    return [
      {
        role: 'GPT',
        text: analysis.summary,
      },
      {
        role: 'OpenClaw',
        text: `Execution mode: ${mode}. The order plan can be forwarded once the operator confirms the setup.`,
      },
      ...(analysis.reasoning || []).slice(0, 2).map((item) => ({ role: 'GPT', text: item })),
    ]
  }, [analysis, mode])

  return (
    <div className="app-shell terminal-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <header className="topbar terminal-topbar glass">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            OPENCLAW + AI EXECUTION LAYER
          </div>
          <h1>ClawTrade Command Center</h1>
          <p>
            A premium operator terminal for live market monitoring, AI-assisted decisions,
            and OpenClaw-powered execution.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="pill success-pill">
            <ShieldCheck size={16} />
            Hackathon-ready UI
          </div>
          <button className="primary-btn hero-live-btn">
            <Bot size={18} />
            AI Trader Online
          </button>
        </div>
      </header>

      <section className="terminal-summary glass">
        <div className="terminal-summary-main">
          <span className="section-kicker">Terminal Overview</span>
          <h2>{formatPair(symbol)} · AI-assisted execution desk</h2>
          <p>Real-time market view, AI trade planning, and execution control in one compact layout.</p>
        </div>
        <div className="terminal-summary-actions">
          {['Advisory', 'Semi Auto', 'Auto Execute'].map((item) => (
            <button
              key={item}
              className={item === mode ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="terminal-metrics">
        <MetricCard
          icon={CircleDollarSign}
          label="Live Price"
          value={loading ? 'Loading...' : summary.price}
          subValue={summary.change}
          tone="green"
          accent={market?.source?.includes('cached') ? 'stabilized' : 'live'}
        />
        <MetricCard
          icon={TrendingUp}
          label="AI Confidence"
          value={summary.confidence}
          subValue={analysis?.action || 'Analyzing structure'}
          tone="blue"
          accent="ai"
        />
        <MetricCard
          icon={Wallet}
          label="24H High / Low"
          value={`${summary.high} / ${summary.low}`}
          subValue={`Volume ${summary.volume}`}
          tone="purple"
          accent="market"
        />
        <MetricCard
          icon={Gauge}
          label="Risk Status"
          value={summary.risk}
          subValue="Position sizing protected"
          tone="amber"
          accent="risk"
        />
      </section>

      <section className="terminal-layout">
        <div className="terminal-main-column">
          <div className="glass panel terminal-chart-panel">
            <div className="panel-head terminal-panel-head">
              <div>
                <span className="section-kicker">Live Market</span>
                <h3>Command chart</h3>
              </div>
              <div className="toolbar">
                <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                  {marketOptions.map((item) => (
                    <option key={item} value={item}>
                      {formatPair(item)}
                    </option>
                  ))}
                </select>
                <div className="pill dark-pill">
                  <Activity size={15} />
                  {market?.source === 'binance-stream'
                    ? 'Streaming live'
                    : market?.source === 'binance'
                      ? 'Live API'
                      : market?.source === 'coingecko'
                        ? 'Live fallback'
                        : market?.source?.includes('cached')
                          ? 'Stabilized cache'
                          : 'Demo feed'}
                </div>
                <div className="pill dark-pill">
                  <RefreshCw size={15} />
                  {market?.source === 'binance-stream'
                    ? 'Realtime ticks'
                    : streaming
                      ? 'Auto refresh • 15s'
                      : 'Initial load'}
                </div>
              </div>
            </div>

            <div className="chart-stat-strip">
              <div className="chart-stat-box">
                <span>Feed Source</span>
                <strong>{getMarketSourceLabel(market?.source)}</strong>
              </div>
              <div className="chart-stat-box">
                <span>24H Range</span>
                <strong>{summary.high} → {summary.low}</strong>
              </div>
              <div className="chart-stat-box">
                <span>Strategy Projection</span>
                <strong>{summary.pnl}</strong>
              </div>
              <div className="chart-stat-box">
                <span>Execution Mode</span>
                <strong>{mode}</strong>
              </div>
            </div>

            {loading && !market ? <LoadingState label="Loading live market data..." /> : <CandleChart symbol={symbol} candles={market?.candles || []} />}
            {market?.note ? <div className="inline-note">{market.note}</div> : null}
          </div>

          <div className="terminal-balance-grid align-with-sidebar-row">
            <div className="glass panel compact-panel terminal-signal-panel balance-primary-panel">
              <div className="panel-head compact">
                <div>
                  <span className="section-kicker">AI Signal Engine</span>
                  <h3>AI decision summary</h3>
                  <small className="ai-source-label">
                    {analysis?.source === 'openai'
                      ? 'Live AI analysis • Source: OpenAI'
                      : analysis?.note || 'Fallback analysis mode'}
                  </small>
                </div>
                <div className="pill dark-pill subtle-pill">3 signal cards</div>
              </div>
              <div className="signal-grid terminal-signal-grid">
                <SignalCard
                  title="Bias"
                  value={analysis?.action?.replaceAll('_', ' ') || 'Awaiting analysis'}
                  detail={analysis?.summary || 'The AI engine is reviewing structure, price reaction, and volatility.'}
                />
                <SignalCard
                  title="Entry Plan"
                  value={analysis?.entry || 'Preparing entry ladder'}
                  detail={analysis?.stopLoss || 'Risk controls will appear here.'}
                />
                <SignalCard
                  title="Take Profit"
                  value={analysis?.takeProfit || 'Waiting for take-profit logic'}
                  detail={`Mode: ${mode} • Pair: ${formatPair(symbol)}`}
                />
              </div>
              {analysisLoading ? <div className="inline-note">AI is analyzing the latest candle structure...</div> : null}
              {analysisError ? null : null}
              {analysis?.source !== 'openai' && analysis?.note ? <div className="inline-note warn">{analysis.note}</div> : null}
            </div>

            <div className="terminal-below-signal-grid balance-full-row">
              <div className="glass panel compact-panel terminal-portfolio-panel">
                <div className="panel-head compact">
                  <div>
                    <span className="section-kicker">Open Positions</span>
                    <h3>Portfolio overview</h3>
                  </div>
                  <div className="pill dark-pill subtle-pill">3 active positions</div>
                </div>
                <div className="position-list">
                  {positions.map((item) => (
                    <div className="position-row" key={item.symbol}>
                      <div>
                        <strong>{item.symbol}</strong>
                        <span>{item.side}</span>
                      </div>
                      <div>
                        <strong>{item.size}</strong>
                        <span>{item.entry}</span>
                      </div>
                      <div className={item.pnl.startsWith('+') ? 'pos up' : 'pos down'}>
                        <strong>{item.pnl}</strong>
                        <span>{item.leverage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass panel compact-panel terminal-agent-panel banner-agent-panel">
                <div className="panel-head compact">
                  <div>
                    <span className="section-kicker">Agent Feed</span>
                    <h3>AI reasoning preview</h3>
                  </div>
                  <ArrowRight size={16} />
                </div>
                <div className="agent-feed agent-banner-track">
                  {agentMessages.map((item, idx) => (
                    <div className="agent-msg agent-banner-card" key={idx}>
                      <div className="agent-avatar">{item.role === 'GPT' ? 'G' : 'O'}</div>
                      <div>
                        <strong>{item.role}</strong>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass panel compact-panel terminal-watchlist-panel full-row-panel">
                <div className="panel-head compact">
                  <div>
                    <span className="section-kicker">Watchlist</span>
                    <h3>High-opportunity assets</h3>
                  </div>
                </div>
                <div className="watchlist wide-watchlist-grid">
                  {watchlist.map((item) => (
                    <div className="watch-item" key={item.symbol}>
                      <div>
                        <strong>{item.symbol}</strong>
                        <span>{item.note}</span>
                      </div>
                      <div className={item.change.startsWith('+') ? 'up' : 'down'}>
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="terminal-sidebar">
          <TradePanel
            symbol={symbol}
            pairLabel={formatPair(symbol)}
            mode={mode}
            market={market}
            analysis={analysis}
            onAskGpt={runAnalysis}
          />

          <OrderStatusPanel orders={orders} />

          <div className="glass panel compact-panel terminal-pipeline-panel">
            <div className="panel-head compact">
              <div>
                <span className="section-kicker">OpenClaw Agent Flow</span>
                <h3>Execution pipeline</h3>
              </div>
              <div className="pill dark-pill subtle-pill">4-step flow</div>
            </div>
            <ExecutionTimeline steps={timeline} />
          </div>
        </aside>
      </section>
    </div>
  )
}
