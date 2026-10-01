import type { AiMode } from '../modes'
export interface AiStatus { available: boolean; reason: 'READY' | 'NOT_CONFIGURED' | 'GLOBAL_LIMIT' | 'DAILY_LIMIT'; provider: string; dailyLimit: number; usedToday: number; remainingToday: number; maxQuestionLength: number; maxTurnsPerConversation: number; today: string; resetsAt: string }
export interface Conversation { mode: AiMode; id: string; lessonId: number | null; title: string; promptVersion: string; createdAt: string; updatedAt: string }
export interface AiTurn { id: string; requestId: string; retryOf: string | null; question: string; answer: string | null; status: 'PENDING' | 'SUCCEEDED' | 'FAILED'; errorCode: string | null; model: string; createdAt: string; finishedAt: string | null; expiresAt: string; inputTokens: number | null; outputTokens: number | null; totalTokens: number | null }
export interface ConversationDetail { conversation: Conversation; turns: AiTurn[] }
export interface ConversationPage { items: Conversation[]; total: number; page: number; size: number }
export interface SendInput { requestId: string; question: string; retryOf?: string }
