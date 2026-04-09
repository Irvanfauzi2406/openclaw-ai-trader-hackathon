export function ExecutionTimeline({ steps }) {
  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div className="timeline-item" key={step.title}>
          <div className={`timeline-dot ${step.status}`} />
          <div className="timeline-copy">
            <div className="timeline-title-row">
              <strong>{index + 1}. {step.title}</strong>
              <span>{step.statusLabel}</span>
            </div>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
