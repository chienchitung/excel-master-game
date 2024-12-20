export interface Question {
  id: number;
  description: string;
  answer: string;
  hint?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  excelExample?: string;
  duration?: string;
  xpPoints?: number;
  isLocked?: boolean;
  showGame?: boolean;
  questions?: Question[];
  isFinal?: boolean;
}

export interface LessonProgress {
  currentLesson: number;
  completed: boolean;
  stars: number;
  completedLessons: number[];
  finalAnswer?: string;
}

export interface UserProgress extends LessonProgress {
  lastUpdated?: Date;
  totalXP?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface State {
  currentLesson: number;
  completed: boolean;
  stars: number;
  completedLessons: number[];
  answer: string;
  hasSubmitted: boolean;
  isCorrect: boolean;
  showChat: boolean;
  exp: number;
  level: number;
  dailyProgress: number;
  dailyGoal: number;
  streak: number;
}

