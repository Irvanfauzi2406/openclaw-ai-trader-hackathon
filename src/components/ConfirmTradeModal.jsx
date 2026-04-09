import { AlertTriangle, ShieldCheck, X } from 'lucide-react'

export function ConfirmTradeModal({ open, plan, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">Execution Confirmation</span>
            <h3>Review order plan before handoff</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-alert">
          <AlertTriangle size={16} />
          Confirm this order plan before sending it to the OpenClaw execution workflow.
        </div>

        <div className="confirm-grid">
          <div className="confirm-item">
            <span>Symbol</span>
            <strong>{plan.symbol}</strong>
          </div>
          <div className="confirm-item">
            <span>Side</span>
            <strong>{plan.side}</strong>
          </div>
          <div className="confirm-item full-span">
            <span>Entry</span>
            <strong>{plan.entry}</strong>
          </div>
          <div className="confirm-item full-span">
            <span>Stop Loss</span>
            <strong>{plan.stopLoss}</strong>
          </div>
          <div className="confirm-item full-span">
            <span>Take Profit</span>
            <strong>{plan.takeProfit}</strong>
          </div>
        </div>

        <div className="modal-safe-note">
          <ShieldCheck size={16} />
          Human-in-the-loop confirmation remains enabled.
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={onConfirm}>Confirm & Execute</button>
        </div>
      </div>
    </div>
  )
}
