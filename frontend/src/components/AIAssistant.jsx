import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, Send, X, Volume2, Loader2, Sparkles, CloudRain, IndianRupee, ThermometerSun, Stethoscope, Wheat, Sprout, Droplets, Leaf } from 'lucide-react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from 'react-router-dom';

const SUGGESTIONS = {
  te: [
    "ఈరోజు వాతావరణం",
    "వరి ధర",
    "వ్యాధి సహాయం",
    "దిగుబడి అంచనా",
    "ఎరువు",
    "నీటి సలహా"
  ],
  en: [
    "Weather Today",
    "Rice Price",
    "Disease Help",
    "Yield Estimate",
    "Fertilizer",
    "Water Advice"
  ]
};

const AIAssistant = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isTe = language === 'te';

  const [isOpen, setIsOpen] = useState(false);
  // Initial message is reset when opening chat or changing language if chat is empty
  const getInitialMessage = () => ({
    id: 1, 
    type: 'ai', 
    text: isTe ? 'నమస్కారం! నేను మీ అగ్రోవిజన్ AI సహాయకుడిని. దయచేసి వ్యవసాయం గురించి అడగండి.' : 'Hello! I am your AgroVision AI assistant. Please ask your farming question.' 
  });
  
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isFirstRender = useRef(true);

  // Append a welcome message when language changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'ai',
      text: isTe ? 'భాష తెలుగుకి మార్చబడింది. మీ ప్రశ్నను అడగండి.' : 'Language switched to English. Please ask your question.'
    }]);
  }, [language, isTe]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = isTe ? 'te-IN' : 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = isTe ? 'te-IN' : 'en-IN';
    }
  }, [language, isTe]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Play High-Quality Backend Audio
  const playNeuralAudio = (audioBase64) => {
    if (!audioBase64) return;
    try {
      const audio = new Audio(audioBase64);
      audio.play().catch(e => console.error("Audio playback blocked by browser:", e));
    } catch (e) {
      console.error("Audio creation failed", e);
    }
  };

  // Fallback for local system messages
  const speakTextFallback = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isTe ? 'te-IN' : 'en-IN';
      utterance.rate = isTe ? 0.85 : 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend = inputValue) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text: trimmedText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/assistant/chat', { 
        message: trimmedText,
        language: language,
        page_context: location.pathname
      });
      const replyText = response.data.reply;
      const replyCard = response.data.card;
      const audioData = response.data.audio_data;
      
      const aiMsg = { id: Date.now() + 1, type: 'ai', text: replyText, card: replyCard, audioData: audioData };
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto play high-quality neural audio
      if (audioData) {
        playNeuralAudio(audioData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsgText = isTe ? 'క్షమించండి, నెట్‌వర్క్ లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Sorry, a network error occurred. Please try again.';
      const errorMsg = { id: Date.now() + 1, type: 'ai', text: errorMsgText };
      setMessages(prev => [...prev, errorMsg]);
      speakTextFallback(errorMsgText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 md:w-[72px] md:h-[72px] bg-green-600/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] z-50 group hover:scale-105 transition-transform border border-green-400/30"
        onClick={() => setIsOpen(true)}
        animate={{
          boxShadow: [
            "0 0 20px rgba(34,197,94,0.5)",
            "0 0 35px rgba(34,197,94,0.8)",
            "0 0 20px rgba(34,197,94,0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Leaf size={32} className="text-white drop-shadow-md relative z-10" />
        <span className="absolute -top-1 -right-1 bg-yellow-400 p-1.5 rounded-full text-black shadow-lg">
          <Sparkles size={14} />
        </span>
        {/* Online dot */}
        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-green-800 rounded-full"></span>
        
        {/* Tooltip */}
        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-sm py-1.5 px-4 rounded-xl whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          {isTe ? 'వ్యవసాయ సహాయకుడు' : 'Farmer AI Assistant'}
        </div>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 md:right-24 md:bottom-24 w-[90vw] md:w-[400px] max-w-[400px] h-[600px] max-h-[80vh] z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl bg-[#0a1910]/90 border border-green-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0d2116] to-[#152e1f] border-b border-green-500/20 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-xl relative shadow-lg">
                  <Bot size={24} />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-[#152e1f] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight text-green-50">{isTe ? '🌾 అగ్రోవిజన్ AI సహాయకుడు' : '🌾 AgroVision AI Assistant'}</h3>
                  <p className="text-[11px] text-green-300/80 mt-0.5">{isTe ? 'ప్రత్యక్ష వ్యవసాయ సమాచారం ఆధారంగా సహాయం' : 'Smart farming help powered by live data'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-green-100" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm shadow-md' 
                        : 'bg-[#152e1f]/80 text-green-50 border border-green-500/20 rounded-tl-sm backdrop-blur-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line text-[15px] leading-relaxed">{msg.text}</p>
                    
                    {/* Render Live Mini Cards */}
                    {msg.card && (
                      <div className="mt-3 bg-black/30 rounded-xl p-3 border border-white/5">
                        {msg.card.type === 'weather' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><CloudRain size={18} className="text-blue-400"/> <span className="font-semibold text-sm">{msg.card.temp}</span></div>
                            <div className="text-xs text-blue-200">{msg.card.today} ➔ {msg.card.tomorrow}</div>
                            <div className="text-xs font-mono bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">{msg.card.rain} Rain</div>
                          </div>
                        )}
                        {msg.card.type === 'market' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><IndianRupee size={18} className="text-yellow-400"/> <span className="font-semibold text-sm">{msg.card.crop}</span></div>
                            <div className="text-sm font-bold text-yellow-100">{msg.card.price}</div>
                            <div className="text-xs font-mono bg-green-500/20 px-2 py-0.5 rounded text-green-400">{msg.card.trend}</div>
                          </div>
                        )}
                        {msg.card.type === 'disease' && (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2"><Stethoscope size={18} className="text-red-400"/> <span className="font-semibold text-sm truncate">{msg.card.disease}</span></div>
                            <div className="text-xs text-red-200">{msg.card.confidence}</div>
                            <div className="text-xs font-mono bg-red-500/20 px-2 py-0.5 rounded text-red-300">{msg.card.urgency}</div>
                          </div>
                        )}
                        {msg.card.type === 'yield' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><Wheat size={18} className="text-green-400"/> <span className="font-semibold text-sm">{msg.card.crop}</span></div>
                            <div className="text-sm font-bold text-green-100">{msg.card.yield}</div>
                            <div className="text-xs font-mono bg-green-500/20 px-2 py-0.5 rounded text-green-300">{msg.card.profit}</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.type === 'ai' && (
                      <button 
                        onClick={() => msg.audioData ? playNeuralAudio(msg.audioData) : speakTextFallback(msg.text)}
                        className="mt-3 text-xs flex items-center gap-1.5 text-green-400 hover:text-green-200 transition-colors"
                      >
                        <Volume2 size={14} /> {isTe ? 'మళ్లీ వినండి' : 'Listen again'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#152e1f] text-green-50 p-4 rounded-2xl rounded-tl-sm border border-green-500/20">
                    <Loader2 size={20} className="animate-spin text-green-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0d2116] border-t border-green-500/20 shrink-0">
              {/* Suggestion Chips */}
              <div className="flex overflow-x-auto gap-2 mb-3 pb-2 custom-scrollbar-hide">
                {SUGGESTIONS[language].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="whitespace-nowrap px-3 py-1.5 bg-[#1a3826] text-green-200 text-xs rounded-full border border-green-500/30 hover:bg-green-700 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2 relative">
                <div className="flex-1 bg-[#152e1f] rounded-2xl border border-green-500/30 overflow-hidden flex items-center pr-2 focus-within:border-green-400 transition-colors">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isTe ? 'ప్రశ్న టైప్ చేయండి...' : 'Type your question...'}
                    className="flex-1 bg-transparent text-white p-3 outline-none placeholder:text-gray-400 text-sm"
                  />
                  
                  <button
                    onClick={toggleListen}
                    className={`p-2 rounded-full transition-colors ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 text-white p-3 rounded-full transition-colors shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default AIAssistant;
