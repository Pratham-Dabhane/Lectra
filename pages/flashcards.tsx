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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Flashcards 🎴</h1>
          <p className="text-gray-600 mt-2">Review and master your knowledge with spaced repetition</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => {
              setMode('review');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'review'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Review ({dueFlashcards.length} due)
          </button>
          <button
            onClick={() => {
              setMode('browse');
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'browse'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Browse All ({flashcards.length})
          </button>
        </div>

        {/* Stats Bar */}
        {currentCard && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                {currentCard.difficulty}
              </span>
              <span className="ml-3 text-gray-600 text-sm">
                Topic: <span className="font-medium">{currentCard.topic}</span>
              </span>
            </div>
            <div className="text-gray-600 text-sm">
              Reviewed: {currentCard.times_reviewed} times | 
              Correct: {currentCard.times_correct} ({currentCard.times_reviewed > 0 ? Math.round((currentCard.times_correct / currentCard.times_reviewed) * 100) : 0}%)
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
                className={`absolute w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center transition-opacity ${
                  isFlipped ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Question</p>
                <p className="text-2xl text-gray-900 text-center font-medium">{currentCard.question}</p>
                <p className="text-sm text-gray-400 mt-8">Click to reveal answer</p>
              </div>

              {/* Back (Answer) */}
              <div
                className={`absolute w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center transition-opacity ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <p className="text-sm text-white/80 mb-4 uppercase tracking-wide">Answer</p>
                <p className="text-xl text-white text-center font-medium">{currentCard.answer}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <span className="text-gray-600 font-medium">
                {currentCardIndex + 1} / {currentFlashcards.length}
              </span>

              <button
                onClick={nextCard}
                disabled={currentCardIndex === currentFlashcards.length - 1}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>

            {/* Review Buttons (only in review mode) */}
            {mode === 'review' && isFlipped && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <p className="text-center text-gray-700 mb-4 font-medium">How well did you know this?</p>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleReview(0)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    😞 Forgot
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    🤔 Hard
                  </button>
                  <button
                    onClick={() => handleReview(4)}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    👍 Good
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🎯 Easy
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Your rating affects the next review date using spaced repetition
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {mode === 'review' ? 'No Cards Due' : 'No Flashcards Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {mode === 'review' 
                ? 'Great job! Check back later or browse all cards.'
                : 'Generate flashcards from your chat conversations.'}
            </p>
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
