import { CheckCircle2, Clock3, AlertTriangle, Send } from 'lucide-react'

const icons = {
  submitted: Send,
  approved: Clock3,
  filled: CheckCircle2,
  executed: CheckCircle2,
  failed: AlertTriangle,
}

function getStatusLabel(order) {
  if (order.status === 'filled') return 'paper filled'
  return order.status
}

export function OrderStatusPanel({ orders = [] }) {
  return (
    <div className="glass panel">
      <div className="panel-head compact">
        <div>
          <span className="section-kicker">Execution Status</span>
          <h3>Paper order activity</h3>
        </div>
      </div>

      <div className="order-list">
        {orders.length === 0 ? (
          <div className="inline-note">No paper orders submitted yet.</div>
        ) : (
          orders.map((order) => {
            const Icon = icons[order.status] || Clock3
            const openclawStatus = order.metadata?.openclawDispatchStatus
            return (
              <div className={`order-item status-${order.status}`} key={order.id}>
                <div className="order-icon">
                  <Icon size={16} />
                </div>
                <div className="order-copy">
                  <div className="order-row">
                    <strong>{order.symbol}</strong>
                    <span className="status-chip">{getStatusLabel(order)}</span>
                  </div>
                  <p>{order.side} • {order.mode}</p>
                  <small>
                    Fill {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(order.fillPrice || 0)}
                    {' • '}
                    Qty {Number(order.quantity || 0).toFixed(4)}
                  </small>
                  <small>
                    {openclawStatus === 'accepted'
                      ? `OpenClaw intent accepted • Run ID: ${order.runId || 'n/a'}`
                      : openclawStatus === 'failed'
                        ? `OpenClaw unavailable • ${order.metadata?.openclawDispatchError || 'local paper mode only'}`
                        : 'Local paper mode'}
                  </small>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
