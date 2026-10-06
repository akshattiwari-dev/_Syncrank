import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import { Link } from 'react-router-dom'
import { sponsoredContests } from '../data/mockData.js'

export default function SponsoredPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">sponsored contests</div>
          <h2 className="sec-title">Branded campus contests</h2>
          <p className="sec-sub">
            Companies can sponsor a multi-campus contest — problems co-set with our team, results
            visible to their recruiting pipeline. Interested in running one?{' '}
            <Link to="/contact">Get in touch</Link>.
          </p>
          <p className="sec-sub" style={{ opacity: 0.7 }}>
            The contests below are illustrative examples — the sponsorship program itself is
            pre-launch. The "Get in touch" link above is real and reaches our team.
          </p>
        </Reveal>

        <div className="sponsored-list" style={{ marginTop: 24 }}>
          {sponsoredContests.map((c, i) => (
            <Reveal key={c.title} delay={0.05 * i}>
              <Card className="sponsored-row">
                <div className="sponsored-company mono">{c.company}</div>
                <div className="sponsored-body">
                  <h4>{c.title}</h4>
                  <p>{c.campuses} campuses · {c.prize}</p>
                </div>
                <div className="sponsored-date mono">{c.date}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}