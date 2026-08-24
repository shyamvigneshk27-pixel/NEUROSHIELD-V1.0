import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = ({ context }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello, I'm the Neural Assistant. I can help interpret the EEG report or define medical terms." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.text, context: context })
            });

            const data = await response.json();
            const aiMsg = { id: Date.now() + 1, sender: 'ai', text: data.answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "System connection interrupted. Please check neural link." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="flex flex-col h-[400px] group">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-neon-blue/20 rounded-lg shadow-[0_0_10px_rgba(30,144,255,0.2)]">
                        <Sparkles className="w-4 h-4 text-neon-blue" />
                    </div>
                    <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest leading-none">Neuro Assistant</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-bold tracking-tighter uppercase italic">Ready</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.sender === 'ai' ? 'bg-neon-green/20 border border-neon-green/20' : 'bg-neon-blue/20 border border-neon-blue/20'}`}>
                                {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-neon-green" /> : <User className="w-4 h-4 text-neon-blue" />}
                            </div>

                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${msg.sender === 'user'
                                ? 'bg-neon-blue/10 text-white rounded-tr-sm border border-neon-blue/10'
                                : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                                }`}>
                                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-xl bg-neon-green/10 border border-neon-green/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-neon-green/60" />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm border border-white/5">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                        className="w-1.5 h-1.5 bg-neon-green/40 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-white/2 border-t border-white/5 mt-auto">
                <div className="relative group/input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Inquire about neural state..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-5 pr-12 py-3.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-green/40 focus:bg-black/60 focus:shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all"
                    />
                    <motion.button
                        onClick={sendMessage}
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-neon-green hover:text-white transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
