import { CheckCircle2, Clock3, AlertTriangle, Send } from 'lucide-react'

const icons = {
  submitted: Send,
  approved: Clock3,
  executed: CheckCircle2,
  failed: AlertTriangle,
}

export function OrderStatusPanel({ orders = [] }) {
  return (
    <div className="glass panel">
      <div className="panel-head compact">
        <div>
          <span className="section-kicker">Execution Status</span>
          <h3>OpenClaw order activity</h3>
        </div>
      </div>

      <div className="order-list">
        {orders.length === 0 ? (
          <div className="inline-note">No execution requests submitted yet.</div>
        ) : (
          orders.map((order) => {
            const Icon = icons[order.status] || Clock3
            return (
              <div className={`order-item status-${order.status}`} key={order.id}>
                <div className="order-icon">
                  <Icon size={16} />
                </div>
                <div className="order-copy">
                  <div className="order-row">
                    <strong>{order.symbol}</strong>
                    <span className="status-chip">{order.status}</span>
                  </div>
                  <p>{order.side} • {order.mode}</p>
                  <small>{order.runId ? `Run ID: ${order.runId}` : order.error || 'Waiting for agent response'}</small>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
