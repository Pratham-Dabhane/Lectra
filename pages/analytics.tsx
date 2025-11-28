import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  total_sessions: number;
  total_questions: number;
  total_study_time_minutes: number;
  average_session_duration: number;
  unique_documents: number;
  unique_topics: number;
  study_streak_days: number;
  most_active_topics: Array<{ topic: string; count: number }>;
  daily_activity: Array<{ date: string; questions: number }>;
}

export default function Analytics() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        await loadAnalytics(user.id, 'monthly');
      }
    };
    checkUser();
  }, [router]);

  const loadAnalytics = async (userId: string, period: 'weekly' | 'monthly') => {
    try {
      setIsLoading(true);
      const endpoint = period === 'weekly' ? 'weekly' : 'monthly';
      const response = await fetch(`http://localhost:8000/api/phase6/analytics/${userId}/${endpoint}`);

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeframeChange = async (period: 'weekly' | 'monthly') => {
    setTimeframe(period);
    if (user) {
      await loadAnalytics(user.id, period);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Study Analytics 📊</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and study habits</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => handleTimeframeChange('weekly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              timeframe === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleTimeframeChange('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              timeframe === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last 30 Days
          </button>
        </div>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Questions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_questions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Study Time</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(stats.total_study_time_minutes / 60)}h</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Study Streak</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.study_streak_days} days</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Documents Used</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unique_documents}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Topics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Most Studied Topics</h2>
                {stats.most_active_topics.length > 0 ? (
                  <div className="space-y-3">
                    {stats.most_active_topics.slice(0, 8).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{topic.topic}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(topic.count / stats.most_active_topics[0].count) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-600 text-sm font-medium w-8 text-right">{topic.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No topics tracked yet. Start asking questions!</p>
                )}
              </div>

              {/* Daily Activity Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Daily Activity</h2>
                <div className="space-y-2">
                  {stats.daily_activity.slice(-7).reverse().map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center space-x-2 flex-1 ml-4">
                        <div className="w-full bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${Math.min((day.questions / (Math.max(...stats.daily_activity.map(d => d.questions)) || 1)) * 100, 100)}%`
                            }}
                          >
                            {day.questions > 0 && (
                              <span className="text-white text-xs font-bold">{day.questions}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Session Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_sessions}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.average_session_duration} min</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Topics Covered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.unique_topics}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!stats || stats.total_questions === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Study Data Yet</h3>
            <p className="text-gray-600 mb-6">Start chatting with your documents to see your analytics!</p>
            <button
              onClick={() => router.push('/chat')}
              className="btn-primary"
            >
              Go to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
