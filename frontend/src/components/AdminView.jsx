<<<<<<< HEAD
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import {
    Users, Shield, Clock, Download, Activity,
    FileText, Image as ImageIcon, BarChart3, Trash2
} from 'lucide-react';

// ── Standalone PDF builder (same logic as ReportSummaryView) ─────────────────
const buildRecordPdf = (record) => {
    const ar = record.prediction;
    const rs = ar?.risk_score;
    const sum = record.aiSummary || '';
    const rid = `NS-HIST-${record.id}`;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const L = 14;
    const R = PW - 14;
    const BM = 18;

    let y = 0;
    let pageNum = 1;

    const bgFill = () => { doc.setFillColor(10, 10, 15); doc.rect(0, 0, PW, PH, 'F'); };
    const drawFooter = () => {
        doc.setFillColor(10, 10, 15);
        doc.rect(0, PH - BM, PW, BM, 'F');
        doc.setDrawColor(40, 40, 55);
        doc.line(0, PH - BM, PW, PH - BM);
        doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(70, 70, 85);
        doc.text('NeuroShield AI — assistive tool only.', PW / 2, PH - 6, { align: 'center' });
        doc.text(`Page ${pageNum}`, R, PH - 6, { align: 'right' });
    };
    const newPage = () => { drawFooter(); doc.addPage(); pageNum++; bgFill(); y = 18; };
    const checkY = (n = 20) => { if (y + n > PH - BM - 5) newPage(); };
    const txt = (str, x, yt, opts = {}) => {
        const { size = 10, bold = false, color = [200, 200, 200], align = 'left' } = opts;
        doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(...color); doc.text(String(str ?? ''), x, yt, { align });
    };
    const fill = (x, ry, w, h, c) => { doc.setFillColor(...c); doc.roundedRect(x, ry, w, h, 1.5, 1.5, 'F'); };
    const sec = (label, col = [57, 255, 20]) => {
        checkY(12); txt(label, L, y, { size: 9, bold: true, color: col });
        doc.setDrawColor(...col); doc.line(L, y + 2, R, y + 2); y += 9;
    };

    bgFill();

    // Header
    fill(0, 0, PW, 26, [12, 18, 12]);
    txt('NEUROSHIELD', L, 11, { size: 17, bold: true, color: [57, 255, 20] });
    txt('CLINICAL EEG ANALYSIS REPORT — ADMIN RECORD', L, 18, { size: 7, color: [140, 100, 250] });
    txt(record.timestamp, R, 10, { size: 8, color: [150, 150, 150], align: 'right' });
    txt(`ID: ${rid}`, R, 15, { size: 7, color: [100, 100, 120], align: 'right' });
    txt(`User: ${record.user}  |  Input: ${record.inputType?.toUpperCase()} — ${record.filename}`, R, 20, { size: 7, color: [100, 100, 120], align: 'right' });
    y = 33;

    // Diagnosis
    const isSz = ar?.label === 'Seizure';
    const lblCol = isSz ? [255, 80, 80] : [57, 255, 20];
    fill(L, y, PW - 28, 22, isSz ? [50, 10, 10] : [10, 40, 10]);
    txt('DIAGNOSIS', L + 4, y + 7, { size: 7, color: [150, 150, 150] });
    txt(ar?.label || 'N/A', L + 4, y + 16, { size: 14, bold: true, color: lblCol });
    txt('RISK SCORE', L + 65, y + 7, { size: 7, color: [150, 150, 150] });
    txt(`${rs?.toFixed?.(1) ?? '--'}%`, L + 65, y + 16, { size: 14, bold: true, color: lblCol });
    txt('MODEL ACCURACY', L + 120, y + 7, { size: 7, color: [150, 150, 150] });
    txt(`${ar?.model_accuracy ?? '--'}%`, L + 120, y + 16, { size: 12, bold: true, color: [220, 220, 220] });
    txt('CONFIDENCE', L + 162, y + 7, { size: 7, color: [150, 150, 150] });
    txt(`${ar?.confidence?.toFixed?.(1) ?? '--'}%`, L + 162, y + 16, { size: 12, bold: true, color: [220, 220, 220] });
    y += 30;

    // Bands
    if (ar?.bands) {
        sec('FREQUENCY BAND ANALYSIS');
        const bands = Object.entries(ar.bands);
        const bw = (PW - 28) / bands.length;
        const bClr = { delta: [57, 255, 20], theta: [96, 165, 250], alpha: [139, 92, 246], beta: [251, 146, 60], gamma: [248, 113, 113] };
        const bmh = 28;
        bands.forEach(([band, val], idx) => {
            const bx = L + idx * (bw + 0.8);
            const pct = Math.max(2, Math.min(100, Number(val) || 0));
            const bh = (pct / 100) * bmh;
            const col = bClr[band] || [100, 100, 200];
            fill(bx, y + bmh - bh, bw - 1, bh, col);
            txt(`${pct.toFixed(1)}%`, bx + (bw - 1) / 2, y + bmh - bh - 2, { size: 6, color: [255, 255, 255], align: 'center' });
            txt(band.toUpperCase(), bx + (bw - 1) / 2, y + bmh + 6, { size: 6, bold: true, color: [180, 180, 180], align: 'center' });
        });
        y += bmh + 14;
    }

    // Stats
    if (ar?.stats) {
        const isSpect = ar?.mode === 'spectrogram';
        sec(isSpect ? 'COMPUTED SPECTRAL FEATURES' : 'COMPUTED SIGNAL PARAMETERS');
        const stats = Object.entries(ar.stats);
        const cols = 3;
        const cw = (PW - 28) / cols;
        const rowH = 17;
        const totalRows = Math.ceil(stats.length / cols);
        checkY(totalRows * rowH + 4);
        stats.forEach(([key, val], idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cx = L + col * (cw + 0.8);
            const cy = y + row * rowH;
            fill(cx, cy, cw - 1, rowH - 2, [18, 24, 18]);
            txt(key.replace(/_/g, ' ').toUpperCase(), cx + 3, cy + 6, { size: 6, color: [110, 110, 120] });
            txt(typeof val === 'number' ? val.toFixed(4) : String(val), cx + 3, cy + 13, { size: 10, bold: true, color: [220, 220, 220] });
        });
        y += totalRows * rowH + 8;
    }

    // Interpretation
    if (ar?.interpretation) {
        sec('SYSTEM INTERPRETATION');
        checkY(18);
        fill(L, y, PW - 28, 14, [18, 22, 18]);
        const lines = doc.splitTextToSize(ar.interpretation, PW - 36);
        lines.forEach((line, i) => txt(line, L + 4, y + 6 + i * 5, { size: 8, color: [200, 200, 200] }));
        y += Math.max(14, lines.length * 5) + 10;
    }

    // AI Summary page
    if (sum.trim().length > 0) {
        newPage();
        sec('AI CLINICAL SUMMARY (GEMINI)', [140, 100, 250]);
        const clean = sum.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,3}\s/gm, '');
        clean.split(/\n\n+/).forEach(para => {
            const trimmed = para.trim();
            if (!trimmed) return;
            checkY(10);
            const lines = doc.splitTextToSize(trimmed, PW - 28);
            lines.forEach(line => { checkY(6); txt(line, L, y, { size: 9, color: [200, 200, 200] }); y += 5.5; });
            y += 4;
        });
    }

    drawFooter();
    return doc;
};

