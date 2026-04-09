export function MetricCard({ icon: Icon, label, value, subValue, tone = 'blue', accent = 'default' }) {
  return (
    <div className={`metric-card tone-${tone} accent-${accent}`}>
      <div className="metric-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{subValue}</small>
      </div>
    </div>
  )
}
