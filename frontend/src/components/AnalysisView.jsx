import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadSection from './UploadSection';
import SignalViewer from './SignalViewer';
import SpectrogramView from './SpectrogramView';
import RiskGauge from './RiskGauge';
import ChatWidget from './ChatWidget';
import { LayoutDashboard, Activity, BarChart3, ShieldAlert, BadgeInfo } from 'lucide-react';

const AnalysisView = ({
    signalData,
    spectrogram,
    riskScore,
    analysisResult,
    loading,
    handleCsvUpload,
    handleImageUpload
}) => {
    const [subTab, setSubTab] = useState('Overview');

    const subTabs = [
        { id: 'Overview', icon: LayoutDashboard },
        { id: 'Signal Graphs', icon: Activity },
        { id: 'Frequency Analysis', icon: BarChart3 },
        { id: 'AI Risk Score', icon: ShieldAlert },
        { id: 'AI Assistant', icon: BadgeInfo }
    ];

    const renderSubTabContent = () => {
        switch (subTab) {
            case 'Overview':
                return (
                    <div className="space-y-8">
                        <div className="glass-panel p-8 border-neon-green/10">
                            <h3 className="text-xl font-black text-neon-green mb-6 flex items-center gap-3 tracking-tighter uppercase">
                                <span className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]">1</span>
                                Neural Signal Input
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadSection onUpload={handleCsvUpload} type="csv" label="EEG Signal (CSV)" />
                                <UploadSection onUpload={handleImageUpload} type="image" label="Spectrogram (IMG)" />
                            </div>
                        </div>

                        {analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-neon-green/60 uppercase tracking-[0.2em]">Raw Neural Matrix</h4>
                                    <span className="text-[10px] bg-neon-green/10 text-neon-green px-2 py-1 rounded border border-neon-green/20 uppercase font-black tracking-widest">Authorized Data</span>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4 border border-neon-green/10 max-h-64 overflow-y-auto backdrop-blur-md">
                                    <pre className="text-xs text-neon-green/80 font-mono scrollbar-hide">
                                        {JSON.stringify(analysisResult, null, 2)}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </div>
                );
            case 'Signal Graphs':
                return (
                    <div className="space-y-8 h-full">
                        <div className="h-[350px]">
<<<<<<< HEAD
                            <SignalViewer data={signalData} loading={loading} mode={analysisResult?.mode} />
=======
                            <SignalViewer data={signalData} loading={loading} />
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
                        </div>
                        <div className="h-[350px]">
                            <SpectrogramView imageUrl={spectrogram} rawData={signalData} />
                        </div>
                    </div>
                );
            case 'Frequency Analysis':
                const bandRanges = {
                    delta: "0.5 - 4 Hz",
                    theta: "4 - 8 Hz",
                    alpha: "8 - 13 Hz",
                    beta: "13 - 30 Hz",
                    gamma: "30+ Hz"
                };

                return (
                    <div className="glass-panel p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-xl font-black text-neon-green mb-1 tracking-tighter uppercase">Oscillation Band Map</h4>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">Spectral power distribution across neural oscillation bands.</p>
                            </div>
                            {analysisResult?.bands && (
                                <div className="text-right">
                                    <span className="text-[10px] text-electric-purple uppercase font-black tracking-widest block mb-1">Peak Frequency</span>
                                    <span className="text-2xl font-black text-neon-green uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                                        {Object.entries(analysisResult.bands).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {analysisResult?.bands ? (
                            <div className="flex items-end justify-between gap-6 h-64 mt-16 px-4">
                                {Object.entries(analysisResult.bands).map(([band, value]) => {
                                    const percentage = typeof value === 'number' ? value : 0;
                                    return (
                                        <div key={band} className="flex-1 flex flex-col items-center group h-full relative">
                                            {/* Fixed-height percentage label area */}
                                            <div className="absolute -top-12 left-0 right-0 flex flex-col items-center">
                                                <div className="text-[11px] font-black text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 shadow-lg mb-1">
                                                    {percentage.toFixed(1)}%
                                                </div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {bandRanges[band]}
                                                </div>
                                            </div>

                                            <div className="w-full flex flex-col justify-end h-full">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(8, Math.min(100, percentage))}%` }}
                                                    className={`w-full rounded-t-xl transition-all shadow-lg relative overflow-hidden ${band === 'delta' ? 'bg-gradient-to-t from-green-600 to-green-400' :
                                                        band === 'theta' ? 'bg-gradient-to-t from-blue-600 to-blue-400' :
                                                            band === 'alpha' ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' :
                                                                band === 'beta' ? 'bg-gradient-to-t from-orange-600 to-orange-400' :
                                                                    'bg-gradient-to-t from-red-600 to-red-400'
                                                        }`}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>
                                            </div>

                                            <div className="mt-4 flex flex-col items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{band}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neon-green/10 rounded-2xl bg-black/20 backdrop-blur-sm">
                                <Activity className="w-12 h-12 text-neon-green/20 mb-4 animate-pulse" />
                                <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Awaiting Neural Spectral Data</span>
                                <p className="text-[10px] text-gray-600 mt-2 text-center max-w-xs px-4 leading-relaxed">Spectral bands and statistics are calculated from telemetry. For spectrogram images, these are derived from visual pattern estimation.</p>
                            </div>
                        )}

                        <div className="mt-16 pt-8 border-t border-white/5">
                            <h5 className="text-[10px] font-black text-neon-green/60 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Activity className="w-3 h-3" />
<<<<<<< HEAD
                                {analysisResult?.mode === 'spectrogram' ? 'Computed Spectral Features (JSON Derived)' : 'Computed Signal Parameters (JSON Derived)'}
=======
                                Computed Signal Parameters (JSON Derived)
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {analysisResult?.stats && Object.entries(analysisResult.stats).map(([stat, val]) => (
                                    <div key={stat} className="bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm group hover:border-neon-green/30 transition-colors">
                                        <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block mb-1 group-hover:text-neon-green/60 transition-colors">
                                            {stat.replace(/_/g, ' ')}
                                        </span>
                                        <div className="text-sm font-black text-white tracking-tighter">
                                            {typeof val === 'number' ? val.toFixed(3) : val}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'AI Risk Score':
                return (
                    <div className="flex flex-col items-center justify-center glass-panel p-12 min-h-[400px] space-y-8">
                        <div className="w-full max-w-sm">
                            <RiskGauge score={riskScore} />
                        </div>

                        {analysisResult?.model_accuracy && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full max-w-sm bg-neon-blue/10 border border-neon-blue/20 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-neon-green uppercase font-black tracking-[0.2em]">Neural Engine Accuracy</span>
                                    <span className="text-xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">{analysisResult.model_accuracy}%</span>
                                </div>
                                <div className="w-full bg-neon-green/10 h-1.5 rounded-full overflow-hidden border border-neon-green/20">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysisResult.model_accuracy}%` }}
                                        className="h-full bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.6)]"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 mt-4 leading-relaxed font-bold italic tracking-wider">
                                    * Risk analysis based on statistical mapping of neuro-oscillatory patterns. 95%+ indicates critical seizure threshold validation.
                                </p>
                            </motion.div>
                        )}
                    </div>
                );
            case 'AI Assistant':
                return (
                    <div className="h-[600px] glass-panel p-2 overflow-hidden flex flex-col">
                        <ChatWidget context={analysisResult ? JSON.stringify(analysisResult) : null} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {/* Sub Tabs Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/[0.02] border border-white/[0.05] rounded-2xl w-fit backdrop-blur-md">
                {subTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = subTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.id}
                        </button>
                    );
                })}
            </div>

            {/* Sub Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={subTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderSubTabContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnalysisView;
