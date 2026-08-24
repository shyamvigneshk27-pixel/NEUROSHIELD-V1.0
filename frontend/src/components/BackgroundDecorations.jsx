import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const BackgroundDecorations = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { scrollY } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
    const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 40,
                y: (e.clientY / window.innerHeight - 0.5) * 40
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Base Deep Background */}
            <div className="absolute inset-0 bg-[#010208]" />

            {/* Grain Overlay */}
            <div className="absolute inset-0 grain-overlay opacity-[0.015]" />

            {/* Technical Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(57, 255, 20, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }}
            />

            {/* Ambient Mesh Gradients */}
            <motion.div
                style={{ x: mousePos.x, y: mousePos.y }}
                className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[120px] animate-glow-pulse"
            />
            <motion.div
                style={{ x: -mousePos.x, y: -mousePos.y }}
                className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-electric-purple/5 rounded-full blur-[120px] animate-glow-pulse"
            />

            {/* Animated EEG Waveform Background - Neon Green Glow */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 overflow-hidden opacity-[0.2] pointer-events-none">
                <svg className="w-[200%] h-full animate-waveform filter drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path
                        d="M0,50 L50,50 L60,20 L70,80 L80,50 L130,50 L140,10 L150,90 L160,50 L210,50 L220,30 L230,70 L240,50 L290,50 L300,5 L310,95 L320,50 L370,50 L380,40 L390,60 L400,50 L450,50 L460,15 L470,85 L480,50 L530,50 L540,35 L550,65 L560,50 L610,50 L620,0 L630,100 L640,50 L690,50 L700,45 L710,55 L720,50 L770,50 L780,10 L790,90 L800,50 L850,50 L860,25 L870,75 L880,50 L930,50 L940,5 L950,95 L960,50 L1000,50"
                        fill="none"
                        stroke="#39FF14"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M0,50 L50,50 L60,20 L70,80 L80,50 L130,50 L140,10 L150,90 L160,50 L210,50 L220,30 L230,70 L240,50 L290,50 L300,5 L310,95 L320,50 L370,50 L380,40 L390,60 L400,50 L450,50 L460,15 L470,85 L480,50 L530,50 L540,35 L550,65 L560,50 L610,50 L620,0 L630,100 L640,50 L690,50 L700,45 L710,55 L720,50 L770,50 L780,10 L790,90 L800,50 L850,50 L860,25 L870,75 L880,50 L930,50 L940,5 L950,95 L960,50 L1000,50"
                        transform="translate(1000, 0)"
                        fill="none"
                        stroke="#39FF14"
                        strokeWidth="1.2"
                    />
                </svg>
            </div>

            {/* Floating Crystalline Shapes */}
            <motion.div
                style={{ translateY: y1, rotate }}
                className="absolute top-1/4 right-[15%] w-32 h-32 border border-neon-green/10 bg-neon-green/[0.02] backdrop-blur-md rounded-3xl animate-drift shadow-[0_0_30px_rgba(57,255,20,0.1)]"
            />
            <motion.div
                style={{ translateY: y2, rotate: -rotate }}
                className="absolute bottom-1/3 left-[12%] w-24 h-24 border border-electric-purple/10 bg-electric-purple/[0.02] backdrop-blur-md rounded-full animate-drift shadow-[0_0_30px_rgba(124,58,237,0.1)]"
                transition={{ delay: 2 }}
            />
        </div>
    );
};

export default BackgroundDecorations;
