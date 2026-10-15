const STEPS = [
  { title: 'Connect', desc: 'Sign in with your campus email, then link your Codeforces and LeetCode handles.' },
  { title: 'Sync', desc: 'Every night, and live during contests, we pull fresh rating and solve data.' },
  { title: 'Reconcile', desc: 'Contest rating and solve volume get weighted into one Sync Score.' },
  { title: 'Rank', desc: 'Campus rank first, global rank right beside it.' },
]

export default function HowItWorks() {
  return (
    <ol className="steps-list">
      {STEPS.map((step, i) => (
        <li className="steps-item" key={step.title}>
          <span className="steps-index mono">{i + 1}</span>
          <div>
            <h4>{step.title}</h4>
            <p>{step.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
