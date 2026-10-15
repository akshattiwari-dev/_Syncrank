// Colleges with a verified admin account and an active campus board.
// Tier is informal — IIT/NIT/IIIT are centrally funded; "Elite" covers
// other campuses with consistently high sync volume.
export const eliteColleges = [
  { name: 'IIT Guwahati', tier: 'IIT', students: 640 },
  { name: 'IIT Bombay', tier: 'IIT', students: 812 },
  { name: 'BITS Pilani', tier: 'Elite', students: 704 },
  { name: 'NIT Trichy', tier: 'NIT', students: 588 },
  { name: 'VIT Vellore', tier: 'Elite', students: 1140 },
  { name: 'IIIT Hyderabad', tier: 'IIIT', students: 402 },
  { name: 'SRM Institute', tier: 'Elite', students: 2140 },
  { name: 'Manipal Institute', tier: 'Elite', students: 566 },
  { name: 'DTU', tier: 'Elite', students: 498 },
  { name: 'NIT Warangal', tier: 'NIT', students: 471 },
]

export const momentumData = [
  { name: 'SRM Institute', sub: 'Chennai', score: 8421, delta: '+312' },
  { name: 'BITS Pilani', sub: 'Rajasthan', score: 8390, delta: '+266' },
  { name: 'VIT Vellore', sub: 'Tamil Nadu', score: 8110, delta: '+41' },
  { name: 'IIT Guwahati', sub: 'Assam', score: 7960, delta: '-42' },
  { name: 'NIT Trichy', sub: 'Tamil Nadu', score: 7840, delta: '-118' },
  { name: 'Manipal Institute', sub: 'Karnataka', score: 7602, delta: '0' },
]

export const leaderboardData = [
  { name: 'Aditi Rao', sub: 'CSE · 2027', cf: 1842, lc: 611, score: 982, delta: '+18' },
  { name: 'Riya Kulkarni', sub: 'CSE · 2026', cf: 1732, lc: 611, score: 958, delta: '+11' },
  { name: 'Karan Mehta', sub: 'ECE · 2026', cf: 1795, lc: 540, score: 941, delta: '+7' },
  { name: 'Sana Iqbal', sub: 'CSE · 2027', cf: 1710, lc: 588, score: 918, delta: '-4' },
  { name: 'Rohit Verma', sub: 'IT · 2028', cf: 1663, lc: 502, score: 876, delta: '+2' },
  { name: 'Priya Nair', sub: 'CSE · 2026', cf: 1601, lc: 471, score: 844, delta: '-9' },
  { name: 'Devansh Rathi', sub: 'ECE · 2028', cf: 1488, lc: 390, score: 761, delta: '0' },
  { name: 'Meera Thomas', sub: 'CSE · 2028', cf: 1290, lc: 340, score: 612, delta: '—', stale: true },
  { name: 'Farhan Ali', sub: 'IT · 2027', cf: 1340, lc: 298, score: 654, delta: '-21' },
]

// Real-log style pulse feed — timestamps, handles, actual problem/contest names,
// mixed CF/LC events, and a couple of quieter/neutral entries so it doesn't read
// as a highlight reel.
export const pulseEvents = [
  { who: 'ankit_s', what: 'solved 1487D — Best Subsequence', color: 'var(--rust)', t: '2m ago' },
  { who: 'meera.t', what: 'cleared LC 1584 Medium, 3rd attempt', color: 'var(--amber)', t: '6m ago' },
  { who: 'devansh_r', what: 'synced — no change since last pull', color: 'var(--muted-dim)', t: '9m ago' },
  { who: 'fatima_k', what: 'moved to campus rank #9 (was #14)', color: 'var(--sage)', t: '18m ago' },
  { who: 'krishna_v', what: 'rating 1611 → 1569 after Div. 3 #963', color: 'var(--brick)', t: '24m ago' },
  { who: 'riya_codes', what: 'submitted LC 42 Hard — WA on TC 7', color: 'var(--amber)', t: '31m ago' },
  { who: 'sana.iqbal', what: 'last synced 6h ago — handle may be stale', color: 'var(--muted-dim)', t: '38m ago' },
  { who: 'vikram_s', what: 'sync skipped — no submissions since last pull', color: 'var(--muted-dim)', t: '44m ago' },
]

