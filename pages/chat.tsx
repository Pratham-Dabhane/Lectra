import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: Reference[];
}

interface Reference {
  file_name: string;
  chunk_index: number;
  relevance_score: number;
  excerpt: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication and load history
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        await loadChatHistory(user.id);
      }
    };
    checkUser();
  }, [router]);

  // Load chat history from backend
  const loadChatHistory = async (userId: string) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`http://localhost:8000/api/history/${userId}?limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        const historyMessages: Message[] = [];
        
        // Add welcome message
        historyMessages.push({
          id: '0',
          role: 'assistant',
          content: 'Hello! I\'m your personalized learning assistant. Ask me anything about your uploaded notes and documents.',
          timestamp: new Date(),
        });

        // Convert history to messages
        data.chats.forEach((chat: any) => {
          // User message
          historyMessages.push({
            id: `${chat.id}-q`,
            role: 'user',
            content: chat.question,
            timestamp: new Date(chat.created_at),
          });

          // Assistant message
          historyMessages.push({
            id: `${chat.id}-a`,
            role: 'assistant',
            content: chat.answer,
            timestamp: new Date(chat.created_at),
            references: chat.sources || [],
          });
        });

        setMessages(historyMessages);
        toast.success(`Loaded ${data.total} previous conversations`);
      } else {
        // No history, just show welcome message
        setMessages([{
          id: '0',
          role: 'assistant',
          content: 'Hello! I\'m your personalized learning assistant. Ask me anything about your uploaded notes and documents.',
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      // Show welcome message on error
      setMessages([{
        id: '0',
        role: 'assistant',
        content: 'Hello! I\'m your personalized learning assistant. Ask me anything about your uploaded notes and documents.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Clear chat history
  const handleClearHistory = async () => {
    if (!user) return;
    
    const confirmed = confirm('Are you sure you want to clear all chat history? This cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/api/history/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages([{
          id: '0',
          role: 'assistant',
          content: 'Chat history cleared. How can I help you today?',
          timestamp: new Date(),
        }]);
        toast.success('Chat history cleared successfully');
      } else {
        throw new Error('Failed to clear history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  // Export conversations to PDF
  const handleExportPDF = async () => {
    if (!user || messages.length <= 1) {
      toast.error('No conversations to export');
      return;
    }

    try {
      toast.loading('Generating PDF...', { id: 'export' });

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Lectra - Conversation Export', margin, yPosition);
      yPosition += 10;

      // Export date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Conversations (skip welcome message)
      doc.setFontSize(12);
      const conversationMessages = messages.filter(m => m.id !== '0');
      
      for (let i = 0; i < conversationMessages.length; i++) {
        const message = conversationMessages[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        // Role header
        doc.setFont('helvetica', 'bold');
        const roleLabel = message.role === 'user' ? '🧑 Question:' : '🤖 Answer:';
        doc.text(roleLabel, margin, yPosition);
        yPosition += 7;

        // Content
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(message.content, pageWidth - 2 * margin);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }

        yPosition += 5;

        // References if available
        if (message.references && message.references.length > 0) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('Sources:', margin, yPosition);
          yPosition += 5;
          
          for (const ref of message.references.slice(0, 3)) {
            const refText = `• ${ref.file_name} (Score: ${ref.relevance_score.toFixed(2)})`;
            doc.text(refText, margin + 5, yPosition);
            yPosition += 4;
          }
        }

        yPosition += 8;
        doc.setFontSize(12);
      }

      // Save PDF
      const filename = `lectra_chat_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      toast.success('PDF exported successfully!', { id: 'export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF', { id: 'export' });
    }
  };

  // Generate flashcards from conversations
  const handleGenerateFlashcards = async () => {
    console.log('🎴 Generate Flashcards clicked!');
    console.log('User:', user);
    console.log('Messages count:', messages.length);
    
    if (!user || messages.length <= 1) {
      toast.error('No conversations to generate flashcards from');
      return;
    }

    try {
      // Extract Q&A pairs from messages
      const conversations = [];
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
          conversations.push({
            question: messages[i].content,
            answer: messages[i + 1].content
          });
        }
      }
      
      console.log('Conversations found:', conversations.length);
      console.log('Conversations data:', conversations);

      if (conversations.length === 0) {
        toast.error('No Q&A pairs found in conversation');
        return;
      }

      toast.loading('Generating flashcards with AI...', { id: 'flashcards' });

      const response = await fetch(`http://localhost:8000/api/phase6/flashcards/${user.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversations: conversations.slice(-10), // Last 10 Q&A pairs
          limit: 10
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success(`Generated ${data.total_generated || 0} flashcards! 🎉`, { id: 'flashcards' });
        
        // Redirect to flashcards page
        console.log('Redirecting to /flashcards...');
        setTimeout(() => {
          console.log('Executing redirect now');
          router.push('/flashcards');
        }, 1500);
      } else {
        throw new Error(data.detail || 'Failed to generate flashcards');
      }
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      toast.error(error.message || 'Failed to generate flashcards', { id: 'flashcards' });
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          user_id: user.id,
          top_k: 3,
          max_length: 512,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        references: data.references || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response. Make sure the backend is running.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:8000',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chat Assistant</h1>
            <p className="text-gray-600 mt-1">Ask questions about your uploaded documents</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                console.log('Button clicked - handler will run');
                handleGenerateFlashcards();
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
              title="Generate flashcards from conversations"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Flashcards</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              title="Export conversations to PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>

                  {/* References */}
                  {message.references && message.references.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Sources:</p>
                      {message.references.map((ref, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-900">
                              📄 {ref.file_name}
                            </span>
                            <span className="text-xs text-blue-600">
                              {(ref.relevance_score * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs line-clamp-2">
                            {ref.excerpt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your notes..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>💡 Tip: Upload documents on the <a href="/" className="text-blue-500 hover:underline">home page</a> first to get better answers</p>
        </div>
      </div>
    </div>
  );
}
