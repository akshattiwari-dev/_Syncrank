import { z } from 'zod'

export const Role = z.enum(['student', 'campus_admin'])
export type Role = z.infer<typeof Role>

export const ContestStatus = z.enum(['draft', 'scheduled', 'live', 'completed'])
export type ContestStatus = z.infer<typeof ContestStatus>

export const ContestVisibility = z.enum(['campus', 'public'])
export type ContestVisibility = z.infer<typeof ContestVisibility>

export const ScoringMode = z.enum(['acm', 'score'])
export type ScoringMode = z.infer<typeof ScoringMode>

// ---------- Auth ----------
export const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  campusId: z.string().uuid(),
})
export type RegisterInput = z.infer<typeof RegisterInput>

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
})
export type LoginInput = z.infer<typeof LoginInput>

export const RequestPasswordResetInput = z.object({
  email: z.string().email(),
})
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetInput>

export const ResetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>

// ---------- Handles ----------
export const LinkHandlesInput = z
  .object({
    cfHandle: z.string().min(1).max(40).optional(),
    lcUsername: z.string().min(1).max(40).optional(),
  })
  .refine((v) => v.cfHandle || v.lcUsername, {
    message: 'Link at least one handle',
  })
export type LinkHandlesInput = z.infer<typeof LinkHandlesInput>

// ---------- Contests ----------
export const ContestProblemInput = z.object({
  code: z.string().min(1).max(30),
  title: z.string().min(1).max(160),
  difficulty: z.enum(['easy', 'med', 'hard']),
  points: z.number().int().min(0).max(5000),
  order: z.number().int().min(0),
})
export type ContestProblemInput = z.infer<typeof ContestProblemInput>

export const CreateContestInput = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  startAt: z.string().datetime(),
  durationMins: z.number().int().min(10).max(24 * 60),
  visibility: ContestVisibility,
  scoringMode: ScoringMode,
  participantsMode: z.enum(['all', 'invite']),
  problems: z.array(ContestProblemInput).min(1).max(20),
})
export type CreateContestInput = z.infer<typeof CreateContestInput>

export const UpdateContestInput = CreateContestInput.partial()
export type UpdateContestInput = z.infer<typeof UpdateContestInput>

// Real Judge0 submission (source code + language)
export const SubmitInput = z.object({
  problemId: z.string().uuid(),
  sourceCode: z.string().min(1).max(100_000),
  languageId: z.number().int().positive(), // Judge0 language id (e.g. 71 = Python 3.8, 54 = C++17)
})
export type SubmitInput = z.infer<typeof SubmitInput>

export const InviteUsersInput = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
})
export type InviteUsersInput = z.infer<typeof InviteUsersInput>

// ---------- Pagination ----------
export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})
export type PaginationQuery = z.infer<typeof PaginationQuery>

export const LeaderboardQuery = PaginationQuery.extend({
  year: z.coerce.number().int().optional(),
  branch: z.string().max(20).optional(),
})
export type LeaderboardQuery = z.infer<typeof LeaderboardQuery>

// ---------- Error shape (consistent across API) ----------
export const ApiError = z.object({
  error: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiError>
// ---------- Recruiters ----------
export const RecruiterQuery = PaginationQuery.extend({
  minScore: z.coerce.number().int().min(0).default(0),
})
export type RecruiterQuery = z.infer<typeof RecruiterQuery>

// ---------- Developer API keys ----------
export const ApiKeyLabelInput = z.object({ label: z.string().min(1).max(60) })
export type ApiKeyLabelInput = z.infer<typeof ApiKeyLabelInput>

// ---------- Webhooks ----------
export const WebhookInput = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['rank_change', 'contest_status'])).min(1),
})
export type WebhookInput = z.infer<typeof WebhookInput>

// ---------- Tournaments ----------
export const CreateTournamentInput = z.object({
  name: z.string().min(1).max(120),
  campusAId: z.string().uuid(),
  campusBId: z.string().uuid(),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
})
export type CreateTournamentInput = z.infer<typeof CreateTournamentInput>

// ---------- Mentorship / mock interviews ----------
export const ConnectionRequestInput = z.object({
  targetId: z.string().uuid(),
  kind: z.enum(['mentorship', 'mock_interview']),
  message: z.string().max(500).optional(),
})
export type ConnectionRequestInput = z.infer<typeof ConnectionRequestInput>

export const ConnectionRespondInput = z.object({
  status: z.enum(['accepted', 'declined']),
})
export type ConnectionRespondInput = z.infer<typeof ConnectionRespondInput>

// ---------- Teams ----------
export const CreateTeamInput = z.object({
  contestId: z.string().uuid(),
  name: z.string().min(1).max(60),
})
export type CreateTeamInput = z.infer<typeof CreateTeamInput>

export const TeamInviteInput = z.object({ userId: z.string().uuid() })
export type TeamInviteInput = z.infer<typeof TeamInviteInput>

export const TeamInviteRespondInput = z.object({ status: z.enum(['accepted', 'declined']) })
export type TeamInviteRespondInput = z.infer<typeof TeamInviteRespondInput>

// ---------- Contact ----------
export const ContactInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  message: z.string().min(1).max(2000),
})
export type ContactInput = z.infer<typeof ContactInput>