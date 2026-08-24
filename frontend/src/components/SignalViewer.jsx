import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const SignalViewer = ({ data, mode }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data && data.length > 0) {
            // Format data for Recharts
            const formatted = data.map((val, idx) => ({ time: idx, value: val }));
            setChartData(formatted);
        }
    }, [data]);

    return (
        <motion.div
            className="glass-panel p-6 h-full flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-blue" />
                    {mode === 'spectrogram' ? 'Energy Envelope Signal (Derived)' : 'EEG Signal Analysis'}
                </h3>
                <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                    {data ? "Static View (1s)" : "Waiting for input..."}
                </span>
            </div>

            <div className="flex-1 min-h-[250px] w-full bg-black/20 rounded-lg overflow-hidden relative">
                {!data ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <p>Upload a CSV to view signal</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #333' }}
                                itemStyle={{ color: '#8b5cf6' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                dot={false}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};

export default SignalViewer;
