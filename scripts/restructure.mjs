// usage: node scripts/restructure.mjs <srcRoot> <mapFile> [--dry]
import fs from 'node:fs'
import path from 'node:path'

const [root0, mapFile, flag] = process.argv.slice(2)
const root = path.resolve(root0)
const dry = flag === '--dry'
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
const CODE = /\.(ts|tsx|js|jsx)$/

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === 'dist' ? [] : walk(p)
    return [p]
  })
const files = walk(root)
const fileSet = new Set(files)

const rules = fs.readFileSync(mapFile, 'utf8').split('\n').map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/))
  .map(([a, b]) => [path.join(root, a), path.join(root, b)])

const mapPath = (f) => {
  for (const [a, b] of rules) if (!a.endsWith('/') && a === f) return b
  for (const [a, b] of rules) if (a.endsWith('/') && f.startsWith(a)) return b + f.slice(a.length)
  return f
}

const resolveSpec = (from, spec) => {
  const base = path.resolve(path.dirname(from), spec)
  const cands = [
    base, ...EXT.map((e) => base + e),
    base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx'), base.replace(/\.jsx$/, '.tsx'),
    ...EXT.map((e) => path.join(base, 'index' + e)),
  ]
  return cands.find((c) => fileSet.has(c))
}

const fmt = (newFrom, from, spec, oldT, newT) => {
  const dirImport =
    path.resolve(path.dirname(from), spec) !== oldT &&
    path.basename(oldT).startsWith('index.') && !/index/.test(path.basename(spec))
  let rel
  if (dirImport) rel = path.relative(path.dirname(newFrom), path.dirname(newT))
  else {
    rel = path.relative(path.dirname(newFrom), newT)
    if (CODE.test(newT)) {
      const specHasExt = /\.(js|jsx|ts|tsx)$/.test(spec)
      if (!specHasExt) rel = rel.replace(CODE, '')
      else if (spec.endsWith('.js') && /\.tsx?$/.test(newT)) rel = rel.replace(CODE, '.js')
    }
  }
  rel = rel.split(path.sep).join('/') || '.'
  return rel.startsWith('.') ? rel : './' + rel
}

const RE = /((?:from|import|vi\.mock|vi\.importActual|require)\s*\(?\s*)(['"])(\.{1,2}\/[^'"]*)\2/g
const plan = []
const seen = new Map()

for (const f of files) {
  const nf = mapPath(f)
  if (seen.has(nf)) { console.error('COLLISION:', nf); process.exit(1) }
  seen.set(nf, f)
  let content = fs.readFileSync(f, 'utf8')
  if (CODE.test(f)) {
    content = content.replace(RE, (m, pre, q, spec) => {
      const t = resolveSpec(f, spec)
      if (!t) { console.warn('UNRESOLVED', path.relative(root, f), spec); return m }
      return pre + q + fmt(nf, f, spec, t, mapPath(t)) + q
    })
  }
  plan.push({ f, nf, content })
}

for (const { f, nf } of plan) if (f !== nf) console.log(path.relative(root, f), '->', path.relative(root, nf))
if (dry) { console.log('\nDRY RUN: kuch change nahi hua'); process.exit(0) }

for (const { f, nf, content } of plan) {
  if (f !== nf) { fs.mkdirSync(path.dirname(nf), { recursive: true }); fs.rmSync(f) }
  fs.writeFileSync(nf, content)
}
const dirs = [...new Set(plan.map((p) => path.dirname(p.f)))].sort((a, b) => b.length - a.length)
for (const d of dirs) { try { fs.rmdirSync(d) } catch {} }
console.log('\nDone')
