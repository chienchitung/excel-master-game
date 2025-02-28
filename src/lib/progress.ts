import { UserProgress } from '@/types/lesson'

const PROGRESS_KEY = 'excel_master_progress'

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return getInitialProgress()
  }

  const savedProgress = localStorage.getItem(PROGRESS_KEY)
  if (!savedProgress) {
    return getInitialProgress()
  }

  return JSON.parse(savedProgress)
}

export function getInitialProgress(): UserProgress {
  return {
    completedLessons: [],
    stars: 0,
    streak: 1,
    level: 1,
    exp: 0,
    dailyProgress: 0,
    currentLesson: 1,
    completed: false
  }
}

export function resetProgress(): UserProgress {
  const initialProgress = getInitialProgress()
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress))
  return initialProgress
}

export function updateLessonProgress(
  lessonId: number,
  starsEarned: number,
  expEarned: number
): UserProgress {
  const currentProgress = getProgress()
  
  if (!currentProgress.completedLessons.includes(lessonId)) {
    currentProgress.completedLessons.push(lessonId)
    currentProgress.stars += starsEarned
    currentProgress.exp += expEarned
    currentProgress.dailyProgress += expEarned
    
    // Level up logic
    const newLevel = Math.floor(currentProgress.exp / 100) + 1
    if (newLevel > currentProgress.level) {
      currentProgress.level = newLevel
    }
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(currentProgress))
  return currentProgress
} 