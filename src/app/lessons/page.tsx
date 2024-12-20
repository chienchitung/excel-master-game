import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from 'lucide-react'

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  xpPoints: number;
  isLocked: boolean;
}

const lessons: Lesson[] = [
  {
    id: 1,
    title: "基礎函數入門",
    description: "學習 Excel 中最常用的基礎函數，包括 SUM、AVERAGE、COUNT 等",
    duration: "30分鐘",
    progress: 100,
    xpPoints: 100,
    isLocked: false
  },
  {
    id: 2,
    title: "VLOOKUP 函數應用",
    description: "掌握 VLOOKUP 函數的使用方法，學會查找和匹配數據",
    duration: "45分鐘",
    progress: 60,
    xpPoints: 150,
    isLocked: false
  },
  {
    id: 3,
    title: "IF 條件函數",
    description: "學習使用 IF 函數進行條件判斷和數據處理",
    duration: "40分鐘",
    progress: 0,
    xpPoints: 120,
    isLocked: true
  },
  {
    id: 4,
    title: "樞紐分析表",
    description: "創建和使用樞紐分析表進行數據分析和可視化",
    duration: "60分鐘",
    progress: 0,
    xpPoints: 200,
    isLocked: true
  },
  {
    id: 5,
    title: "綜合測驗",
    description: "運用所學知識解決實際問題，檢驗學習成果",
    duration: "90分鐘",
    progress: 0,
    xpPoints: 300,
    isLocked: true
  }
];

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#3C3C3C]">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">課程內容</h1>
          <p className="text-xl">按順序完成課程，獲得技能提升！</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          {lessons.map((lesson) => (
            <Link 
              key={lesson.id}
              href={lesson.isLocked ? '#' : `/lessons/${lesson.id}`}
              className={`block ${lesson.isLocked ? 'cursor-not-allowed opacity-70' : 'hover:transform hover:scale-[1.02] transition-transform'}`}
            >
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#58CC02] text-white flex items-center justify-center">
                          {lesson.id}
                        </div>
                        <h3 className="text-xl font-semibold">{lesson.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{lesson.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {lesson.duration}
                        </span>
                        <span>{lesson.xpPoints} XP</span>
                      </div>
                    </div>
                    {lesson.isLocked && (
                      <div className="text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {!lesson.isLocked && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>進度</span>
                        <span>{lesson.progress}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 