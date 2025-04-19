import React, { useState, useRef, useEffect } from 'react';

const ChatbotSection = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome to EduMind’s AI Virtual Professor! I’m here to tackle your toughest educational queries with clear explanations and step-by-step solutions. Ask me anything via text, voice, document, or image!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [messages]);

  const handleSendMessage = async (input = userInput, file = null) => {
    if (!input.trim() && !file) return;

    const newMessage = {
      sender: 'user',
      text: input || (file ? `Uploaded ${file.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (input) formData.append('message', input);
      if (file) formData.append('file', file);

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData,
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

      const mockResponse = {
        explanation: input ? `Your query: "${input}". Let’s dive in:` : `Analyzing uploaded file: "${file?.name}".`,
        solution: `
**Step 1: Identify the Problem**  
Break down the input into core components to understand the challenge.

**Step 2: Apply Relevant Knowledge**  
Leverage principles, formulas, or theories relevant to the topic.

**Step 3: Solve Systematically**  
E.g., for "Calculate velocity of a 2kg object with 10J kinetic energy":
- Formula: KE = ½mv²
- Rearranged: v = √(2KE/m)
- Substitute: v = √(2 × 10 / 2) = √10 ≈ 3.16 m/s

**Step 4: Verify**  
Ensure accuracy of calculations or logic.

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

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.includes('pdf') || file.type.includes('image'))) {
      setSelectedFile(file);
      handleSendMessage('', file);
    } else {
      alert('Please upload a PDF or image file.');
    }
    e.target.value = null;
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
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-20 flex items-center justify-center relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl mt-10font-extrabold text-blue-900 animate-slide-in-down">
              <span className="text-transparent  bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                AI Virtual Professor
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-600 mt-6 max-w-3xl mx-auto animate-slide-in-up">
              Engage with complex educational challenges using text, voice, documents, or images. Get instant, in-depth explanations and solutions from our advanced AI.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,50,100,0.15)] p-8 border border-blue-200/50 animate-scale-in">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mr-4 animate-pulse-subtle">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-blue-900">EduMind AI</h3>
            </div>

            <div
              ref={chatContainerRef}
              className="h-[500px] bg-white/50 rounded-xl p-6 overflow-y-auto space-y-6 border border-blue-200/50 backdrop-blur-sm"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-message`}
                >
                  <div
                    className={`max-w-lg p-5 rounded-2xl relative ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white text-blue-900 border border-blue-100 shadow-sm'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                    {msg.solution && (
                      <div className="mt-4 border-t border-blue-200/50 pt-4">
                        <h4 className="font-semibold text-sm md:text-base text-blue-900">Solution:</h4>
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.solution}</p>
                      </div>
                    )}
                    <p className="text-xs text-blue-400 mt-2">{msg.timestamp}</p>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopyMessage(msg)}
                        className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transform hover:scale-105 transition-all duration-300"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in-message">
                  <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce-wave"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce-wave delay-100"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce-wave delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 items-center">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question or upload a file..."
                className="flex-1 px-5 py-3 bg-white/80 border border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 shadow-inner transition-all duration-300"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                    isRecording ? 'animate-pulse' : ''
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isLoading}
                  className={`p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  className="hidden"
                />
                <button
                  type="submit"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                  className={`p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="#get-started"
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up"
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
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes pulse-subtle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes bounce-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-slide-in-down { animation: slide-in-down 0.8s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.8s ease-out 0.2s both; }
        .animate-scale-in { animation: scale-in 0.8s ease-out 0.4s both; }
        .animate-fade-in-message { animation: fade-in-message 0.5s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
        .animate-bounce-wave { animation: bounce-wave 0.8s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </section>
  );
};

export default ChatbotSection;