export const problems = [
  { letter: 'A', diff: 'easy', rating: '800', code: 'CF 1873A', title: 'Short Sort', tags: ['Array'], points: 100, solvedBy: 214, status: 'solved' },
  { letter: 'B', diff: 'easy', rating: '900', code: 'LC 704', title: 'Binary Search', tags: ['Binary Search'], points: 150, solvedBy: 188, status: 'solved' },
  { letter: 'C', diff: 'med', rating: '1400', code: 'LC 102', title: 'Binary Tree Zigzag', tags: ['Tree', 'BFS'], points: 300, solvedBy: 96, status: 'attempted' },
  { letter: 'D', diff: 'med', rating: '1550', code: 'CF 1930B', title: 'Dynamic Increments', tags: ['Greedy', 'Prefix Sum'], points: 350, solvedBy: 61, status: 'todo' },
  { letter: 'E', diff: 'hard', rating: '2100', code: 'CF 1854D', title: 'Segment Tree Range Ops', tags: ['Segment Tree', 'DP'], points: 500, solvedBy: 14, status: 'todo' },
]

// Sync Cup #14 — 5 problems, penalty is minutes-to-solve summed across accepted
// submissions, standard ACM-style. Not everyone solves everything.
export const initialStandings = [
  { name: 'Aditi Rao', solved: 5, penalty: 210, score: 2340 },
  { name: 'Karan Mehta', solved: 4, penalty: 180, score: 2010 },
  { name: 'Riya Kulkarni', solved: 4, penalty: 230, score: 1950 },
  { name: 'Sana Iqbal', solved: 3, penalty: 120, score: 1620 },
  { name: 'Rohit Verma', solved: 2, penalty: 90, score: 1080 },
  { name: 'Devansh Rathi', solved: 1, penalty: 35, score: 480 },
]

export const inactiveStudents = [
  { name: 'Neha Joshi', days: 9 },
  { name: 'Farhan Ali', days: 14 },
  { name: 'Vikram Singh', days: 21 },
  { name: 'Ishita Bose', days: 31 },
  { name: 'Sameer Kapoor', days: 62, note: 'probably graduated' },
]

// Hand-picked, not a formula — real weekly growth is lumpy, not evenly spaced.
export const topPerformerGrowth = [58, 31, 44, 12, 26]

// ---- Placement analytics — which companies hired top-ranked students ----
export const placementStats = [
  { company: 'Razorpay', hires: 6, avgScore: 940 },
  { company: 'Flipkart', hires: 4, avgScore: 918 },
  { company: 'Amazon', hires: 3, avgScore: 965 },
  { company: 'Zoho', hires: 5, avgScore: 872 },
]

// ---- Mock interview matching: peers within ~80 rating points ----
export const interviewMatches = [
  { name: 'Karan Mehta', cf: 1795, focus: 'Graphs, DP', slot: 'Today 6:00 PM', campus: 'SRM Institute' },
  { name: 'Sana Iqbal', cf: 1710, focus: 'Trees, Binary Search', slot: 'Tomorrow 11:00 AM', campus: 'SRM Institute' },
  { name: 'Devansh Rathi', cf: 1488, focus: 'Greedy, Arrays', slot: 'Today 8:30 PM', campus: 'BITS Pilani' },
  { name: 'Priya Nair', cf: 1601, focus: 'DP, Segment Trees', slot: 'Sat 4:00 PM', campus: 'VIT Vellore' },
]

