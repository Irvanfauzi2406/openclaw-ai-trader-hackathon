export function PulseBadge({ children, tone = 'blue' }) {
  return <div className={`pulse-badge pulse-${tone}`}>{children}</div>
}
