import React from 'react';
<<<<<<< HEAD
import { Activity, Brain, FileText, Settings, Menu, LogOut, Shield, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundDecorations from './BackgroundDecorations';

const DashboardLayout = ({ children, activeTab, onTabChange, user, onLogout }) => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

=======
import { Activity, Brain, FileText, Settings, Menu, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundDecorations from './BackgroundDecorations';

const DashboardLayout = ({ children, activeTab, onTabChange, user, onLogout }) => {
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
    // Filtered tabs based on role
    const menuItems = user?.role === 'admin'
        ? [
            { id: 'Patient Records', icon: Brain },
            { id: 'Analysis', icon: FileText },
<<<<<<< HEAD
            { id: 'Report Summary', icon: Activity },
            { id: 'Model Metrics', icon: BarChart2 },
=======
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
            { id: 'System Admin', icon: Shield },
            { id: 'Settings', icon: Settings }
        ]
        : [
            { id: 'Analysis', icon: FileText },
<<<<<<< HEAD
            { id: 'Report Summary', icon: Activity },
            { id: 'Model Metrics', icon: BarChart2 },
=======
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
            { id: 'Settings', icon: Settings }
        ];

    return (
        <div className="flex h-screen bg-deep-midnight overflow-hidden text-gray-100 font-sans cursor-default">
            <BackgroundDecorations />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-20 lg:w-64 bg-white/[0.01] backdrop-blur-xl border-r border-white/5 flex flex-col items-center lg:items-start py-8 z-40 transition-all duration-500"
            >
                <div className="mb-12 px-6 flex items-center gap-3">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-2 bg-neon-green/10 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                    >
                        <Brain className="w-8 h-8 text-neon-green" />
                    </motion.div>
                    <span className="hidden lg:block text-2xl font-bold bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                        NEUROSHIELD
                    </span>
                </div>

                <nav className="w-full space-y-2 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === activeTab;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-neon-green/10 text-neon-green shadow-[0_0_20px_rgba(57,255,20,0.1)] border border-neon-green/20'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="hidden lg:block font-medium">{item.id}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 w-1 h-6 bg-neon-green rounded-r-full shadow-[0_0_10px_rgba(57,255,20,1)]"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                <div className="mt-auto w-full px-3 pb-4">
                    <motion.button
                        onClick={onLogout}
                        whileHover={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#ef4444" }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-gray-400 transition-all duration-300 group"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="hidden lg:block font-medium">Log Out</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden z-10">
                {/* Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/5 backdrop-blur-xl z-20"
                >
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-neon-green tracking-tighter drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">NeuroShield AI</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neon-green/80 uppercase tracking-[0.2em] font-bold">Neural Engine v2.0</span>
                            <span className="w-1 h-1 bg-neon-green/30 rounded-full" />
                            <span className="text-[10px] text-electric-purple uppercase tracking-[0.2em] font-bold">{user?.role} Access</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-neon-green">{user?.name}</span>
                            <span className="text-[10px] text-electric-purple/80 uppercase tracking-widest font-bold">{user?.role}</span>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05, ring: 4 }}
                            className="w-11 h-11 rounded-full bg-gradient-to-tr from-neon-green to-neon-blue p-[2px] cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                        >
                            <div className="w-full h-full rounded-full bg-black/80 p-1">
                                <div className="w-full h-full rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green font-bold text-xs">
                                    {user?.name?.[0]}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.header>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex-1 overflow-y-auto p-8 z-10 scrollbar-thin"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardLayout;
