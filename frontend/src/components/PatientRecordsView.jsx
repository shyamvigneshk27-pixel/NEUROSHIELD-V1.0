import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, User } from 'lucide-react';
import { MOCK_PATIENTS } from '../mockData';

const PatientRecordsView = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">Patient Records</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="bg-eclipse/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple/50 w-64"
                        />
                    </div>
                    <button className="glass-panel px-4 py-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Patient</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Age/Gender</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Last Visit</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Risk Level</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PATIENTS.map((patient, idx) => (
                            <motion.tr
                                key={patient.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-neon-purple" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{patient.name}</div>
                                            <div className="text-xs text-gray-500">{patient.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {patient.age} / {patient.gender}
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {patient.lastVisit}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${patient.status === 'Stable' ? 'bg-green-500/10 text-green-400' :
                                            patient.status === 'Critical' ? 'bg-red-500/10 text-red-400' :
                                                'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${patient.risk === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                        patient.risk === 'Moderate' ? 'bg-orange-500' :
                                                            'bg-green-500'
                                                    }`}
                                                style={{ width: patient.risk === 'High' ? '85%' : patient.risk === 'Moderate' ? '45%' : '15%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 w-8">{patient.risk}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientRecordsView;
