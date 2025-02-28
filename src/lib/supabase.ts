import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface LearningRecord {
  id?: number
  student_id: string
  student_name: string
  lesson_id: number
  completed_at: string
  created_at?: string
}

export interface LeaderboardEntry {
  id?: number
  student_id: string
  student_name: string
  completion_time_seconds: number
  completion_time_string: string
  completed_at?: string
  stars_earned: number
  rank?: number
}

export async function saveLearningRecord(record: Omit<LearningRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('learning_records')
    .insert([record])
    .select()

  if (error) {
    console.error('Error saving learning record:', error)
    throw error
  }

  return data
}

export async function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank'>) {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([entry])
    .select()

  if (error) {
    console.error('Error saving leaderboard entry:', error)
    throw error
  }

  return data
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('completion_time_seconds', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }

  return data || []
}

export async function getPlayerRank(completion_time_seconds: number): Promise<number> {
  const { count, error } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .lt('completion_time_seconds', completion_time_seconds)

  if (error) {
    console.error('Error getting player rank:', error)
    throw error
  }

  return (count || 0) + 1
} 