import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShieldCheck, Zap } from 'lucide-react';

const DashboardView = ({ onStartAnalysis }) => {
    const stats = [
        { label: 'Total Patients', value: '1,284', icon: Users, color: 'text-blue-400' },
        { label: 'Active Monitorings', value: '42', icon: Activity, color: 'text-green-400' },
        { label: 'Predictions Today', value: '156', icon: Zap, color: 'text-yellow-400' },
        { label: 'System Accuracy', value: '94.2%', icon: ShieldCheck, color: 'text-purple-400' },
    ];

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white">System Overview</h3>
                    <p className="text-gray-500 text-sm mt-1">Real-time status of neural processing units and patient data.</p>
                </div>
                <button
                    onClick={onStartAnalysis}
                    className="bg-neon-purple px-6 py-2 rounded-xl text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-all"
                >
                    Quick Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass-panel p-6 flex flex-col relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon className="w-12 h-12" />
                            </div>
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.15em] mb-1">{stat.label}</span>
                            <span className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-6 min-h-[300px]">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Recent Activity</h4>
                    <div className="space-y-4">
                        {[
                            { time: '2 mins ago', msg: 'New EEG analysis completed for Patient PT-005', type: 'info' },
                            { time: '15 mins ago', msg: 'Seizure detected in Channel 4 (Critical Alert)', type: 'alert' },
                            { time: '1 hour ago', msg: 'Database backup synchronized successfully', type: 'success' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm py-2 border-b border-white/5 last:border-0">
                                <span className="text-gray-500 w-24 text-[10px] font-bold uppercase">{log.time}</span>
                                <span className={log.type === 'alert' ? 'text-red-400 font-medium' : 'text-gray-300'}>{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-neon-blue" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">HIPAA Compliant</h4>
                        <p className="text-xs text-gray-500 mt-1 px-4">All data is encrypted and handled according to medical privacy standards.</p>
                    </div>
                    <button className="text-[10px] text-neon-blue font-bold uppercase tracking-widest hover:underline">View Compliance Logs</button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
