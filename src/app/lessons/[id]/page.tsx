"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Star, MessageCircle, ChevronRight, ChevronLeft, FileSpreadsheet, GraduationCap } from 'lucide-react'
import { lessons } from '@/data/lessons'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LessonState, ChatMessage } from '@/types/lesson'

interface State extends LessonState {
  currentLesson: number;
  completed: boolean;
  stars: number;
  completedLessons: number[];
  answer: string;
  hasSubmitted: boolean;
  isCorrect: boolean;
  showChat: boolean;
}

export default function ExcelLearningPlatform({ params }: { params: { id: string } }) {
  const [lessonState, setLessonState] = useState<State>({
    currentLesson: parseInt(params.id),
    completed: false,
    stars: 0,
    completedLessons: [],
    answer: "",
    hasSubmitted: false,
    isCorrect: false,
    showChat: false
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '請問這一關的重點是什麼？',
      isUser: true,
      timestamp: new Date()
    }
  ])

  const tabsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleStarClick = () => {
    if (lessonState.stars >= 50) {
      router.push('/survey')
    }
  }

  useEffect(() => {
    if (tabsRef.current) {
      const activeValue = lessonState.currentLesson === 5 ? 'game' : 'content'
      const tabsElement = tabsRef.current
      const activeTab = tabsElement.querySelector(`[data-state="active"]`)
      if (!activeTab) {
        const targetTab = tabsElement.querySelector(`[data-value="${activeValue}"]`)
        if (targetTab instanceof HTMLElement) {
          targetTab.click()
        }
      }
    }
  }, [lessonState.currentLesson])

  const currentLesson = lessons.find(lesson => lesson.id === lessonState.currentLesson)
  const showTabs = lessonState.currentLesson === 5 ? ['game'] : ['practice', 'content']

  const handleNextLesson = () => {
    if (lessonState.currentLesson < lessons.length) {
      router.push(`/lessons/${lessonState.currentLesson + 1}`)
    }
  }

  const handlePrevLesson = () => {
    if (lessonState.currentLesson > 1) {
      router.push(`/lessons/${lessonState.currentLesson - 1}`)
    }
  }

  const handleAnswerSubmit = () => {
    const currentQuestion = currentLesson?.questions?.[0]
    const isAnswerCorrect = currentQuestion && lessonState.answer === currentQuestion.answer
    
    setLessonState(prev => ({
      ...prev,
      isCorrect: Boolean(isAnswerCorrect),
      hasSubmitted: true,
      stars: isAnswerCorrect && !prev.completedLessons.includes(prev.currentLesson) 
        ? prev.stars + 10 
        : prev.stars,
      completedLessons: isAnswerCorrect && !prev.completedLessons.includes(prev.currentLesson)
        ? [...prev.completedLessons, prev.currentLesson]
        : prev.completedLessons
    }))
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonState(prev => ({
      ...prev,
      answer: e.target.value
    }))
  }

  const toggleChat = () => {
    setLessonState(prev => ({
      ...prev,
      showChat: !prev.showChat
    }))
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">ExcelMaster</span>
            </div>
            <Progress 
              value={(lessonState.completedLessons.length / lessons.length) * 100} 
              className="w-48 h-3" 
            />
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className="bg-amber-400 text-white border-0 flex gap-1 cursor-pointer"
              onClick={handleStarClick}
            >
              <Star className="h-4 w-4 fill-white" />
              <span>{lessonState.stars}</span>
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative"
              onClick={toggleChat}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-6">
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-600 text-white border-0">
                第 {lessonState.currentLesson} 關
              </Badge>
              <span className="text-sm text-gray-500">
                進度 {Math.round((lessonState.completedLessons.length / lessons.length) * 100)}%
              </span>
            </div>
          </div>

          <Tabs ref={tabsRef} defaultValue={lessonState.currentLesson === 5 ? 'game' : 'content'} className="mb-8">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${showTabs.length}, 1fr)` }}>
              {showTabs.includes('content') && <TabsTrigger value="content">課程內容</TabsTrigger>}
              {showTabs.includes('practice') && <TabsTrigger value="practice">互動練習</TabsTrigger>}
              {showTabs.includes('game') && <TabsTrigger value="game">遊戲關卡</TabsTrigger>}
            </TabsList>
            
            {showTabs.includes('content') && (
              <TabsContent value="content">
                <Card className="p-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson?.content || '' }}
                  />
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-semibold mb-4">互動教學</h3>
                    <div 
                      className="container-wrapper-genially" 
                      style={{ position: 'relative', minHeight: '600px', maxWidth: '100%' }}
                    >
                      <video 
                        className="loader-genially" 
                        autoPlay 
                        loop 
                        playsInline 
                        muted 
                        style={{
                          position: 'absolute',
                          top: '45%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '80px',
                          height: '80px',
                          marginBottom: '10%'
                        }}
                      >
                        <source 
                          src="https://static.genially.com/resources/loader-default-rebranding.mp4" 
                          type="video/mp4" 
                        />
                        您的瀏覽器不支持影片標籤
                      </video>
                      <div 
                        id="67629b8b6b4f9b116946050d" 
                        className="genially-embed" 
                        style={{
                          margin: '0 auto',
                          position: 'relative',
                          height: 'auto',
                          width: '100%'
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}
            
            {showTabs.includes('practice') && (
              <TabsContent value="practice">
                <Card className="overflow-hidden">
                  <div className="relative bg-white rounded-lg p-4">
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">練習題目：</h3>
                      <p>{currentLesson?.questions?.[0].description}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {currentLesson?.excelExample}
                      </pre>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">您的答案：</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lessonState.answer}
                          onChange={handleAnswerChange}
                          className="flex-1 p-2 border rounded-md"
                          placeholder="輸入您的答案..."
                        />
                        <Button 
                          onClick={handleAnswerSubmit}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          提交答案
                        </Button>
                      </div>
                      {lessonState.hasSubmitted && (
                        <div className={`mt-2 ${lessonState.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {lessonState.isCorrect ? '答案正確！獲得 10 星星！' : '答案不正確，請重試。'}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent 
              value="game" 
              forceMount
              className={lessonState.currentLesson === 5 ? 'block' : 'hidden'}
            >
              <Card className="overflow-hidden">
                <div className="relative bg-white rounded-lg p-4">
                  {lessonState.currentLesson === 5 && (
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">綜合測驗說明</h3>
                      <p className="mb-4">在這個測驗中，您需要運用前面學習的所有函數知識來解決實際問題。</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>運用 SUM 和 AVERAGE 函數進行數據統計</li>
                        <li>使用 VLOOKUP 函數查找相關數據</li>
                        <li>使用 IF 函數進行條件判斷</li>
                        <li>創建樞紐分析表進行數據分析</li>
                      </ul>
                      <p className="text-blue-600 font-semibold">完成測驗後，您將獲得最終答案代碼！</p>
                    </div>
                  )}
                  <div 
                    className="container-wrapper-genially" 
                    style={{ position: 'relative', minHeight: '600px', maxWidth: '100%' }}
                  >
                    <video 
                      className="loader-genially" 
                      autoPlay 
                      loop 
                      playsInline 
                      muted 
                      style={{
                        position: 'absolute',
                        top: '45%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        marginBottom: '10%'
                      }}
                    >
                      <source 
                        src="https://static.genially.com/resources/loader-default-rebranding.mp4" 
                        type="video/mp4" 
                      />
                      您的瀏覽器不支持影片標籤
                    </video>
                    <div 
                      id="67629b8b6b4f9b116946050d" 
                      className="genially-embed" 
                      style={{
                        margin: '0 auto',
                        position: 'relative',
                        height: 'auto',
                        width: '100%'
                      }}
                    />
                  </div>
                  {lessonState.currentLesson === 5 && (
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lessonState.answer}
                          onChange={handleAnswerChange}
                          className="flex-1 p-2 border rounded-md"
                          placeholder="輸入最終答案..."
                        />
                        <Button 
                          onClick={handleAnswerSubmit}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          提交答案
                        </Button>
                      </div>
                      {lessonState.hasSubmitted && (
                        <div className={`mt-2 ${lessonState.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {lessonState.isCorrect ? '恭喜您完成所有課程！' : '答案不正確，請重試。'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center">
            <div>
              {lessonState.currentLesson === 1 ? (
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    回到首頁
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handlePrevLesson}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一關
                </Button>
              )}
            </div>
            <div className="flex-1">
              {lessonState.currentLesson !== 5 && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 ml-auto"
                  onClick={handleNextLesson}
                >
                  下一關
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </main>

        {lessonState.showChat && (
          <Card className="w-96 h-[calc(100vh-8rem)] flex flex-col sticky top-24">
            <div className="p-4 border-b flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold">AI 助教</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.isUser 
                        ? 'bg-blue-50 ml-auto' 
                        : 'bg-gray-100 mr-auto'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                <div className="bg-gray-100 rounded-lg p-3 mr-auto max-w-[80%]">
                  在第 {lessonState.currentLesson} 關中，我們主要學習 {currentLesson?.description}
                  需要更詳細的說明嗎？
                </div>
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="輸入您的問題..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button>發送</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 