export function StatBadge({ label, value, tone = 'default' }) {
  return (
    <div className={`stat-badge ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
