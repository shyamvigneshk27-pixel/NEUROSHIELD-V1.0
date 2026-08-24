import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const RiskGauge = ({ score }) => {
    // Score 0-100
    const normalizedScore = Math.min(Math.max(score || 0, 0), 100);
    const rotation = (normalizedScore / 100) * 180 - 90; // -90 to 90 degrees

    const getColor = (s) => {
        if (s < 30) return "text-green-400";
        if (s < 70) return "text-yellow-400";
        return "text-red-400";
    };

    const getStatus = (s) => {
        if (s < 20) return "Stable Neural Activity";
        if (s < 50) return "Subthreshold Variability";
        if (s < 80) return "Heightened Risk Level";
        return "Probable Ictal State";
    }

    return (
        <div className="flex flex-col items-center p-6 h-full w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 self-start px-2 w-full">
                <Activity className="w-4 h-4 text-neon-green animate-pulse" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">AI Risk Assessment</h3>
            </div>

            {/* Gauge Area */}
            <div className="relative w-full max-w-[280px] flex flex-col items-center">
                <div className="relative w-full aspect-[2/1] flex items-center justify-center">
                    <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                        <defs>
                            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#f87171', stopOpacity: 1 }} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background Path */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="rgba(255,255,255,0.05)" strokeWidth="14" fill="none" strokeLinecap="round" />

                        {/* Progress Path */}
                        <motion.path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            stroke="url(#gauge-grad)"
                            strokeWidth="14"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: normalizedScore / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />

                        {/* Pivot Point */}
                        <circle cx="100" cy="100" r="10" fill="#0f0f15" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

                        {/* Needle */}
                        <motion.g
                            initial={{ rotate: -90 }}
                            animate={{ rotate: rotation }}
                            transition={{ type: "spring", stiffness: 40, damping: 12 }}
                            style={{ originX: '100px', originY: '100px' }}
                        >
                            <line x1="100" y1="100" x2="100" y2="35" stroke="white" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                            <circle cx="100" cy="100" r="4" fill="white" />
                        </motion.g>
                    </svg>
                </div>

                {/* Score Value - Now using natural flow below pivot */}
                <motion.div
                    key={normalizedScore}
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="mt-2 flex flex-col items-center"
                >
                    <div className="flex items-center justify-center bg-midnight/60 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-2xl">
                        <span className={`text-6xl font-black ${getColor(normalizedScore)} filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] tracking-tighter`}>
                            {Math.round(normalizedScore)}
                        </span>
                        <span className={`text-2xl font-bold ${getColor(normalizedScore)} opacity-40 ml-1 mt-4`}>%</span>
                    </div>
                </motion.div>
            </div>

            {/* Diagnostic Status Box */}
            <motion.div
                className="mt-8 w-full flex items-center justify-between bg-white/[0.03] backdrop-blur-lg rounded-2xl p-5 border border-white/10 shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            >
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Diagnostic Status</span>
                    <span className={`text-sm font-black ${getColor(normalizedScore)} uppercase tracking-wide`}>{getStatus(normalizedScore)}</span>
                </div>
                <div className={`p-3 rounded-xl shadow-lg ${normalizedScore > 70 ? 'bg-red-500/20 text-red-400' : normalizedScore > 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {normalizedScore > 70 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : normalizedScore > 30 ? <Activity className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </div>
            </motion.div>
        </div>
    );
};

export default RiskGauge;
