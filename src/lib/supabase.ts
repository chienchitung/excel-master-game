import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface LearningRecord {
  id?: number
  student_id: string
  student_name: string
  lesson_id: number
  started_at: string
  completed_at: string
  time_spent_seconds: number
}

export interface LeaderboardEntry {
  id?: number
  student_id: string
  student_name: string
  completion_time_seconds: number
  completion_time_string: string
  completed_at: string
  started_at: string
  stars_earned: number
  rank?: number
}

export interface LeaderboardStats {
  total_participants: number;
  fastest_time: string;
  average_time: string;
  rankings: { student_id: string, student_name: string, completion_time_string: string, rank: number }[];
}

export async function saveLearningRecord(record: Omit<LearningRecord, 'id'>) {
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

export async function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'started_at'>) {
  try {
    // 從 localStorage 獲取開始時間
    const startTime = localStorage.getItem('start_time');
    if (!startTime) {
      console.error('Missing start time in localStorage');
      throw new Error('Missing start time');
    }

    // 直接插入新記錄，不檢查是否存在
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{
        ...entry,
        started_at: startTime // 使用開始學習時的時間
      }])
      .select();

    if (error) {
      console.error('Error saving leaderboard entry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveLeaderboardEntry:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('completion_time_seconds', { ascending: true })

  if (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }

  return data || []
}

export async function getPlayerRank(student_id: string): Promise<number> {
  // 獲取所有用戶的最佳成績
  const { data: allScores, error: scoresError } = await supabase
    .from('leaderboard')
    .select('student_id, completion_time_seconds')
    .order('completion_time_seconds', { ascending: true });

  if (scoresError) {
    console.error('Error getting scores:', scoresError);
    throw scoresError;
  }

  if (!allScores || allScores.length === 0) return 0;

  // 獲取每個用戶的最佳成績
  const bestScores = Array.from(
    allScores.reduce((map, score) => {
      if (!map.has(score.student_id) || 
          map.get(score.student_id)!.completion_time_seconds > score.completion_time_seconds) {
        map.set(score.student_id, score);
      }
      return map;
    }, new Map())
  ).map(([_, score]) => score);

  // 按完成時間排序
  bestScores.sort((a, b) => a.completion_time_seconds - b.completion_time_seconds);

  // 找到當前用戶的排名
  const rank = bestScores.findIndex(score => score.student_id === student_id) + 1;
  
  return rank || bestScores.length + 1; // 如果沒有找到，返回最後一名
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  // 獲取所有用戶的最佳成績
  const { data, error } = await supabase
    .from('leaderboard')
    .select('student_id, student_name, completion_time_seconds, completion_time_string')
    .order('completion_time_seconds', { ascending: true });

  if (error) {
    console.error('Error fetching leaderboard stats:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      total_participants: 0,
      fastest_time: '--:--',
      average_time: '--:--',
      rankings: []
    };
  }

  // 計算不重複用戶數
  const uniqueUsers = new Set(data.map(record => record.student_id));
  const totalParticipants = uniqueUsers.size;

  // 獲取每個用戶的最佳成績
  const bestScores = Array.from(uniqueUsers).map(userId => {
    return data
      .filter(record => record.student_id === userId)
      .reduce((best, current) => 
        best.completion_time_seconds < current.completion_time_seconds ? best : current
      );
  }).sort((a, b) => a.completion_time_seconds - b.completion_time_seconds);

  const fastestTime = bestScores[0].completion_time_string;
  const averageSeconds = Math.floor(
    bestScores.reduce((sum, record) => sum + record.completion_time_seconds, 0) / totalParticipants
  );
  const averageMinutes = Math.floor(averageSeconds / 60);
  const averageRemainingSeconds = averageSeconds % 60;
  const averageTime = `${averageMinutes}分${averageRemainingSeconds}秒`;

  // 添加排名數據（只顯示每個用戶的最佳成績）
  const rankings = bestScores.map((record, index) => ({
    student_id: record.student_id,
    student_name: record.student_name,
    completion_time_string: record.completion_time_string,
    rank: index + 1
  }));

  return {
    total_participants: totalParticipants,
    fastest_time: fastestTime,
    average_time: averageTime,
    rankings
  };
} 