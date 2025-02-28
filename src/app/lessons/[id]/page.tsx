"use client"

import { useState, useEffect, useRef, use } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, MessageCircle, ChevronRight, ChevronLeft, FileSpreadsheet, GraduationCap, Trophy, Flame, X, Gift } from 'lucide-react'
import { lessons } from '@/data/lessons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { State, ChatMessage } from '@/types/lesson'
import { getProgress, updateLessonProgress } from '@/lib/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { saveLearningRecord, saveLeaderboardEntry, getPlayerRank, getLeaderboardStats } from '@/lib/supabase'

export default function ExcelLearningPlatform({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [completionTime, setCompletionTime] = useState<string | null>(null);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [leaderboardStats, setLeaderboardStats] = useState<{
    total_participants: number;
    fastest_time: string;
    average_time: string;
  }>({
    total_participants: 0,
    fastest_time: '--:--',
    average_time: '--:--'
  });
  const [lessonState, setLessonState] = useState<State>({
    currentLesson: parseInt(resolvedParams.id),
    completed: false,
    stars: 0,
    completedLessons: [],
    answer: "",
    hasSubmitted: false,
    isCorrect: false,
    showChat: false,
    exp: 0,
    level: 1,
    dailyProgress: 0,
    dailyGoal: 50,
    streak: 1
  });

  useEffect(() => {
    const progress = getProgress();
    const currentLessonId = parseInt(resolvedParams.id);
    const isLessonCompleted = progress.completedLessons.includes(currentLessonId);
    const currentQuestion = lessons.find(lesson => lesson.id === currentLessonId)?.questions?.[0];
    
    setLessonState(prev => ({
      ...prev,
      stars: progress.stars,
      completedLessons: progress.completedLessons,
      hasSubmitted: isLessonCompleted,
      isCorrect: isLessonCompleted,
      answer: isLessonCompleted && currentQuestion ? currentQuestion.answer : "",
      exp: progress.exp,
      level: progress.level,
      dailyProgress: progress.dailyProgress,
      streak: progress.streak || 1
    }));

    // 讀取完成時間和排行榜統計
    if (showRewardDialog) {
      const savedTime = localStorage.getItem('completion_time');
      if (savedTime) {
        setCompletionTime(savedTime);
      }

      // 獲取玩家排名
      const studentId = localStorage.getItem('student_id') || 'guest';
      getPlayerRank(studentId)
        .then(rank => {
          setPlayerRank(rank);
        })
        .catch(error => {
          console.error('Failed to fetch player rank:', error);
        });

      // 獲取排行榜統計數據
      getLeaderboardStats()
        .then(stats => {
          setLeaderboardStats(stats);
        })
        .catch(error => {
          console.error('Failed to fetch leaderboard stats:', error);
        });
    }
  }, [resolvedParams.id, showRewardDialog]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '歡迎來到第 ' + resolvedParams.id + ' 關！我是你的 AI 助教，有任何問題都可以問我！',
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

  const handleAnswerSubmit = async () => {
    // 防止重複提交
    if (lessonState.hasSubmitted) return;
    
    const currentQuestion = lessons.find(lesson => lesson.id === lessonState.currentLesson)?.questions?.[0];
    if (!currentQuestion) return;

    const isCorrect = lessonState.answer.toLowerCase() === currentQuestion.answer.toLowerCase();
    
    // 先更新提交狀態，防止重複提交
    setLessonState(prev => ({
      ...prev,
      hasSubmitted: true,
      isCorrect: isCorrect
    }));
    
    // 正確處理 UTC+8 時間
    const now = new Date();
    const currentTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .replace('Z', '+08:00');
    
    setCompletionTime(currentTime);

    if (isCorrect && !lessonState.completedLessons.includes(lessonState.currentLesson)) {
      try {
        const studentId = localStorage.getItem('student_id') || 'guest';
        const studentName = localStorage.getItem('student_name') || '訪客';

        // 儲存學習記錄到 Supabase
        await saveLearningRecord({
          student_id: studentId,
          student_name: studentName,
          lesson_id: lessonState.currentLesson,
          completed_at: currentTime
        });

        // 如果是第五關且答案正確，計算完成時間並記錄到排行榜
        if (lessonState.currentLesson === 5) {
          const startTime = localStorage.getItem('start_time');
          if (startTime) {
            const endTime = Date.now();
            const totalTimeInSeconds = Math.floor((endTime - parseInt(startTime)) / 1000);
            const minutes = Math.floor(totalTimeInSeconds / 60);
            const seconds = totalTimeInSeconds % 60;
            const timeString = `${minutes}分${seconds}秒`;
            
            // 儲存到 localStorage
            localStorage.setItem('completion_time', timeString);
            localStorage.setItem('completion_time_seconds', totalTimeInSeconds.toString());
            setCompletionTime(timeString);

            // 確保只提交一次排行榜記錄
            const hasSubmittedToLeaderboard = localStorage.getItem('leaderboard_submitted');
            if (!hasSubmittedToLeaderboard) {
              // 儲存到排行榜
              await saveLeaderboardEntry({
                student_id: studentId,
                student_name: studentName,
                completion_time_seconds: totalTimeInSeconds,
                completion_time_string: timeString,
                stars_earned: 50,
                completed_at: currentTime
              });
              
              // 標記已提交排行榜
              localStorage.setItem('leaderboard_submitted', 'true');
              
              // 獲取玩家排名
              const rank = await getPlayerRank(studentId);
              setPlayerRank(rank);
            }
          }
        }

        // 每個問題固定獎勵 10 星星
        const updatedStars = lessonState.stars + 10;
        
        const updatedProgress = updateLessonProgress(
          lessonState.currentLesson,
          10, // 星星獎勵
          20  // 經驗值獎勵
        );
        
        setLessonState(prev => ({
          ...prev,
          stars: updatedStars,
          completedLessons: updatedProgress.completedLessons,
          exp: updatedProgress.exp,
          level: updatedProgress.level,
          dailyProgress: updatedProgress.dailyProgress
        }));
      } catch (error) {
        console.error('Failed to save record:', error);
        // 發生錯誤時重置提交狀態
        setLessonState(prev => ({
          ...prev,
          hasSubmitted: false
        }));
      }
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

  const handleContinue = () => {
    if (lessonState.currentLesson === 5) {
      // 第五關顯示獎勵兌換視窗
      setShowRewardDialog(true);
    } else {
      // 前四關直接進入下一關
      handleNextLesson();
    }
  };

  const handleRewardClaim = () => {
    if (lessonState.stars >= 50) {
      const updatedProgress = updateLessonProgress(
        lessonState.currentLesson,
        -50, // 扣除 50 星星
        0    // 不給予額外經驗值
      );
      
      setLessonState(prev => ({
        ...prev,
        stars: updatedProgress.stars
      }));
      
      setShowRewardDialog(false);
      // 導向到問卷連結
      window.location.href = 'https://www.surveycake.com/s/nApPl';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto h-16 md:h-20 flex items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">excel</span>
              <div className="w-5 h-5 md:w-6 md:h-6 relative mx-0.5">
                <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full" />
              </div>
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">master</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-[#F5F7FF] rounded-xl">
              <div className="flex items-center gap-1 md:gap-2">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[#2B4EFF]" />
                <span className="font-semibold text-gray-900 text-sm md:text-base">Level {lessonState.level}</span>
              </div>
              <div className="h-4 md:h-5 w-px bg-gray-200" />
              <div className="flex flex-col w-28 md:w-36">
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-600 mb-1">
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

            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#FFF5E5] rounded-xl">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-[#FF9900] fill-[#FF9900]" />
                <span className="font-semibold text-[#B36B00] text-xs md:text-base">{lessonState.stars}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#FFE5E5] rounded-xl">
                <Flame className="h-4 w-4 md:h-5 md:w-5 text-[#FF4B4B]" />
                <span className="font-semibold text-[#CC0000] text-xs md:text-base">{lessonState.streak} 天</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 px-2 md:px-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm mb-1">
                <span className="text-gray-500">課程進度</span>
                <span className="font-medium">{lessonState.completedLessons.length}/{lessons.length}</span>
              </div>
              <div className="w-24 md:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-300"
                  style={{ width: `${(lessonState.completedLessons.length / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-4 md:gap-6">
        <main className={`transition-all duration-300 ${lessonState.showChat ? 'w-full md:w-[calc(100%-24rem)]' : 'w-full'}`}>
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">返回首頁</span>
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <Badge variant="outline" className="bg-blue-600 text-white border-0 text-sm md:text-base">
                第 {lessonState.currentLesson} 關
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mb-2">{currentLesson?.title}</h1>
            <p className="text-sm md:text-base text-gray-600">{currentLesson?.description}</p>
          </div>

          <Tabs ref={tabsRef} defaultValue={lessonState.currentLesson === 5 ? 'game' : 'content'} className="mb-6 md:mb-8">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${showTabs.length}, 1fr)` }}>
              {showTabs.includes('content') && (
                <TabsTrigger value="content" className="text-sm md:text-base">課程內容</TabsTrigger>
              )}
              {showTabs.includes('practice') && (
                <TabsTrigger value="practice" className="text-sm md:text-base">互動練習</TabsTrigger>
              )}
              {showTabs.includes('game') && (
                <TabsTrigger value="game" className="text-sm md:text-base">遊戲關卡</TabsTrigger>
              )}
            </TabsList>
            
            {showTabs.includes('content') && (
              <TabsContent value="content">
                <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="bg-gray-900 text-white p-4 rounded-t-2xl">
                    <h2 className="text-lg md:text-xl font-semibold">課程內容</h2>
                  </div>
                  <div className="p-6">
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
                  </div>
                </Card>
              </TabsContent>
            )}
            
            {showTabs.includes('practice') && (
              <TabsContent value="practice">
                <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="bg-gray-900 text-white p-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg md:text-xl font-semibold">互動練習</h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>+10</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Trophy className="h-4 w-4 text-blue-400" />
                          <span>+20 XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* 進度指示器 */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">練習進度</span>
                        <span className="text-sm font-medium">{lessonState.hasSubmitted ? "1/1" : "0/1"}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-full bg-[#58CC02] rounded-full transition-all duration-300" 
                          style={{ width: lessonState.hasSubmitted ? '100%' : '0%' }} 
                        />
                      </div>
                    </div>

                    {/* 練習題目區塊 */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#2B4EFF] flex items-center justify-center flex-shrink-0">
                            <FileSpreadsheet className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-3">練習題目</h3>
                            <p className="text-gray-700 mb-4">{currentLesson?.questions?.[0].description}</p>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-600">
                        {currentLesson?.excelExample}
                      </pre>
                    </div>
                          </div>
                        </div>
                      </div>

                      {/* 答案輸入區塊 */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#58CC02] flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-3">您的答案</h3>
                            <div className="space-y-4">
                        <input
                          type="text"
                          value={lessonState.answer}
                          onChange={handleAnswerChange}
                                className="w-full p-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#2B4EFF] focus:border-transparent"
                          placeholder="輸入您的答案..."
                        />
                              {lessonState.hasSubmitted && (
                                <div className={`p-4 rounded-xl ${
                                  lessonState.isCorrect 
                                    ? 'bg-[#E5FFE1] text-[#58CC02]' 
                                    : 'bg-[#FFE5E5] text-[#FF4B4B]'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    {lessonState.isCorrect ? (
                                      <>
                                        <Star className="h-5 w-5 fill-current" />
                                        <span className="font-medium">太棒了！答案正確！獲得 10 星星！</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-5 w-5" />
                                        <span className="font-medium">答案不正確，請重試。</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                        <Button 
                                onClick={lessonState.isCorrect ? handleContinue : handleAnswerSubmit}
                                className={`w-full py-4 text-lg font-semibold rounded-xl transition-transform hover:scale-105 ${
                                  lessonState.hasSubmitted && lessonState.isCorrect
                                    ? 'bg-[#58CC02] hover:bg-[#46a001]'
                                    : 'bg-[#2B4EFF] hover:bg-blue-700'
                                } text-white`}
                              >
                                {lessonState.hasSubmitted && lessonState.isCorrect ? '繼續' : '檢查答案'}
                        </Button>
                      </div>
                          </div>
                        </div>
                      </div>
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
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gray-900 text-white p-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-semibold">遊戲關卡</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>+10</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy className="h-4 w-4 text-blue-400" />
                        <span>+20 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* 進度指示器 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">練習進度</span>
                      <span className="text-sm font-medium">{lessonState.hasSubmitted ? "1/1" : "0/1"}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div 
                        className="h-full bg-[#58CC02] rounded-full transition-all duration-300" 
                        style={{ width: lessonState.hasSubmitted ? '100%' : '0%' }} 
                      />
                    </div>
                  </div>

                  {/* 遊戲說明區塊 */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#2B4EFF] flex items-center justify-center flex-shrink-0">
                          <FileSpreadsheet className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-3">綜合測驗說明</h3>
                          <p className="text-gray-700 mb-4">在這測驗中，您需要運用前面學習的所有函數知識來解決實際問題。</p>
                          <ul className="list-disc pl-6 mb-4 text-gray-700">
                            <li>運用 SUM、AVERAGE 函數進行數據統計</li>
                        <li>使用 VLOOKUP 函數查找相關數據</li>
                        <li>使用 IF 函數進行條件判斷</li>
                        <li>創建樞紐分析表進行數據分析</li>
                      </ul>
                      <p className="text-blue-600 font-semibold">完成測驗後，您將獲得最終答案代碼！</p>
                    </div>
                      </div>
                    </div>

                    {/* 遊戲區塊 */}
                    <div className="bg-gray-50 rounded-xl p-6">
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
                              border: 'none',
                              borderRadius: '0.75rem'
                            }}
                            src="https://view.genially.com/67629b8b6b4f9b116946050d"
                            allowFullScreen={true}
                    />
                  </div>
                      </div>
                    </div>

                    {/* 答案輸入區塊 */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#58CC02] flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-3">您的答案</h3>
                          <div className="space-y-4">
                        <input
                          type="text"
                          value={lessonState.answer}
                          onChange={handleAnswerChange}
                              className="w-full p-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#2B4EFF] focus:border-transparent"
                          placeholder="輸入最終答案..."
                        />
                            {lessonState.hasSubmitted && (
                              <div className={`p-4 rounded-xl ${
                                lessonState.isCorrect 
                                  ? 'bg-[#E5FFE1] text-[#58CC02]' 
                                  : 'bg-[#FFE5E5] text-[#FF4B4B]'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {lessonState.isCorrect ? (
                                    <>
                                      <Star className="h-5 w-5 fill-current" />
                                      <span className="font-medium">恭喜您完成所有課程！獲得 10 星星！</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-5 w-5" />
                                      <span className="font-medium">答案不正確，請重試。</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                        <Button 
                              onClick={lessonState.isCorrect ? handleContinue : handleAnswerSubmit}
                              className={`w-full py-4 text-lg font-semibold rounded-xl transition-transform hover:scale-105 ${
                                lessonState.hasSubmitted && lessonState.isCorrect
                                  ? 'bg-[#58CC02] hover:bg-[#46a001]'
                                  : 'bg-[#2B4EFF] hover:bg-blue-700'
                              } text-white`}
                            >
                              {lessonState.hasSubmitted && lessonState.isCorrect ? '繼續' : '檢查答案'}
                        </Button>
                      </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    className="flex items-center gap-2 text-sm md:text-base"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    回到首頁
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-sm md:text-base"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 ml-auto text-sm md:text-base"
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
            fixed inset-0 md:inset-auto md:top-[4rem] md:right-0 md:h-[calc(100vh-4rem)] 
            bg-white border-l z-50 transition-all duration-300
            ${lessonState.showChat 
              ? 'translate-x-0 w-full md:w-96' 
              : 'translate-x-full w-full md:w-0'
            }
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
                      text-sm md:text-base
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
                  className="flex-1 px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#2B4EFF] focus:border-transparent"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-[#2B4EFF] hover:bg-blue-700 text-white rounded-xl px-4 md:px-6 text-sm md:text-base"
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
              rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg 
              flex items-center justify-center
              transition-opacity duration-300
            "
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#FF4B4B] rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white">
              1
            </span>
          </Button>
        )}
      </div>

      {/* 獎勵兌換視窗 */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Gift className="h-6 w-6 text-[#FF9900]" />
              兌換獎勵
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-base text-muted-foreground">
                <div>恭喜完成所有課程！</div>
                {completionTime && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2B4EFF] font-semibold">
                        完成時間：{completionTime}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F5F7FF] rounded-lg">
                        <Trophy className="h-4 w-4 text-[#2B4EFF]" />
                        <span className="text-sm font-medium text-[#2B4EFF]">
                          第 {playerRank || '...'} 名
                        </span>
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <h3 className="font-semibold text-gray-900">完成時間排行榜</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">參與人數</div>
                          <div className="font-bold text-[#2B4EFF]">{leaderboardStats.total_participants}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">最快紀錄</div>
                          <div className="font-bold text-[#58CC02]">{leaderboardStats.fastest_time}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">平均時間</div>
                          <div className="font-bold text-[#FF9900]">{leaderboardStats.average_time}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>您可以使用 50 顆星星兌換特別獎勵。</div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#FFF5E5] rounded-xl">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#FF9900] fill-[#FF9900]" />
                  <span className="font-semibold">所需星星</span>
                </div>
                <span className="text-lg font-bold text-[#FF9900]">50</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#FF9900] fill-[#FF9900]" />
                  <span className="font-semibold">您的星星</span>
                </div>
                <span className="text-lg font-bold text-[#FF9900]">{lessonState.stars}</span>
              </div>
              <Button
                onClick={handleRewardClaim}
                disabled={lessonState.stars < 50}
                className={`w-full py-4 text-lg font-semibold rounded-xl transition-transform hover:scale-105 
                  ${lessonState.stars >= 50 
                    ? 'bg-[#FF9900] hover:bg-[#E68A00]' 
                    : 'bg-gray-300'
                  } text-white`}
              >
                {lessonState.stars >= 50 ? '兌換獎勵' : '星星不足'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 