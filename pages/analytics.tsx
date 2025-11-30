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
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center fade-in">
            <div className="spinner mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', fontWeight: 600 }}>Analyzing Your Progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', position: 'relative' }}>
      <Navbar />
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Study Analytics 📊</h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 500
          }}>Track your learning progress and optimize study habits</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleTimeframeChange('weekly')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s',
              background: timeframe === 'weekly' ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))' : 'rgba(20, 24, 41, 0.6)',
              color: timeframe === 'weekly' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: timeframe === 'weekly' ? '1px solid var(--neon-blue)' : '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: timeframe === 'weekly' ? 'var(--glow-blue)' : 'none',
              cursor: 'pointer'
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleTimeframeChange('monthly')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s',
              background: timeframe === 'monthly' ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))' : 'rgba(20, 24, 41, 0.6)',
              color: timeframe === 'monthly' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: timeframe === 'monthly' ? '1px solid var(--neon-blue)' : '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: timeframe === 'monthly' ? 'var(--glow-blue)' : 'none',
              cursor: 'pointer'
            }}
          >
            Last 30 Days
          </button>
        </div>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="card" style={{ border: '1px solid rgba(0, 128, 255, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Questions</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>{stats.total_questions}</p>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glow-blue)'
                  }}>
                    <svg className="w-7 h-7" style={{ color: 'var(--bg-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Time</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>{Math.round(stats.total_study_time_minutes / 60)}h</p>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    background: 'linear-gradient(135deg, var(--success), rgba(16, 185, 129, 0.8))',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}>
                    <svg className="w-7 h-7" style={{ color: 'var(--bg-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Streak</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>{stats.study_streak_days} days</p>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    background: 'linear-gradient(135deg, var(--neon-purple), rgba(168, 85, 247, 0.8))',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glow-purple)'
                  }}>
                    <svg className="w-7 h-7" style={{ color: 'var(--bg-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card" style={{ border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents Used</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>{stats.unique_documents}</p>
                  </div>
                  <div style={{ 
                    width: '3.5rem', 
                    height: '3.5rem', 
                    background: 'linear-gradient(135deg, #f97316, rgba(249, 115, 22, 0.8))',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
                  }}>
                    <svg className="w-7 h-7" style={{ color: 'var(--bg-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Topics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card fade-in" style={{ border: '1px solid rgba(0, 255, 255, 0.3)' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem',
                  fontFamily: 'Orbitron, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>📚 Most Studied Topics</h2>
                {stats.most_active_topics.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stats.most_active_topics.slice(0, 8).map((topic, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <span style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: 600,
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '1.05rem'
                        }}>{topic.topic}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '8rem', 
                            background: 'rgba(20, 24, 41, 0.6)', 
                            borderRadius: '9999px', 
                            height: '0.5rem',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))',
                                height: '100%',
                                borderRadius: '9999px',
                                width: `${(topic.count / stats.most_active_topics[0].count) * 100}%`,
                                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                                transition: 'width 0.5s'
                              }}
                            ></div>
                          </div>
                          <span style={{ 
                            color: 'var(--neon-cyan)', 
                            fontSize: '0.9rem', 
                            fontWeight: 800, 
                            width: '2rem', 
                            textAlign: 'right',
                            fontFamily: 'Orbitron, sans-serif'
                          }}>{topic.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>No topics tracked yet. Start asking questions!</p>
                )}
              </div>

              {/* Daily Activity Chart */}
              <div className="card fade-in" style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem',
                  fontFamily: 'Orbitron, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-blue))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>📈 Daily Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.daily_activity.slice(-7).reverse().map((day, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        minWidth: '4rem',
                        fontFamily: 'Rajdhani, sans-serif'
                      }}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ 
                          width: '100%', 
                          background: 'rgba(20, 24, 41, 0.6)', 
                          borderRadius: '0.375rem', 
                          height: '1.75rem',
                          overflow: 'hidden',
                          border: '1px solid rgba(168, 85, 247, 0.2)'
                        }}>
                          <div
                            style={{
                              background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-blue))',
                              height: '100%',
                              borderRadius: '0.375rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: '0.5rem',
                              width: `${Math.min((day.questions / (Math.max(...stats.daily_activity.map(d => d.questions)) || 1)) * 100, 100)}%`,
                              boxShadow: day.questions > 0 ? 'var(--glow-purple)' : 'none',
                              transition: 'width 0.5s'
                            }}
                          >
                            {day.questions > 0 && (
                              <span style={{ 
                                color: 'white', 
                                fontSize: '0.75rem', 
                                fontWeight: 900,
                                fontFamily: 'Orbitron, sans-serif'
                              }}>{day.questions}</span>
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
            <div className="card fade-in" style={{ border: '1px solid rgba(0, 128, 255, 0.3)' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)', 
                marginBottom: '1.5rem',
                fontFamily: 'Orbitron, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>📊 Session Statistics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sessions</p>
                  <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-cyan)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif', textShadow: 'var(--glow-cyan)' }}>{stats.total_sessions}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Session Duration</p>
                  <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-blue)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif', textShadow: 'var(--glow-blue)' }}>{stats.average_session_duration} <span style={{ fontSize: '1.25rem' }}>min</span></p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topics Covered</p>
                  <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--neon-purple)', marginTop: '0.5rem', fontFamily: 'Orbitron, sans-serif', textShadow: 'var(--glow-purple)' }}>{stats.unique_topics}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!stats || stats.total_questions === 0 && (
          <div className="card fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
            <svg style={{ width: '6rem', height: '6rem', color: 'var(--neon-cyan)', margin: '0 auto 1.5rem auto', opacity: 0.5 }} className="pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>No Study Data Yet</h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '2rem',
              fontSize: '1.05rem',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 500
            }}>Start chatting with your documents to see your analytics!</p>
            <button
              onClick={() => router.push('/chat')}
              className="btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}
            >
              <svg className="w-5 h-5 mr-2" style={{ display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Go to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
