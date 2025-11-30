import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  times_reviewed: number;
  times_correct: number;
  next_review_at: string;
  created_at: string;
}

export default function Flashcards() {
  const [user, setUser] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'review' | 'browse'>('review');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        await loadFlashcards(user.id);
      }
    };
    checkUser();
  }, [router]);

  const loadFlashcards = async (userId: string) => {
    try {
      setIsLoading(true);

      // Load due flashcards
      const dueResponse = await fetch(`http://localhost:8000/api/phase6/flashcards/${userId}/due`);
      if (dueResponse.ok) {
        const dueData = await dueResponse.json();
        setDueFlashcards(dueData.flashcards);
      }

      // Load all flashcards
      const allResponse = await fetch(`http://localhost:8000/api/phase6/flashcards/${userId}`);
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setFlashcards(allData.flashcards);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const currentFlashcards = mode === 'review' ? dueFlashcards : flashcards;
  const currentCard = currentFlashcards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (quality: number) => {
    if (!user || !currentCard || mode !== 'review') return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/phase6/flashcards/${user.id}/${currentCard.id}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quality })
        }
      );

      if (response.ok) {
        // Move to next card
        if (currentCardIndex < dueFlashcards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
          setIsFlipped(false);
        } else {
          toast.success('🎉 All cards reviewed!');
          setMode('browse');
          setCurrentCardIndex(0);
        }
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      toast.error('Failed to record review');
    }
  };

  const nextCard = () => {
    if (currentCardIndex < currentFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center fade-in">
            <div className="spinner mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', fontWeight: 600 }}>Loading Flashcards...</p>
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
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Flashcards 🎴</h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 500
          }}>Master your knowledge with AI-powered spaced repetition</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setMode('review');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s',
              background: mode === 'review' ? 'linear-gradient(135deg, var(--neon-purple), rgba(168, 85, 247, 0.8))' : 'rgba(20, 24, 41, 0.6)',
              color: mode === 'review' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: mode === 'review' ? '1px solid var(--neon-purple)' : '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: mode === 'review' ? 'var(--glow-purple)' : 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'review') {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.background = 'rgba(20, 24, 41, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'review') {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.background = 'rgba(20, 24, 41, 0.6)';
              }
            }}
          >
            Review ({dueFlashcards.length} due)
          </button>
          <button
            onClick={() => {
              setMode('browse');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s',
              background: mode === 'browse' ? 'linear-gradient(135deg, var(--neon-purple), rgba(168, 85, 247, 0.8))' : 'rgba(20, 24, 41, 0.6)',
              color: mode === 'browse' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: mode === 'browse' ? '1px solid var(--neon-purple)' : '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: mode === 'browse' ? 'var(--glow-purple)' : 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'browse') {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.background = 'rgba(20, 24, 41, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'browse') {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.background = 'rgba(20, 24, 41, 0.6)';
              }
            }}
          >
            Browse All ({flashcards.length})
          </button>
        </div>

        {/* Stats Bar */}
        {currentCard && (
          <div className="card" style={{ 
            padding: '1rem 1.5rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            border: '1px solid rgba(0, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                fontFamily: 'Orbitron, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: currentCard.difficulty === 'easy' 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : currentCard.difficulty === 'medium' 
                  ? 'rgba(249, 115, 22, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
                color: currentCard.difficulty === 'easy'
                  ? 'var(--success)'
                  : currentCard.difficulty === 'medium'
                  ? '#f97316'
                  : 'var(--error)',
                border: currentCard.difficulty === 'easy'
                  ? '1px solid var(--success)'
                  : currentCard.difficulty === 'medium'
                  ? '1px solid #f97316'
                  : '1px solid var(--error)'
              }}>
                {currentCard.difficulty}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500 }}>
                Topic: <span style={{ fontWeight: 700, color: 'var(--neon-cyan)' }}>{currentCard.topic}</span>
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500 }}>
              Reviewed: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentCard.times_reviewed}</span> times | 
              Correct: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{currentCard.times_correct}</span> ({currentCard.times_reviewed > 0 ? Math.round((currentCard.times_correct / currentCard.times_reviewed) * 100) : 0}%)
            </div>
          </div>
        )}

        {/* Flashcard Display */}
        {currentCard ? (
          <div className="mb-8">
            <div
              className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-gpu ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{ perspective: '1000px' }}
              onClick={handleFlip}
            >
              {/* Front (Question) */}
              <div
                className="glassmorphism"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 'var(--radius-xl)',
                  border: '2px solid var(--neon-cyan)',
                  boxShadow: 'var(--glow-cyan)',
                  padding: '3rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s',
                  opacity: isFlipped ? 0 : 1
                }}
              >
                <p style={{ fontSize: '0.875rem', color: 'var(--neon-cyan)', marginBottom: '1.5rem', textTransform: 'uppercase', fontFamily: 'Orbitron, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>Question</p>
                <p style={{ fontSize: '1.75rem', color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, lineHeight: 1.4 }}>{currentCard.question}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2rem', fontFamily: 'Rajdhani, sans-serif' }}>Click to reveal answer</p>
              </div>

              {/* Back (Answer) */}
              <div
                className="glassmorphism"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 'var(--radius-xl)',
                  border: '2px solid var(--neon-purple)',
                  boxShadow: 'var(--glow-purple)',
                  padding: '3rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s',
                  opacity: isFlipped ? 1 : 0,
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 128, 255, 0.2))'
                }}
              >
                <p style={{ fontSize: '0.875rem', color: 'var(--neon-purple)', marginBottom: '1.5rem', textTransform: 'uppercase', fontFamily: 'Orbitron, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>Answer</p>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, lineHeight: 1.5 }}>{currentCard.answer}</p>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentCardIndex === 0 ? 'rgba(20, 24, 41, 0.4)' : 'rgba(20, 24, 41, 0.8)',
                  color: currentCardIndex === 0 ? 'var(--text-muted)' : 'var(--neon-cyan)',
                  border: currentCardIndex === 0 ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid rgba(0, 255, 255, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentCardIndex === 0 ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (currentCardIndex !== 0) {
                    e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCardIndex !== 0) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                ← Previous
              </button>

              <span style={{ 
                color: 'var(--text-primary)', 
                fontWeight: 700,
                fontSize: '1.1rem',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                {currentCardIndex + 1} <span style={{ color: 'var(--text-secondary)' }}>/</span> {currentFlashcards.length}
              </span>

              <button
                onClick={nextCard}
                disabled={currentCardIndex === currentFlashcards.length - 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentCardIndex === currentFlashcards.length - 1 ? 'rgba(20, 24, 41, 0.4)' : 'rgba(20, 24, 41, 0.8)',
                  color: currentCardIndex === currentFlashcards.length - 1 ? 'var(--text-muted)' : 'var(--neon-cyan)',
                  border: currentCardIndex === currentFlashcards.length - 1 ? '1px solid rgba(100, 116, 139, 0.2)' : '1px solid rgba(0, 255, 255, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: currentCardIndex === currentFlashcards.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentCardIndex === currentFlashcards.length - 1 ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (currentCardIndex !== currentFlashcards.length - 1) {
                    e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCardIndex !== currentFlashcards.length - 1) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                Next →
              </button>
            </div>

            {/* Review Buttons (only in review mode) */}
            {mode === 'review' && isFlipped && (
              <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
                <p style={{ 
                  textAlign: 'center', 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem', 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  fontFamily: 'Orbitron, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Rate Your Knowledge</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleReview(0)}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, var(--error), rgba(239, 68, 68, 0.8))',
                      color: 'white',
                      border: '1px solid var(--error)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    😞 Forgot
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #f97316, rgba(249, 115, 22, 0.8))',
                      color: 'white',
                      border: '1px solid #f97316',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(249, 115, 22, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(249, 115, 22, 0.3)';
                    }}
                  >
                    🤔 Hard
                  </button>
                  <button
                    onClick={() => handleReview(4)}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                      color: 'var(--bg-primary)',
                      border: '1px solid var(--neon-blue)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: 'var(--glow-blue)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 128, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--glow-blue)';
                    }}
                  >
                    👍 Good
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, var(--success), rgba(16, 185, 129, 0.8))',
                      color: 'white',
                      border: '1px solid var(--success)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    🎯 Easy
                  </button>
                </div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-muted)', 
                  textAlign: 'center', 
                  marginTop: '1rem',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 500
                }}>
                  Your rating determines next review using SM-2 spaced repetition
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="card fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
            <svg style={{ width: '6rem', height: '6rem', color: 'var(--neon-cyan)', margin: '0 auto 1.5rem auto', opacity: 0.5 }} className="pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {mode === 'review' ? 'No Cards Due' : 'Data Archive Empty'}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '2rem',
              fontSize: '1.05rem',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 500
            }}>
              {mode === 'review' 
                ? 'All cards reviewed! Check back later or browse the archive.'
                : 'Generate AI-powered flashcards from your conversations.'}
            </p>
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
