import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Zap } from 'lucide-react';

const SpectrogramView = ({ imageUrl, rawData }) => {
    // Basic pseudo-spectrogram generation for CSV data
    const generatedSpectrum = useMemo(() => {
        if (!rawData || rawData.length === 0) return null;

        // Split data into "time" windows (simulated)
        const windows = 8;
        const ptsPerWindow = Math.floor(rawData.length / windows);
        const spectrum = [];

        for (let i = 0; i < windows; i++) {
            const windowData = rawData.slice(i * ptsPerWindow, (i + 1) * ptsPerWindow);
            // Simulate frequency intensity (high variance -> high intensity in higher bands)
            const intensity = Math.abs(windowData.reduce((a, b) => a + b, 0)) / ptsPerWindow;
            spectrum.push({
                time: i,
                intensity: intensity,
                bars: Array.from({ length: 12 }, (_, j) => ({
                    id: j,
                    level: Math.random() * 100 * (1 + (intensity / 100))
                }))
            });
        }
        return spectrum;
    }, [rawData]);

    return (
        <motion.div
            className="glass-panel p-6 h-full flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-neon-purple" />
                    Neural Spectral Density
                </h3>
            </div>

            <div className="flex-1 w-full bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/5 relative">
                {imageUrl ? (
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={imageUrl}
                        alt="Spectrogram"
                        className="w-full h-full object-cover"
                    />
                ) : generatedSpectrum ? (
                    <div className="flex w-full h-full gap-1 p-4">
                        {generatedSpectrum.map((win, idx) => (
                            <div key={idx} className="flex-1 flex flex-col gap-1">
                                {win.bars.map(bar => (
                                    <div
                                        key={bar.id}
                                        className="flex-1 transition-colors duration-500"
                                        style={{
                                            backgroundColor: `rgba(${139 + bar.level}, 92, ${246 - bar.level}, ${0.1 + (bar.level / 200)})`,
                                            boxShadow: bar.level > 80 ? `0 0 10px rgba(139, 92, 246, 0.3)` : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-xs uppercase tracking-widest font-bold">No Signal Data to Compute Spectrum</p>
                    </div>
                )}

                {/* Overlay Grid Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            </div>
        </motion.div>
    );
};

export default SpectrogramView;
