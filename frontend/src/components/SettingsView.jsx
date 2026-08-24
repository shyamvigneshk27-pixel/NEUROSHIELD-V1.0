import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Eye, Smartphone, Save } from 'lucide-react';

const SettingsView = () => {
    return (
        <div className="max-w-4xl space-y-8">
            <h3 className="text-2xl font-bold text-white mb-8">System Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Notification Settings */}
                <div className="glass-panel p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-neon-blue" />
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Alert Thresholds</h4>
                    </div>

                    {[
                        { label: 'Seizure Detection Alert', desc: 'Notify when risk score exceeds 75%', default: true },
                        { label: 'System Health Warnings', desc: 'Notify on model sync issues', default: true },
                        { label: 'Patient Activity Reports', desc: 'Weekly summary generation', default: false },
                    ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div>
                                <div className="text-sm font-medium text-gray-200">{setting.label}</div>
                                <div className="text-[10px] text-gray-500">{setting.desc}</div>
                            </div>
                            <div className="w-12 h-6 bg-white/5 rounded-full relative p-1 cursor-pointer hover:bg-white/10 transition-colors">
                                <motion.div
                                    animate={{ x: setting.default ? 24 : 0 }}
                                    className={`w-4 h-4 rounded-full ${setting.default ? 'bg-neon-purple shadow-[0_0_10px_rgba(139,92,246,0.6)]' : 'bg-gray-600'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Security Settings */}
                <div className="glass-panel p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-neon-purple" />
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Security & HIPAA</h4>
                    </div>

                    {[
                        { label: 'Data Encryption', desc: 'AES-256 for all stored EEG data', status: 'Enabled' },
                        { label: 'Session Timeout', desc: 'Auto-logout after 15 mins of inactivity', status: 'Enabled' },
                        { label: 'Two-Factor Auth', desc: 'Extra layer for patient file access', status: 'Disabled' },
                    ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div>
                                <div className="text-sm font-medium text-gray-200">{setting.label}</div>
                                <div className="text-[10px] text-gray-500">{setting.desc}</div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${setting.status === 'Enabled' ? 'text-green-400 bg-green-400/10' : 'text-gray-500 bg-white/5'}`}>
                                {setting.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <button className="px-6 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Discard Changes
                </button>
                <button className="bg-neon-purple px-6 py-2 rounded-xl text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default SettingsView;