// ---- Personalized practice plan — weak topics inferred from recent WAs ----
export const practicePlan = [
  {
    topic: 'Segment Trees',
    weak: 62,
    problems: 4,
    note: '3 WAs on lazy propagation this month',
    sample: [
      { code: 'CF 1854D', title: 'Segment Tree Range Ops', rating: 2100 },
      { code: 'LC 307', title: 'Range Sum Query — Mutable', rating: 1500 },
    ],
  },
  {
    topic: 'Graph — DSU',
    weak: 48,
    problems: 3,
    note: 'Slow on union-find heavy problems',
    sample: [
      { code: 'CF 1861B', title: 'Fascinating Fairies', rating: 1400 },
      { code: 'LC 947', title: 'Most Stones Removed', rating: 1350 },
    ],
  },
  {
    topic: 'Binary Search on Answer',
    weak: 35,
    problems: 3,
    note: 'Fine on basic search, drops on the harder variant',
    sample: [
      { code: 'LC 875', title: 'Koko Eating Bananas', rating: 1250 },
      { code: 'CF 1802B', title: 'Divisor Chain', rating: 1300 },
    ],
  },
  {
    topic: 'DP — Bitmask',
    weak: 29,
    problems: 2,
    note: 'Only attempted twice, both TLE',
    sample: [{ code: 'CF 1690F', title: 'Shifting Bits', rating: 1900 }],
  },
]

// ---- Team formation — complementary skill matching for team contests ----
export const teammateSuggestions = [
  { name: 'Fatima Khan', strength: 'Graphs, Trees', cf: 1688, complements: 'Your DP + their graphs' },
  { name: 'Krishna Vats', strength: 'Math, Number Theory', cf: 1611, complements: 'Rare on your team so far' },
  { name: 'Ankit Sharma', strength: 'Implementation, Ad Hoc', cf: 1520, complements: 'Fast typer, good for easy problems' },
]

// ---- Inter-campus tournaments — league-style fixtures ----
export const tournaments = [
  { name: 'SRM vs BITS — Autumn Clash', status: 'live', a: 'SRM Institute', b: 'BITS Pilani', scoreA: 1240, scoreB: 1185 },
  { name: 'South Zone League — Round 3', status: 'upcoming', a: 'VIT Vellore', b: 'NIT Trichy', date: 'Sat, 6:00 PM' },
  { name: 'IIT Guwahati vs Manipal', status: 'completed', a: 'IIT Guwahati', b: 'Manipal Institute', scoreA: 980, scoreB: 1310 },
]

// ---- Alumni mentorship matching ----
export const mentors = [
  { name: 'Arjun Desai', role: 'SWE II, Amazon', batch: '2022', cfPeak: 2100, tags: ['Graphs', 'System Design'] },
  { name: 'Neha Kulkarni', role: 'SDE, Flipkart', batch: '2023', cfPeak: 1950, tags: ['DP', 'Interview Prep'] },
  { name: 'Rahul Menon', role: 'Backend Engineer, Razorpay', batch: '2021', cfPeak: 2210, tags: ['Segment Trees', 'CP'] },
]

// ---- Recruiter portal — verified candidate search ----
export const recruiterCandidates = [
  { name: 'Aditi Rao', campus: 'SRM Institute', cf: 1842, lc: 611, score: 982, branch: 'CSE', grad: 2027 },
  { name: 'Karan Mehta', campus: 'SRM Institute', cf: 1795, lc: 540, score: 941, branch: 'ECE', grad: 2026 },
  { name: 'Rahul Iyer', campus: 'BITS Pilani', cf: 1920, lc: 480, score: 990, branch: 'CSE', grad: 2026 },
  { name: 'Sana Iqbal', campus: 'SRM Institute', cf: 1710, lc: 588, score: 918, branch: 'CSE', grad: 2027 },
]

// ---- Sponsored campus contests (recruiter-branded) ----
export const sponsoredContests = [
  { company: 'Razorpay', title: 'Razorpay Campus Challenge', date: 'Sep 12', campuses: 8, prize: '₹50,000 + interviews' },
  { company: 'Flipkart', title: 'Flipkart GRiD Warm-up', date: 'Sep 20', campuses: 14, prize: 'Direct interview slots' },
]

