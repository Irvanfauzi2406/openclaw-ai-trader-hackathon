import { useMemo, useState } from 'react'
import { Bot, LoaderCircle, Shield, Zap } from 'lucide-react'
import { executeTrade } from '../lib/api'
import { ConfirmTradeModal } from './ConfirmTradeModal'
import { PulseBadge } from './PulseBadge'

export function TradePanel({ symbol, pairLabel, mode, market, analysis, onExecuted, onAskGpt }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)

  const plan = useMemo(() => ({
    symbol,
    side: analysis?.action || 'OPEN_LONG',
    entry: analysis?.entry || 'Scale entry waiting GPT',
    stopLoss: analysis?.stopLoss || 'Protective stop pending',
    takeProfit: analysis?.takeProfit || 'TP pending',
    price: market?.price,
  }), [symbol, analysis, market])

  async function handleExecute() {
    try {
      setLoading(true)
      const data = await executeTrade({
        symbol,
        side: analysis?.action || 'OPEN_LONG',
        plan,
        mode,
      })
      setResult(data)
      onExecuted?.(data.order)
      setError('')
      setOpenConfirm(false)
    } catch (err) {
      setError(err.message || 'Execution failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="glass panel trade-panel premium-panel">
        <div className="panel-head compact">
          <div>
            <span className="section-kicker">AI Trade Control</span>
            <h3>AI execution console</h3>
          </div>
          <PulseBadge tone="green">
            <Bot size={15} />
            {mode}
          </PulseBadge>
        </div>

        <div className="trade-box">
          <div className="trade-summary premium-surface enhanced-summary">
            <div>
              <span>Selected Pair</span>
              <strong>{pairLabel}</strong>
            </div>
            <div>
              <span>Strategy</span>
              <strong>{analysis?.action?.replaceAll('_', ' ') || 'Breakout + Momentum Bias'}</strong>
            </div>
            <div>
              <span>Live Price</span>
              <strong>{market?.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(market.price) : 'Loading...'}</strong>
            </div>
          </div>

          <div className="trade-actions-grid">
            <label>
              Capital Allocation
              <input value="25% Portfolio" readOnly />
            </label>
            <label>
              Risk Guard
              <input value="1.2% max loss" readOnly />
            </label>
            <label>
              Entry Type
              <input value={analysis?.entry || 'Market + ladder'} readOnly />
            </label>
            <label>
              Exit Logic
              <input value={analysis?.takeProfit || 'TP + dynamic stop'} readOnly />
            </label>
          </div>

          <div className="trade-insight">
            <div className="insight-pill glow-green">
              <Zap size={14} /> {analysis?.summary || 'The AI engine will summarize the live setup here.'}
            </div>
            <div className="insight-pill muted glow-blue">
              <Shield size={14} /> OpenClaw currently forwards validated order plans into an execution workflow stub. Connect paper trading or a real broker adapter before using this for live capital.
            </div>
          </div>

          <div className="cta-row">
            <button className="primary-btn full lift-btn" onClick={() => setOpenConfirm(true)} disabled={loading || !market}>
              {loading ? <LoaderCircle size={16} className="spin" /> : null}
              Execute via OpenClaw
            </button>
            <button className="secondary-btn full" onClick={onAskGpt}>
              Refresh AI analysis
           </button>
          </div>

          {result ? <div className="inline-note success glow-border">{result.message}</div> : null}
          {result?.nextStep ? <div className="inline-note">{result.nextStep}</div> : null}
          {error ? <div className="inline-note warn">Execution request could not be completed. Please verify OpenClaw connectivity.</div> : null}
        </div>
      </div>

      <ConfirmTradeModal
        open={openConfirm}
        plan={plan}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleExecute}
      />
    </>
  )
}