// ── Component ─────────────────────────────────────────────────────────────────
const AdminView = ({ sessions = [], analysisHistory = [] }) => {
    const [tab, setTab] = useState('sessions');
    const [expandedId, setExpandedId] = useState(null);

    const adminSessions = sessions.filter(s => s.role === 'admin');
    const displaySessions = adminSessions.length > 0 ? adminSessions : [
        { id: 'sys', user: 'System', role: 'admin', loginTime: new Date().toLocaleString(), status: 'Active', ip: '127.0.0.1' }
    ];

    const totalAnalyses = analysisHistory.length;
    const seizureCount = analysisHistory.filter(r => r.prediction?.label === 'Seizure').length;
    const csvCount = analysisHistory.filter(r => r.inputType === 'csv').length;
    const imgCount = analysisHistory.filter(r => r.inputType === 'image').length;

    const handleDownloadRecord = (record) => {
        try {
            const doc = buildRecordPdf(record);
            doc.save(`NeuroShield_Record_${record.id}.pdf`);
        } catch (e) {
            alert('PDF error: ' + e.message);
        }
    };

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">System Administration</h1>
                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mt-1 font-bold">Privileged Access • Full Audit Log</p>
                </div>
                <div className="glass-panel px-6 py-3 flex items-center gap-3 border-neon-blue/20">
                    <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">System Online</span>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Activity, label: 'Total Analyses', val: totalAnalyses, col: 'text-neon-green', border: 'border-neon-green/20', bg: 'bg-neon-green/10' },
                    { icon: Shield, label: 'Seizure Detected', val: seizureCount, col: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/10' },
                    { icon: FileText, label: 'CSV Inputs', val: csvCount, col: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/10' },
                    { icon: ImageIcon, label: 'Image Inputs', val: imgCount, col: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/10' },
                ].map(({ icon: Icon, label, val, col, border, bg }) => (
                    <div key={label} className={`glass-panel p-5 ${border}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${col}`} /></div>
                            <div className={`text-2xl font-black ${col}`}>{val}</div>
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{label}</div>
                    </div>
                ))}
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-fit">
                {[
                    { id: 'sessions', label: 'Login Sessions', icon: Users },
                    { id: 'history', label: 'Analysis History', icon: BarChart3 },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === id
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'sessions' && (
                    <motion.div key="sessions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="glass-panel overflow-hidden">
                        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-neon-purple" /> Secure User Sessions
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left bg-black/20">
                                        {['User', 'Role', 'Login Time', 'IP Address', 'Status'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {displaySessions.map(s => (
                                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-neon-purple transition-colors">
                                                        {s.user[0]}
                                                    </div>
                                                    <span className="font-bold text-gray-200">{s.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${s.role === 'admin' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                    {s.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 font-mono">{s.loginTime}</td>
                                            <td className="px-8 py-5 text-sm text-gray-500 font-mono">{s.ip}</td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${s.status === 'Active' ? 'text-green-500' : 'text-gray-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                                    {s.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {tab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="space-y-3">
                        {analysisHistory.length === 0 ? (
                            <div className="glass-panel p-12 text-center">
                                <Activity className="w-12 h-12 text-neon-green/20 mx-auto mb-3 animate-pulse" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No analysis records yet</p>
                                <p className="text-gray-600 text-xs mt-1">Records appear here automatically after each upload.</p>
                            </div>
                        ) : (
                            analysisHistory.map(record => {
                                const ar = record.prediction;
                                const isSz = ar?.label === 'Seizure';
                                const isOpen = expandedId === record.id;

                                return (
                                    <motion.div key={record.id} layout className="glass-panel overflow-hidden">
                                        {/* Record header row */}
                                        <div
                                            className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                            onClick={() => setExpandedId(isOpen ? null : record.id)}
                                        >
                                            <div className={`p-2 rounded-lg ${record.inputType === 'image' ? 'bg-purple-400/10' : 'bg-blue-400/10'}`}>
                                                {record.inputType === 'image'
                                                    ? <ImageIcon className="w-4 h-4 text-purple-400" />
                                                    : <FileText className="w-4 h-4 text-blue-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="font-black text-white text-sm truncate">{record.filename}</span>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${isSz ? 'text-red-400 border-red-400/30 bg-red-400/10' : 'text-neon-green border-neon-green/30 bg-neon-green/10'}`}>
                                                        {ar?.label}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-mono">{record.timestamp}</span>
                                                    <span className="text-[9px] text-gray-600 uppercase font-bold">{record.user}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 flex-wrap">
                                                    <span className="text-[10px] text-gray-500">Risk: <span className={`font-black ${isSz ? 'text-red-400' : 'text-neon-green'}`}>{ar?.risk_score?.toFixed(1)}%</span></span>
                                                    <span className="text-[10px] text-gray-500">Accuracy: <span className="text-white font-bold">{ar?.model_accuracy}%</span></span>
                                                    <span className="text-[10px] text-gray-500">Mode: <span className="text-white font-bold">{ar?.mode === 'spectrogram' ? 'Image' : 'CSV'}</span></span>
                                                    {record.aiSummary && <span className="text-[9px] text-purple-400 font-bold">✓ AI Summary</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDownloadRecord(record); }}
                                                className="flex items-center gap-1.5 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green hover:text-black transition-all px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                            >
                                                <Download className="w-3 h-3" /> PDF
                                            </button>
                                        </div>

                                        {/* Expanded detail panel */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="overflow-hidden border-t border-white/5"
                                                >
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Bands */}
                                                        {ar?.bands && (
                                                            <div>
                                                                <h4 className="text-[9px] font-black text-neon-green uppercase tracking-widest mb-3 flex items-center gap-1">
                                                                    <BarChart3 className="w-3 h-3" /> Frequency Bands
                                                                </h4>
                                                                <div className="flex gap-2 items-end h-16">
                                                                    {Object.entries(ar.bands).map(([band, val]) => {
                                                                        const pct = Number(val) || 0;
                                                                        const cs = { delta: 'bg-green-400', theta: 'bg-blue-400', alpha: 'bg-indigo-400', beta: 'bg-orange-400', gamma: 'bg-red-400' };
                                                                        return (
                                                                            <div key={band} className="flex-1 flex flex-col items-center gap-0.5">
                                                                                <span className="text-[8px] text-white font-black">{pct.toFixed(0)}%</span>
                                                                                <div className="w-full bg-white/5 rounded h-12 flex items-end">
                                                                                    <div className={`w-full ${cs[band] || 'bg-purple-400'} rounded`} style={{ height: `${Math.max(4, pct)}%` }} />
                                                                                </div>
                                                                                <span className="text-[7px] uppercase text-gray-500 font-black">{band}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Stats */}
                                                        {ar?.stats && (
                                                            <div>
                                                                <h4 className="text-[9px] font-black text-neon-green uppercase tracking-widest mb-3">Signal / Spectral Parameters</h4>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {Object.entries(ar.stats).map(([key, val]) => (
                                                                        <div key={key} className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                                            <span className="text-[7px] text-gray-500 uppercase font-black block">{key.replace(/_/g, ' ')}</span>
                                                                            <span className="text-xs font-black text-white">{typeof val === 'number' ? val.toFixed(4) : val}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* AI Summary */}
                                                        {record.aiSummary && (
                                                            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
                                                                <h4 className="text-[9px] font-black text-electric-purple uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                    <FileText className="w-3 h-3" /> AI Clinical Summary
                                                                </h4>
                                                                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                                                    {record.aiSummary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,3}\s/gm, '')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
=======
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Clock, ExternalLink } from 'lucide-react';

const AdminView = ({ sessions = [] }) => {
    // Filter to show only Admin logins as requested by user
    const adminSessions = sessions.filter(s => s.role === 'admin');

    // If no real sessions yet, show a placeholder but prefer real data
    const displaySessions = adminSessions.length > 0 ? adminSessions : [
        { id: 'ref', user: "System", role: "admin", loginTime: new Date().toLocaleString(), status: "Active", ip: "127.0.0.1" }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">System Administration</h1>
                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mt-1 font-bold">Privileged Access • Session Management</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-panel px-6 py-3 flex items-center gap-3 border-neon-blue/20">
                        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border-neon-purple/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-neon-purple/10">
                            <Users className="w-6 h-6 text-neon-purple" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">12</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Staff</div>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 border-neon-blue/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-neon-blue/10">
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">Active</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">HIPAA Compliance</div>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 border-green-500/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-green-500/10">
                            <Clock className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">99.9%</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Uptime Score</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-neon-purple" />
                        Secure User Sessions
                    </h3>
                    <button className="text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors flex items-center gap-2">
                        View Audit Log <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-black/20">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Login Time</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">IP Address</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displaySessions.map((session) => (
                                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-neon-purple transition-colors">
                                                {session.user[0]}
                                            </div>
                                            <span className="font-bold text-gray-200">{session.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${session.role === 'Admin' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                            {session.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500 font-medium font-mono">{session.loginTime}</td>
                                    <td className="px-8 py-6 text-sm text-gray-500 font-mono">{session.ip}</td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${session.status === 'Active' ? 'text-green-500' : 'text-gray-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                            {session.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
>>>>>>> 6810180e0d61c3358496c41f03984827a83b6502
        </div>
    );
};

export default AdminView;
