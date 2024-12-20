"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, BarChart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { lessons } from '@/data/lessons'

interface ProgressData {
  completedLessons: number;
  stars: number;
}

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressData>({ completedLessons: 0, stars: 0 })

  useEffect(() => {
    const fetchProgress = async () => {
      const response = await new Promise<ProgressData>(resolve =>
        setTimeout(() => resolve({ completedLessons: 2, stars: 20 }), 1000)
      )
      setProgress(response)
    }
    fetchProgress()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#3C3C3C]">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Excel 大師挑戰</h1>
          <p className="text-xl">踏上 Excel 技能提升之旅，成為數據分析專家！</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white text-[#3C3C3C] overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BookOpen className="mr-2" />
                學習內容
              </h2>
              <ul className="space-y-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#58CC02] text-white flex items-center justify-center mr-3">
                      {lesson.id}
                    </div>
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white text-[#3C3C3C] overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Award className="mr-2" />
                學習目標
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#58CC02]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                  掌握 Excel 基礎函數
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#58CC02]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                  學會使用 VLOOKUP 函數
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#58CC02]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                  理解並應用 IF 條件函數
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#58CC02]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                  創建和分析樞紐分析表
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#58CC02]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                  綜合運用所學解決實際問題
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white text-[#3C3C3C] mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BarChart className="mr-2" />
              學習進度
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>總體進度</span>
                  <span>{(progress.completedLessons / lessons.length * 100).toFixed(0)}%</span>
                </div>
                <Progress value={progress.completedLessons / lessons.length * 100} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>已獲得星星</span>
                  <span>{progress.stars} / 50</span>
                </div>
                <Progress value={progress.stars / 50 * 100} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/lessons">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-6 px-12 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
              開始學習挑戰
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
