import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserAccountabilityState } from "@/types/classroom"

type Row = {
  user_id: string
  cefr_level: UserAccountabilityState["cefrLevel"]
  current_streak: number
  xp_total: number
  kulta_balance: number
  hearts_remaining: number
  is_detention_active: boolean
  missed_count_this_week: number
}

export async function loadAccountabilityState(supabase: SupabaseClient, userId: string): Promise<UserAccountabilityState | null> {
  const [{ data: account }, { data: schedule }] = await Promise.all([
    supabase.from("user_accountability").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("weekly_assignments").select("day_of_week,assigned_module,homework_task_id,is_completed,due_at").eq("user_id", userId).order("due_at"),
  ])
  if (!account) return null
  const row = account as Row
  return {
    userId: row.user_id, cefrLevel: row.cefr_level, currentStreak: row.current_streak, xpTotal: row.xp_total,
    kultaBalance: row.kulta_balance, heartsRemaining: row.hearts_remaining,
    weeklySchedule: (schedule ?? []).map(item => ({ dayOfWeek: item.day_of_week, assignedModule: item.assigned_module, homeworkTaskId: item.homework_task_id, isCompleted: item.is_completed, dueDate: item.due_at })),
    penaltyStatus: { isDetentionActive: row.is_detention_active, missedCountThisWeek: row.missed_count_this_week },
  }
}

