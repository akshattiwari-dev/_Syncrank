/**
 * Minimal Judge0 client.
 * Uses the public CE endpoint by default (rate-limited).
 * For production set JUDGE0_URL + JUDGE0_AUTH_TOKEN in .env
 */

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com'
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || ''

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
}
if (JUDGE0_AUTH_TOKEN) {
  HEADERS['X-Auth-Token'] = JUDGE0_AUTH_TOKEN
}

export type Judge0Status =
  | 'In Queue'
  | 'Processing'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Compilation Error'
  | 'Runtime Error (SIGSEGV)'
  | 'Runtime Error (SIGXFSZ)'
  | 'Runtime Error (SIGFPE)'
  | 'Runtime Error (SIGABRT)'
  | 'Runtime Error (NZEC)'
  | 'Runtime Error (Other)'
  | 'Internal Error'
  | 'Exec Format Error'

export interface Judge0SubmissionResult {
  token: string
  status: { id: number; description: string }
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  time: string | null // seconds as string
  memory: number | null // KB
  exit_code: number | null
}

/** Map Judge0 status id → our Verdict enum */
export function mapJudge0Status(statusId: number): 
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit'
  | 'runtime_error'
  | 'compile_error'
  | 'internal_error'
  | 'pending' {
  // Official Judge0 status ids: https://ce.judge0.com/statuses
  switch (statusId) {
    case 1: // In Queue
    case 2: // Processing
      return 'pending'
    case 3: // Accepted
      return 'accepted'
    case 4: // Wrong Answer
      return 'wrong_answer'
    case 5: // Time Limit Exceeded
      return 'time_limit'
    case 6: // Compilation Error
      return 'compile_error'
    case 7: // Runtime Error (SIGSEGV)
    case 8: // Runtime Error (SIGXFSZ)
    case 9: // Runtime Error (SIGFPE)
    case 10: // Runtime Error (SIGABRT)
    case 11: // Runtime Error (NZEC)
    case 12: // Runtime Error (Other)
      return 'runtime_error'
    default:
      return 'internal_error'
  }
}

export async function createSubmission(opts: {
  sourceCode: string
  languageId: number
  stdin?: string
  expectedOutput?: string
  cpuTimeLimit?: number // seconds
  memoryLimit?: number // KB
}): Promise<{ token: string }> {
  const body = {
    source_code: opts.sourceCode,
    language_id: opts.languageId,
    stdin: opts.stdin ?? '',
    expected_output: opts.expectedOutput ?? null,
    cpu_time_limit: opts.cpuTimeLimit ?? 2,
    memory_limit: opts.memoryLimit ?? 128000,
    wall_time_limit: 10,
  }

  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Judge0 create failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { token: string }
  if (!data.token) throw new Error('Judge0 returned no token')
  return data
}

export async function getSubmission(token: string): Promise<Judge0SubmissionResult> {
  const res = await fetch(
    `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=token,status,stdout,stderr,compile_output,time,memory,exit_code`,
    { headers: HEADERS },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Judge0 get failed (${res.status}): ${text}`)
  }

  return (await res.json()) as Judge0SubmissionResult
}

/**
 * Poll until the submission is finished (or timeout).
 * Returns the final result.
 */
export async function waitForResult(
  token: string,
  opts: { maxAttempts?: number; intervalMs?: number } = {},
): Promise<Judge0SubmissionResult> {
  const maxAttempts = opts.maxAttempts ?? 20
  const intervalMs = opts.intervalMs ?? 1000

  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmission(token)
    const statusId = result.status?.id ?? 0

    // 1 = In Queue, 2 = Processing
    if (statusId !== 1 && statusId !== 2) {
      return result
    }

    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error('Judge0 polling timed out')
}