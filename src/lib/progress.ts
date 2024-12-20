import { LessonProgress } from '@/types/lesson';

const PROGRESS_KEY = 'excel_master_progress';

interface Progress {
  completedLessons: number[];
  stars: number;
  exp: number;
  level: number;
  streak: number;
  dailyProgress: number;
  lastLoginDate?: string;
}

const defaultProgress: Progress = {
  completedLessons: [],
  stars: 0,
  exp: 0,
  level: 1,
  streak: 1,
  dailyProgress: 0
};

export function getProgress(): Progress {
  if (typeof window === 'undefined') return defaultProgress;
  
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return defaultProgress;

  const progress = JSON.parse(saved);
  
  // 檢查是否是新的一天
  const today = new Date().toDateString();
  if (progress.lastLoginDate !== today) {
    progress.dailyProgress = 0;
    progress.lastLoginDate = today;
    
    // 檢查連續登入
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (progress.lastLoginDate === yesterday.toDateString()) {
      progress.streak = (progress.streak || 1) + 1;
    } else {
      progress.streak = 1;
    }
    
    saveProgress(progress);
  }
  
  return progress;
}

export function saveProgress(progress: Progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({
    ...progress,
    lastLoginDate: new Date().toDateString()
  }));
}

export function updateLessonProgress(lessonId: number, stars: number, exp: number) {
  const progress = getProgress();
  
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.stars += stars;
    progress.exp += exp;
    progress.dailyProgress += exp;
    
    // 等級計算（每100 exp升一級）
    progress.level = Math.floor(progress.exp / 100) + 1;
  }
  
  saveProgress(progress);
  return progress;
}

export function resetProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
} 