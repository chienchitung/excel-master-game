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

export interface LeaderboardStats {
  total_participants: number;
  fastest_time: string;
  average_time: string;
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

export async function getPlayerRank(student_id: string): Promise<number> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('completion_time_seconds', { ascending: true });

  if (error) {
    console.error('Error getting player rank:', error);
    throw error;
  }

  if (!data) return 0;

  // Find the index of the player's record
  const playerIndex = data.findIndex(record => record.student_id === student_id);
  return playerIndex === -1 ? 0 : playerIndex + 1;
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('completion_time_seconds, completion_time_string')
    .order('completion_time_seconds', { ascending: true });

  if (error) {
    console.error('Error fetching leaderboard stats:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      total_participants: 0,
      fastest_time: '--:--',
      average_time: '--:--'
    };
  }

  const totalParticipants = data.length;
  const fastestTime = data[0].completion_time_string;
  const averageSeconds = Math.floor(
    data.reduce((sum, record) => sum + record.completion_time_seconds, 0) / totalParticipants
  );
  const averageMinutes = Math.floor(averageSeconds / 60);
  const averageRemainingSeconds = averageSeconds % 60;
  const averageTime = `${averageMinutes}分${averageRemainingSeconds}秒`;

  return {
    total_participants: totalParticipants,
    fastest_time: fastestTime,
    average_time: averageTime
  };
} 