import React, { useState, useRef, useEffect } from 'react';

const ChatbotSection = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I’m EduMind’s AI Virtual Professor, your expert guide for tackling complex educational queries. Ask me anything, and I’ll deliver a clear explanation with a step-by-step solution.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const currentInput = userInput;

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: currentInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.explanation,
          solution: data.solution,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);

      // Mock fallback
      const mockResponse = {
        explanation: `Your query: "${currentInput}". Let’s dive into it with a structured approach:`,
        solution: `
**Step 1: Identify the Problem**  
Break down the query into its core components to understand the challenge.

**Step 2: Apply Relevant Knowledge**  
Leverage established principles, formulas, or theories relevant to the topic.

**Step 3: Solve Systematically**  
E.g., for "Calculate the velocity of a 2kg object with 10J of kinetic energy":
- Kinetic Energy formula: KE = ½mv²
- Rearranged: v = √(2KE/m)
- Substitute: v = √(2 × 10 / 2) = √10 ≈ 3.16 m/s

**Step 4: Verify**  
Double-check calculations or logic to ensure accuracy.

**Final Answer**: The velocity is approximately 3.16 m/s.
        `,
      };

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: mockResponse.explanation,
          solution: mockResponse.solution,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (msg) => {
    const textToCopy = msg.solution ? `${msg.text}\n\n${msg.solution}` : msg.text;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert('Explanation copied to clipboard!'))
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy explanation.');
      });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-20 flex items-center justify-center relative overflow-hidden">
      {/* Background Blur Lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 animate-slide-in-down">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Virtual Professor
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mt-6 max-w-3xl mx-auto animate-slide-in-up">
              Unlock answers to the toughest educational challenges with our cutting-edge AI. Input your query and receive in-depth explanations and solutions instantly.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100/50 animate-scale-in">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4 animate-pulse-subtle">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">EduMind AI</h3>
            </div>

            <div
              ref={chatContainerRef}
              className="h-[500px] bg-gray-50/50 rounded-xl p-6 overflow-y-auto space-y-6 border border-gray-100/50 backdrop-blur-sm"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-message`}
                >
                  <div
                    className={`max-w-lg p-5 rounded-2xl relative ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white text-gray-900 border border-gray-100 shadow-sm'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                    {msg.solution && (
                      <div className="mt-4 border-t border-gray-200/50 pt-4">
                        <h4 className="font-semibold text-sm md:text-base text-gray-900">Solution:</h4>
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.solution}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{msg.timestamp}</p>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopyMessage(msg)}
                        className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transform hover:scale-105 transition-all duration-300"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in-message">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce-wave"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce-wave delay-100"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce-wave delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a tough educational question..."
                className="flex-1 px-5 py-3 bg-white/80 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 shadow-sm transition-all duration-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

          <div className="text-center mt-10">
            <a
              href="#get-started"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up"
            >
              Get Started with EduMind
            </a>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-in-down { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes fade-in-message { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.7; } }
        @keyframes pulse-subtle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes bounce-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-slide-in-down { animation: slide-in-down 0.8s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.8s ease-out 0.2s both; }
        .animate-scale-in { animation: scale-in 0.8s ease-out 0.4s both; }
        .animate-fade-in-message { animation: fade-in-message 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
        .animate-bounce-wave { animation: bounce-wave 0.8s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </section>
  );
};

export default ChatbotSection;
