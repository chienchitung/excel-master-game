"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileSpreadsheet, Star, Flame, Trophy, BookOpen } from "lucide-react"
import { lessons } from '@/data/lessons'
import { getProgress } from '@/lib/progress'

interface ProgressData {
  completedLessons: number[];
  stars: number;
  streak: number;
  level: number;
  exp: number;
  dailyGoal: number;
  dailyProgress: number;
}

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressData>({
    completedLessons: [],
    stars: 0,
    streak: 1,
    level: 1,
    exp: 0,
    dailyGoal: 50,
    dailyProgress: 0
  })

  useEffect(() => {
    const savedProgress = getProgress();
    setProgress(prev => ({
      ...prev,
      ...savedProgress,
    }));
  }, []);

  const isStarted = progress.completedLessons.length > 0;
  const nextLessonId = isStarted ? Math.min(progress.completedLessons.length + 1, lessons.length) : 1;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="relative">
              <FileSpreadsheet className="h-7 w-7 text-[#2B4EFF]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#58CC02] rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-white text-xs font-bold">{progress.level}</span>
              </div>
            </div>
            <span className="font-bold text-xl text-gray-900">ExcelMaster</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#F5F7FF] rounded-xl">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#2B4EFF]" />
                <span className="font-semibold text-gray-900">Level {progress.level}</span>
              </div>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex flex-col w-36">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>經驗值</span>
                  <span>{progress.exp % 100}/100 XP</span>
                </div>
                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#2B4EFF] transition-all duration-300"
                    style={{ width: `${progress.exp % 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF5E5] rounded-xl">
                <Star className="h-5 w-5 text-[#FF9900] fill-[#FF9900]" />
                <span className="font-semibold text-[#B36B00]">{progress.stars}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFE5E5] rounded-xl">
                <Flame className="h-5 w-5 text-[#FF4B4B]" />
                <span className="font-semibold text-[#CC0000]">{progress.streak} 天</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="text-gray-500">課程進度</span>
                <span className="font-medium">{progress.completedLessons.length}/{lessons.length}</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-300"
                  style={{ width: `${(progress.completedLessons.length / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
        {/* 歡迎區塊 */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Excel 大師挑戰
          </h1>
            <p className="text-xl text-gray-600">
            踏上 Excel 技能提升之旅，成為數據分析專家！
          </p>
        </div>

        {/* 課程進度概覽 */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FF] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#2B4EFF]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">總體進度</div>
                  <div className="text-xl font-bold text-gray-900">
                  {Math.round((progress.completedLessons.length / lessons.length) * 100)}%
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2B4EFF] transition-all duration-300"
                  style={{ width: `${(progress.completedLessons.length / lessons.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FF] flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-[#2B4EFF]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">等級進度</div>
                  <div className="text-xl font-bold text-gray-900">
                    Level {progress.level}
                  </div>
                </div>
                    </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2B4EFF] transition-all duration-300"
                  style={{ width: `${progress.exp % 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5E5] flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#FF9900]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">星星收集</div>
                  <div className="text-xl font-bold text-gray-900">
                    {progress.stars}/50
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF9900] transition-all duration-300"
                  style={{ width: `${(progress.stars / 50) * 100}%` }}
                />
              </div>
            </div>
        </div>

          {/* 課程列表和成就 */}
          <div className="grid grid-cols-3 gap-8">
        {/* 課程列表 */}
            <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">學習路線圖</h2>
            <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  const isNext = !isCompleted && lesson.id === nextLessonId;
                  const isLocked = lesson.id > nextLessonId;

                  return (
                    <Link 
                      key={lesson.id} 
                      href={isLocked ? '#' : `/lessons/${lesson.id}`}
                      className={`block ${isLocked ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className={`
                        relative p-4 rounded-xl transition-all duration-200
                        ${isCompleted 
                          ? 'bg-[#E5FFE1] border border-[#58CC02]' 
                          : isNext
                            ? 'bg-[#F5F7FF] border border-[#2B4EFF]'
                            : 'bg-gray-50 border border-gray-200'
                        }
                        ${!isLocked && 'hover:transform hover:translate-y-[-2px] hover:shadow-md'}
                      `}>
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${isCompleted 
                              ? 'bg-[#58CC02]' 
                              : isNext
                                ? 'bg-[#2B4EFF]'
                                : 'bg-gray-300'
                            }
                            text-white font-bold
                          `}>
                            {lesson.id}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-[#FF9900] fill-[#FF9900]" />
                              <span className="font-medium">10</span>
                            </div>
                          )}
                        </div>
                </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 右側成就和開始按鈕 */}
          <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900">學習成就</h2>
                <div className="space-y-4">
                  <div className="bg-[#FFE5E5] p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">連續學習</h3>
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-[#FF4B4B]" />
                        <span className="font-medium text-[#CC0000]">{progress.streak} 天</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FF4B4B] transition-all duration-300"
                        style={{ width: `${progress.streak * 20}%` }}
                      />
                    </div>
                  </div>
            </div>
              </div>

              <div className="bg-[#2B4EFF] rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">準備好開始嗎？</h2>
                <p className="mb-6 text-white/90">
                  立即開始您的 Excel 學習之旅，一步步成為數據分析專家！
                </p>
                <Link href={`/lessons/${nextLessonId}`}>
                  <button className="w-full bg-white text-[#2B4EFF] hover:bg-blue-50 font-bold text-lg py-4 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                    {isStarted ? '繼續學習' : '開始學習'}
                  </button>
          </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
