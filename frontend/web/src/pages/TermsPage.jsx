import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

export default function TermsPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">terms</div>
          <h2 className="sec-title">Terms of use</h2>
          <p className="sec-sub">Last updated January 2026.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="prose-card">
            <h4>What SyncRank is</h4>
            <p>
              SyncRank is an unofficial ranking tool. It is not affiliated with, endorsed by, or
              officially connected to Codeforces or LeetCode in any way. Rankings are derived from
              public data and are provided for informational purposes only.
            </p>
            <h4>Acceptable use</h4>
            <p>
              Link only handles you own. Don't attempt to manipulate rankings by submitting on
              behalf of other accounts, abusing the sync schedule, or interfering with other
              users' scores. We reserve the right to remove accounts that do this.
            </p>
            <h4>Accuracy</h4>
            <p>
              Sync Score, rank, and activity data depend on third-party APIs staying available and
              accurate. We don't guarantee real-time accuracy — syncs can lag, fail, or return
              stale data, and we'll generally say so in the UI when that happens rather than hide
              it.
            </p>
            <h4>Account responsibility</h4>
            <p>
              You're responsible for keeping your linked handles up to date and for anything
              published under your campus profile. Campus admins are responsible for the accuracy
              of the campus data they submit through onboarding.
            </p>
            <h4>Changes</h4>
            <p>
              We may update these terms as the product changes. Continued use after an update
              means you accept the current version.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
