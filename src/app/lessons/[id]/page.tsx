"use client"

import { useState, useEffect, useRef, use } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Star, MessageCircle, ChevronRight, ChevronLeft, FileSpreadsheet, GraduationCap, Trophy, Flame, X } from 'lucide-react'
import { lessons } from '@/data/lessons'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { State, ChatMessage } from '@/types/lesson'
import { getProgress, updateLessonProgress } from '@/lib/progress'

export default function ExcelLearningPlatform({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const progress = getProgress();
  const [lessonState, setLessonState] = useState<State>({
    currentLesson: parseInt(resolvedParams.id),
    completed: false,
    stars: progress.stars,
    completedLessons: progress.completedLessons,
    answer: "",
    hasSubmitted: false,
    isCorrect: false,
    showChat: false,
    exp: progress.exp,
    level: progress.level,
    dailyProgress: progress.dailyProgress,
    dailyGoal: 50,
    streak: progress.streak || 1
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '歡迎來到第 ' + resolvedParams.id + ' 關！我是你的 AI 助教，有任何問題都可以問我喔！',
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const [chatInput, setChatInput] = useState('');

  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (tabsRef.current) {
      const activeValue = lessonState.currentLesson === 5 ? 'game' : 'content';
      const tabsElement = tabsRef.current;
      const activeTab = tabsElement.querySelector(`[data-state="active"]`);
      if (!activeTab) {
        const targetTab = tabsElement.querySelector(`[data-value="${activeValue}"]`);
        if (targetTab instanceof HTMLElement) {
          targetTab.click();
        }
      }
    }
  }, [lessonState.currentLesson]);

  const currentLesson = lessons.find(lesson => lesson.id === lessonState.currentLesson);

  const handleAnswerSubmit = () => {
    const currentQuestion = currentLesson?.questions?.[0];
    const isAnswerCorrect = currentQuestion && lessonState.answer === currentQuestion.answer;
    
    if (isAnswerCorrect) {
      const updatedProgress = updateLessonProgress(
        lessonState.currentLesson,
        10, // 星星獎勵
        20  // 經驗值獎勵
      );
      
      setLessonState(prev => ({
        ...prev,
        isCorrect: true,
        hasSubmitted: true,
        stars: updatedProgress.stars,
        completedLessons: updatedProgress.completedLessons,
        exp: updatedProgress.exp,
        level: updatedProgress.level,
        dailyProgress: updatedProgress.dailyProgress
      }));
    } else {
      setLessonState(prev => ({
        ...prev,
        isCorrect: false,
        hasSubmitted: true
      }));
    }
  };

  const handleNextLesson = () => {
    if (lessonState.currentLesson < lessons.length) {
      router.push(`/lessons/${lessonState.currentLesson + 1}`);
    }
  };

  const handlePrevLesson = () => {
    if (lessonState.currentLesson > 1) {
      router.push(`/lessons/${lessonState.currentLesson - 1}`);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonState(prev => ({
      ...prev,
      answer: e.target.value
    }));
  };

  const toggleChat = () => {
    setLessonState(prev => ({
      ...prev,
      showChat: !prev.showChat
    }));
  };

  const handleStarClick = () => {
    if (lessonState.stars >= 50) {
      router.push('/survey')
    }
  }

  const showTabs = lessonState.currentLesson === 5 ? ['game'] : ['practice', 'content']

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // 模擬 AI 回覆
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `讓我來幫你解答關於${currentLesson?.title}的問題。${currentLesson?.description}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="relative">
              <FileSpreadsheet className="h-7 w-7 text-[#2B4EFF]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#58CC02] rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-white text-xs font-bold">{lessonState.level}</span>
              </div>
            </div>
            <span className="font-bold text-xl text-gray-900">ExcelMaster</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#F5F7FF] rounded-xl">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#2B4EFF]" />
                <span className="font-semibold text-gray-900">Level {lessonState.level}</span>
              </div>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex flex-col w-36">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>經驗值</span>
                  <span>{lessonState.exp % 100}/100 XP</span>
                </div>
                <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#2B4EFF] transition-all duration-300"
                    style={{ width: `${lessonState.exp % 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF5E5] rounded-xl">
                <Star className="h-5 w-5 text-[#FF9900] fill-[#FF9900]" />
                <span className="font-semibold text-[#B36B00]">{lessonState.stars}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFE5E5] rounded-xl">
                <Flame className="h-5 w-5 text-[#FF4B4B]" />
                <span className="font-semibold text-[#CC0000]">{lessonState.streak} 天</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="text-gray-500">課程進度</span>
                <span className="font-medium">{lessonState.completedLessons.length}/{lessons.length}</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-300"
                  style={{ width: `${(lessonState.completedLessons.length / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-6">
        <main className={`transition-all duration-300 ${lessonState.showChat ? 'w-[calc(100%-24rem)]' : 'w-full'}`}>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>返回課程</span>
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <Badge variant="outline" className="bg-blue-600 text-white border-0">
                第 {lessonState.currentLesson} 關
              </Badge>
            </div>
            <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
            <p className="text-gray-600">{currentLesson?.description}</p>
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
                    <div style={{width: '100%', margin: '0 auto', maxWidth: '1200px'}}>
                      <div style={{position: 'relative', paddingBottom: '56.25%', paddingTop: 0, height: 0}}>
                        <iframe 
                          title="Impostor Escape"
                        style={{
                          position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                          src="https://view.genially.com/67629b8b6b4f9b116946050d"
                          allowFullScreen={true}
                        />
                      </div>
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
                        <li>運用 SUM 和 AVERAGE 函數進行據統計</li>
                        <li>使用 VLOOKUP 函數查找相關數據</li>
                        <li>使用 IF 函數進行條件判斷</li>
                        <li>創建樞紐分析表進行數據分析</li>
                      </ul>
                      <p className="text-blue-600 font-semibold">完成測驗後，您將獲得最終答案代碼！</p>
                    </div>
                  )}
                  <div style={{width: '100%', margin: '0 auto', maxWidth: '1200px'}}>
                    <div style={{position: 'relative', paddingBottom: '56.25%', paddingTop: 0, height: 0}}>
                      <iframe 
                        title="Impostor Escape"
                      style={{
                        position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        src="https://view.genially.com/67629b8b6b4f9b116946050d"
                        allowFullScreen={true}
                      />
                    </div>
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

        {/* AI 助教側邊面板 */}
        <div 
          className={`
            fixed top-[4rem] right-0 h-[calc(100vh-4rem)] bg-white border-l
            transition-all duration-300 shadow-lg
            ${lessonState.showChat ? 'translate-x-0 w-96' : 'translate-x-full w-0'}
          `}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-[#F5F7FF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#2B4EFF] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">AI 助教</h2>
                  <p className="text-sm text-gray-500">隨時為您解答問題</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleChat}
                className="hover:bg-blue-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      rounded-2xl p-3 max-w-[80%]
                      ${message.isUser 
                        ? 'bg-[#2B4EFF] text-white' 
                        : 'bg-gray-100 text-gray-900'
                      }
                    `}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="輸入您的問題..."
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4EFF] focus:border-transparent"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-[#2B4EFF] hover:bg-blue-700 text-white rounded-xl px-6"
                >
                  發送
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* AI 助教切換按鈕 */}
        {!lessonState.showChat && (
          <Button
            onClick={toggleChat}
            className="
              fixed right-4 bottom-4 z-50
              bg-[#2B4EFF] hover:bg-blue-700 text-white 
              rounded-full w-14 h-14 shadow-lg 
              flex items-center justify-center
              transition-opacity duration-300
            "
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4B4B] rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white">
              1
            </span>
          </Button>
        )}
      </div>
    </div>
  )
} 