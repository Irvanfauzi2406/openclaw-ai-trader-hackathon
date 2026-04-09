export function SignalCard({ title, value, detail }) {
  return (
    <div className="signal-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  )
}