// ---- API access (developer platform) ----
export const apiEndpoints = [
  { method: 'GET', path: '/v1/leaderboard/:campus', desc: 'Campus leaderboard, paginated' },
  { method: 'GET', path: '/v1/user/:handle', desc: 'Sync Score + linked handle data' },
  { method: 'GET', path: '/v1/contests/:id/standings', desc: 'Live contest standings' },
]

// ---- Bot / integration connection status ----
export const integrations = [
  { name: 'Discord', status: 'connect', desc: 'Rank-change and contest-start alerts in your server.' },
  { name: 'Slack', status: 'connect', desc: 'Daily campus digest posted to a channel of your choice.' },
]

// ---- Campus contests admin has created, at various stages ----
// Kept uneven on purpose — real admin dashboards have half-finished drafts
// sitting around, not a clean pipeline.
export const campusContests = [
  { id: 'c14', title: 'Weekly Sync Cup #14', status: 'live', start: 'Today, 7:00 PM', durationMins: 60, problemCount: 5, participants: 214, visibility: 'campus' },
  { id: 'c15', title: 'Weekly Sync Cup #15', status: 'scheduled', start: 'Sat, 6:00 PM', durationMins: 90, problemCount: 6, participants: 0, visibility: 'campus' },
  { id: 'c-fresh', title: 'Fresher Warm-up Round', status: 'draft', start: null, durationMins: 60, problemCount: 3, participants: 0, visibility: 'campus' },
  { id: 'c13', title: 'Weekly Sync Cup #13', status: 'completed', start: 'Last Sat, 6:00 PM', durationMins: 60, problemCount: 5, participants: 198, visibility: 'campus' },
  { id: 'c12', title: 'Placement Prep Mock', status: 'completed', start: '2 weeks ago', durationMins: 120, problemCount: 4, participants: 87, visibility: 'public' },
]

// ---- Problem bank for the contest builder — a mix of CF/LC-style problems ----
export const problemBank = [
  { code: 'CF 1873A', title: 'Short Sort', diff: 'easy', rating: 800 },
  { code: 'LC 704', title: 'Binary Search', diff: 'easy', rating: 900 },
  { code: 'CF 1902B', title: 'Two Permutations', diff: 'easy', rating: 1000 },
  { code: 'LC 102', title: 'Binary Tree Zigzag', diff: 'med', rating: 1400 },
  { code: 'CF 1930B', title: 'Dynamic Increments', diff: 'med', rating: 1550 },
  { code: 'LC 213', title: 'House Robber II', diff: 'med', rating: 1450 },
  { code: 'CF 1854D', title: 'Segment Tree Range Ops', diff: 'hard', rating: 2100 },
  { code: 'CF 1810F', title: 'Interesting Sequence', diff: 'hard', rating: 2050 },
  { code: 'LC 42', title: 'Trapping Rain Water', diff: 'hard', rating: 1950 },
]

export const termLines = [
  '<span class="ts">23:41:02</span>   → codeforces.com/api/user.rating?handle=riya_codes',
  '<span class="ts">23:41:03</span>   <span class="ok">✓</span> rating 1714 → 1732 (Div. 2 #967, last night)',
  '<span class="ts">23:41:03</span>   → leetcode.com/graphql (contest + submission history)',
  '<span class="ts">23:41:05</span>   <span class="warn">⚠</span> retry 1/3 — leetcode rate limit, backing off 2s',
  '<span class="ts">23:41:07</span>   <span class="ok">✓</span> solved 607 → 611 (+4 today, 1 WA not counted)',
  '<span class="ts">23:41:07</span>   → reconciling sync score ...',
  '<span class="ts">23:41:08</span>   <span class="ok">✓</span> sync score 964 → 982 · campus rank #3 (+1)',
  '<span class="ts">23:41:08</span>   <span class="warn">i</span> next scheduled sync in 5h47m — probably',
]
