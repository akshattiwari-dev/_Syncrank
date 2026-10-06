import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

export default function PrivacyPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">privacy</div>
          <h2 className="sec-title">Privacy policy</h2>
          <p className="sec-sub">Last updated January 2026.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="prose-card">
            <h4>What we collect</h4>
            <p>
              Your campus email, for sign-in and to determine which campus leaderboard you belong
              on. Your Codeforces and LeetCode handles, which you link yourself. Rating, contest
              history, and solve counts pulled from Codeforces' and LeetCode's public APIs and
              profile pages on a regular sync schedule.
            </p>
            <h4>What we don't collect</h4>
            <p>
              We don't ask for your Codeforces or LeetCode password — handles are linked by
              username only. We don't track you outside SyncRank, and we don't collect anything
              beyond what's needed to compute a score and place you on a leaderboard.
            </p>
            <h4>How it's used</h4>
            <p>
              Synced data is used to calculate your Sync Score and rank, and to power the campus
              pulse feed and momentum charts. Campus admins can see aggregate activity for their
              own campus through admin tools — not individual message content, since there isn't
              any.
            </p>
            <h4>Sharing</h4>
            <p>
              We don't sell your data. Placement export (for campus admins) shares rank and
              contact info only with your own campus's placement cell, and only if your campus
              has opted in.
            </p>
            <h4>Your options</h4>
            <p>
              You can unlink a handle or delete your account at any time from account settings.
              Unlinking stops future syncs; it doesn't retroactively remove historical rank data
              from campus records.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
