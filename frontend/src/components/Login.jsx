import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import BackgroundDecorations from './BackgroundDecorations';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState('user');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user);
            } else {
                setError(data.detail || "Authentication failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Cannot connect to neural server. Ensure backend is online.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-midnight flex items-center justify-center p-6 overflow-hidden">
            <BackgroundDecorations />


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="inline-flex p-4 bg-neon-green/10 rounded-2xl shadow-[0_0_40px_rgba(57,255,20,0.2)] mb-6 border border-neon-green/20"
                    >
                        <Brain className="w-12 h-12 text-neon-green" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-neon-green tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">NeuroPrior AI</h1>
                    <p className="text-electric-purple font-black uppercase tracking-[0.3em] text-[10px]">Neon Diagnostic Matrix</p>
                </div>

                <div className="glass-panel p-10 relative overflow-hidden border-neon-green/10">
                    <div className="absolute inset-0 grain-overlay opacity-[0.01]" />
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Role Selector */}
                        <div className="flex p-1 bg-white/[0.03] rounded-xl border border-neon-green/10 mb-8 backdrop-blur-md">
                            {['user', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${role === r
                                        ? 'bg-neon-green/10 text-neon-green shadow-[0_0_20px_rgba(57,255,20,0.2)] border border-neon-green/20'
                                        : 'text-slate-500 hover:text-neon-green/60'
                                        }`}
                                >
                                    {r === 'admin' ? <span className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> Admin</span> : <span className="flex items-center justify-center gap-2"><User className="w-4 h-4" /> User</span>}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                                <input
                                    type="text"
                                    placeholder="Neuro-ID"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-neon-green/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all text-neon-green placeholder:text-neon-green/30"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
                                <input
                                    type="password"
                                    placeholder="Encryption-Key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-neon-green/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all text-neon-green placeholder:text-neon-green/30"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black tracking-widest uppercase"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-neon-green/10 text-neon-green border border-neon-green/50 rounded-xl px-6 py-3 font-bold uppercase tracking-widest transition-all duration-300 ease-in-out hover:bg-neon-green/20 scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_40px_rgba(57,255,20,0.4)] w-full"
                        >
                            {isLoading ? "Synchronizing..." : (
                                <span className="flex items-center justify-center gap-3">
                                    Initialize Session
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center relative z-10">
                        <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-600 animate-pulse">Neural Encryption Active</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-8 opacity-30 grayscale blur-[0.5px]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/HIPAA_Logo.svg" alt="HIPAA" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/ISO_9001_Logo.svg" alt="ISO" className="h-6" />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
