# SyncRank — Frontend

A campus-first competitive programming ranking platform that syncs Codeforces + LeetCode
activity into one score, ranks students against their own campus, and gives placement
cells a growth-monitoring dashboard.

## Stack

- **React 18** + **Vite** — fast dev server, instant HMR
- **React Router v6** — real routes (`/`, `/dashboard`, `/leaderboards`, `/arena`, `/profile`, `/admin`), same pattern Codeforces and LeetCode use for their own pages
- **Framer Motion** — scroll-reveal, staggered lists, spring dropdowns, animated route transitions
- Plain CSS with design tokens (`src/styles/tokens.css`) — no framework lock-in
- Fonts: Melodrama (display) + Switzer (body) via Fontshare, JetBrains Mono (data) via Google Fonts

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project structure

```
src/
  main.jsx              # React root, router setup
  App.jsx                # Route table + layout shell
  styles/
    tokens.css            # colors, fonts, spacing as CSS variables
    global.css            # shared design-system styles
  hooks/
    useAnimatedCounter.js  # count-up animation for stats
    useScrollShadow.js     # navbar compacts on scroll
    useOutsideClick.js     # closes dropdowns on outside click
    useCountdown.js        # live contest timer
    useLiveStandings.js    # simulated live-scoring feed
  data/
    mockData.js            # placeholder data — swap for real API calls
  components/
    layout/                # Navbar, MobileDrawer, Footer
    shared/                 # Card and other reusable primitives
    charts/                 # RadarChart, GrowthArc, Heatmap, LineChart
    motion/                  # Reveal (scroll-fade), StaggerGroup, PageTransition
    home/                    # Hero, TrustStrip (marquee), MomentumTicker, FeatureIntro (bento), SyncTerminal, HowItWorks
  pages/
    HomePage.jsx, DashboardPage.jsx, LeaderboardPage.jsx,
    ArenaPage.jsx, ProfilePage.jsx, AdminPage.jsx
```

## Wiring up real data

Everything currently reads from `src/data/mockData.js`. To go live:

1. Add a `src/api/codeforces.js` and `src/api/leetcode.js` with `fetch` calls to
   `https://codeforces.com/api/...` and LeetCode's GraphQL endpoint.
2. Replace the hardcoded arrays in `mockData.js` with data-fetching hooks
   (e.g. `useEffect` + `fetch`, or React Query if you add it).
3. `useLiveStandings` and `useCountdown` are already structured to accept real
   data/timestamps in place of the mock seed values — no rewrite needed, just
   swap what you pass in.

## Notes

- The navbar is fully keyboard- and click-outside-aware (search panel, avatar menu).
- Below 980px the tab links collapse into a hamburger-triggered drawer (`MobileDrawer.jsx`).
- `prefers-reduced-motion` is respected globally in `global.css`.
