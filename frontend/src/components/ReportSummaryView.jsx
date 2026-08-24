import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { Download, FileText, Activity, ShieldAlert, BarChart3 } from 'lucide-react';

const ReportSummaryView = ({ signalData, spectrogram, riskScore, analysisResult, loading, onSummaryReady }) => {
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [reportId] = useState(`NS-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);

    useEffect(() => {
        setSummary('');
        const fetchSummary = async () => {
            if (!analysisResult) return;
            setIsGeneratingSummary(true);
            try {
                const response = await fetch('http://localhost:8000/summarize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ analysis_result: analysisResult })
                });
                const data = await response.json();
                if (response.ok) {
                    setSummary(data.summary);
                    if (onSummaryReady) onSummaryReady(data.summary);
                } else {
                    setSummary('Failed to generate summary: ' + (data.detail || 'Unknown error'));
                }
            } catch (err) {
                console.error('Error fetching summary:', err);
                setSummary('Failed to connect to AI summarization service.');
            } finally {
                setIsGeneratingSummary(false);
            }
        };
        fetchSummary();
    }, [analysisResult]);

    // ── Programmatic multi-page PDF builder ───────────────────────────────────
    const buildPdf = (ar, rs, rid, sum) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const PW = doc.internal.pageSize.getWidth();
        const PH = doc.internal.pageSize.getHeight();
        const L = 14;
        const R = PW - 14;
        const BOTTOM_MARGIN = 18;

        let y = 0;
        let pageNum = 1;

        // ── Low-level helpers ──
        const bgFill = () => {
            doc.setFillColor(10, 10, 15);
            doc.rect(0, 0, PW, PH, 'F');
        };

        const drawFooter = () => {
            doc.setFillColor(10, 10, 15);
            doc.rect(0, PH - BOTTOM_MARGIN, PW, BOTTOM_MARGIN, 'F');
            doc.setDrawColor(40, 40, 55);
            doc.line(0, PH - BOTTOM_MARGIN, PW, PH - BOTTOM_MARGIN);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(70, 70, 85);
            doc.text('NeuroShield AI — assistive tool only. Not a substitute for professional medical diagnosis.', PW / 2, PH - 6, { align: 'center' });
            doc.text(`Page ${pageNum}`, R, PH - 6, { align: 'right' });
        };

        const newPage = () => {
            drawFooter();
            doc.addPage();
            pageNum++;
            bgFill();
            y = 18;
        };

        const checkY = (needed = 20) => {
            if (y + needed > PH - BOTTOM_MARGIN - 5) newPage();
        };

        const txt = (str, x, yt, opts = {}) => {
            const { size = 10, bold = false, color = [200, 200, 200], align = 'left' } = opts;
            doc.setFontSize(size);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setTextColor(...color);
            doc.text(String(str ?? ''), x, yt, { align });
        };

        const wrapText = (str, x, yt, maxW, lh = 5, opts = {}) => {
            const lines = doc.splitTextToSize(String(str ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,3}\s/gm, ''), maxW);
            lines.forEach((line, i) => {
                checkY(lh + 2);
                txt(line, x, yt + i * lh, opts);
            });
            return yt + lines.length * lh;
        };

        const sectionHeader = (label, color = [57, 255, 20]) => {
            checkY(12);
            txt(label, L, y, { size: 9, bold: true, color });
            doc.setDrawColor(...color, 80);
            doc.line(L, y + 2, R, y + 2);
            y += 9;
        };

        const fillRect = (x, ry, w, h, fill) => {
            doc.setFillColor(...fill);
            doc.roundedRect(x, ry, w, h, 1.5, 1.5, 'F');
        };

        // ══ PAGE 1 ══════════════════════════════════════════════════════════
        bgFill();

        // Header bar
        fillRect(0, 0, PW, 26, [12, 18, 12]);
        txt('NEUROSHIELD', L, 11, { size: 17, bold: true, color: [57, 255, 20] });
        txt('CLINICAL EEG ANALYSIS REPORT', L, 18, { size: 7, color: [140, 100, 250] });
        txt(new Date().toLocaleDateString(), R, 10, { size: 8, color: [150, 150, 150], align: 'right' });
        txt(`ID: ${rid}`, R, 15, { size: 7, color: [100, 100, 120], align: 'right' });
        txt(`Mode: ${ar?.mode === 'spectrogram' ? 'Spectrogram (Image)' : 'Raw EEG (CSV)'}`, R, 20, { size: 7, color: [100, 100, 120], align: 'right' });
        y = 33;

        // Diagnosis banner
        const isSz = ar?.label === 'Seizure';
        const lblCol = isSz ? [255, 80, 80] : [57, 255, 20];
        fillRect(L, y, PW - 28, 22, isSz ? [50, 10, 10] : [10, 40, 10]);

        txt('DIAGNOSIS', L + 4, y + 7, { size: 7, color: [150, 150, 150] });
        txt(ar?.label || 'N/A', L + 4, y + 16, { size: 14, bold: true, color: lblCol });

        txt('RISK SCORE', L + 65, y + 7, { size: 7, color: [150, 150, 150] });
        txt(`${rs?.toFixed?.(1) ?? '--'}%`, L + 65, y + 16, { size: 14, bold: true, color: lblCol });

        txt('MODEL ACCURACY', L + 120, y + 7, { size: 7, color: [150, 150, 150] });
        txt(`${ar?.model_accuracy ?? '--'}%`, L + 120, y + 16, { size: 12, bold: true, color: [220, 220, 220] });

        txt('CONFIDENCE', L + 162, y + 7, { size: 7, color: [150, 150, 150] });
        txt(`${ar?.confidence?.toFixed?.(1) ?? '--'}%`, L + 162, y + 16, { size: 12, bold: true, color: [220, 220, 220] });
        y += 30;

        // Band powers
        if (ar?.bands) {
            sectionHeader('FREQUENCY BAND ANALYSIS');
            const bands = Object.entries(ar.bands);
            const bw = (PW - 28) / bands.length;
            const bandColors = {
                delta: [57, 255, 20], theta: [96, 165, 250],
                alpha: [139, 92, 246], beta: [251, 146, 60], gamma: [248, 113, 113]
            };
            const barMaxH = 28;

            bands.forEach(([band, val], idx) => {
                const bx = L + idx * (bw + 0.8);
                const pct = Math.max(2, Math.min(100, Number(val) || 0));
                const bh = (pct / 100) * barMaxH;
                const col = bandColors[band] || [100, 100, 200];
                fillRect(bx, y + barMaxH - bh, bw - 1, bh, col);
                txt(`${pct.toFixed(1)}%`, bx + (bw - 1) / 2, y + barMaxH - bh - 2, { size: 6, color: [255, 255, 255], align: 'center' });
                txt(band.toUpperCase(), bx + (bw - 1) / 2, y + barMaxH + 6, { size: 6, bold: true, color: [180, 180, 180], align: 'center' });
            });
            y += barMaxH + 14;
        }

        // Stats
        if (ar?.stats) {
            const isSpect = ar?.mode === 'spectrogram';
            sectionHeader(isSpect ? 'COMPUTED SPECTRAL FEATURES' : 'COMPUTED SIGNAL PARAMETERS');
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
                fillRect(cx, cy, cw - 1, rowH - 2, [18, 24, 18]);
                txt(key.replace(/_/g, ' ').toUpperCase(), cx + 3, cy + 6, { size: 6, color: [110, 110, 120] });
                txt(typeof val === 'number' ? val.toFixed(4) : String(val), cx + 3, cy + 13, { size: 10, bold: true, color: [220, 220, 220] });
            });
            y += totalRows * rowH + 8;
        }

        // Interpretation
        if (ar?.interpretation) {
            sectionHeader('SYSTEM INTERPRETATION');
            checkY(18);
            fillRect(L, y, PW - 28, 14, [18, 22, 18]);
            y = wrapText(ar.interpretation, L + 4, y + 6, PW - 36, 5, { size: 8, color: [200, 200, 200] }) + 10;
        }

        // ══ PAGE 2 — AI CLINICAL SUMMARY ════════════════════════════════════
        if (sum && sum.trim().length > 0) {
            newPage();
            sectionHeader('AI CLINICAL SUMMARY (GENERATED BY GEMINI)', [140, 100, 250]);

            const cleanSummary = sum
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/^#{1,3}\s/gm, '')
                .replace(/\r\n/g, '\n');

            const paragraphs = cleanSummary.split(/\n\n+/);
            paragraphs.forEach(para => {
                const trimmed = para.trim();
                if (!trimmed) return;
                checkY(10);
                const lines = doc.splitTextToSize(trimmed, PW - 28);
                lines.forEach(line => {
                    checkY(6);
                    txt(line, L, y, { size: 9, color: [200, 200, 200] });
                    y += 5.5;
                });
                y += 4; // paragraph gap
            });
        }

        drawFooter();
        return doc;
    };

    const handleDownloadPdf = () => {
        setIsGeneratingPdf(true);
        try {
            const doc = buildPdf(analysisResult, riskScore, reportId, summary);
            doc.save(`NeuroShield_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Error: ' + error.message);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Also expose buildPdf for admin downloads
    ReportSummaryView.buildPdf = buildPdf;

    if (!analysisResult) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Activity className="w-16 h-16 text-neon-green/20 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold text-gray-300">No Analysis Data Available</h2>
                <p className="text-gray-500 mt-2">Please upload a scan in the Analysis tab first.</p>
            </div>
        );
    }

    const isSeizure = analysisResult?.label === 'Seizure';
    const labelColor = isSeizure ? 'text-red-400' : 'text-neon-green';
    const isSpect = analysisResult?.mode === 'spectrogram';

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-neon-green uppercase tracking-tighter">Report Summary</h2>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || isGeneratingSummary}
                    className="flex flex-row items-center gap-2 bg-neon-green/20 text-neon-green border border-neon-green hover:bg-neon-green hover:text-black transition-all px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
            </div>

            {/* Report Preview */}
            <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-2xl flex flex-col gap-6 text-gray-100 max-w-3xl mx-auto">
                {/* Header */}
                <div className="border-b border-white/10 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-neon-green tracking-tighter uppercase">NeuroShield</h1>
                        <p className="text-xs text-electric-purple font-bold tracking-widest uppercase mt-1">Clinical EEG Analysis Report</p>
                    </div>
                    <div className="text-right text-xs text-gray-500 font-mono">
                        Date: {new Date().toLocaleDateString()}<br />
                        ID: {reportId}<br />
                        Mode: {isSpect ? 'Spectrogram' : 'Raw EEG'}
                    </div>
                </div>

                {/* Diagnosis */}
                <div className={`rounded-xl p-4 border ${isSeizure ? 'border-red-500/20 bg-red-900/10' : 'border-neon-green/20 bg-neon-green/5'} grid grid-cols-2 md:grid-cols-4 gap-4`}>
                    {[
                        { label: 'Diagnosis', val: analysisResult.label, highlight: true },
                        { label: 'Seizure Risk', val: `${riskScore?.toFixed(1)}%`, highlight: true },
                        { label: 'Model Accuracy', val: `${analysisResult.model_accuracy}%` },
                        { label: 'Confidence', val: `${analysisResult.confidence?.toFixed(1)}%` },
                    ].map(({ label, val, highlight }) => (
                        <div key={label}>
                            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">{label}</span>
                            <span className={`text-xl font-black ${highlight ? labelColor : 'text-white'} uppercase`}>{val}</span>
                        </div>
                    ))}
                </div>

                {/* Band Powers */}
                {analysisResult.bands && (
                    <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-black text-neon-green uppercase tracking-widest mb-3">
                            <BarChart3 className="w-3 h-3" /> Frequency Band Analysis
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {Object.entries(analysisResult.bands).map(([band, val]) => {
                                const pct = Number(val) || 0;
                                const colors = { delta: 'bg-green-400', theta: 'bg-blue-400', alpha: 'bg-indigo-400', beta: 'bg-orange-400', gamma: 'bg-red-400' };
                                return (
                                    <div key={band} className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-black text-white">{pct.toFixed(1)}%</span>
                                        <div className="w-full bg-white/5 rounded h-16 flex items-end">
                                            <div className={`w-full ${colors[band] || 'bg-purple-400'} rounded transition-all`} style={{ height: `${Math.max(4, pct)}%` }} />
                                        </div>
                                        <span className="text-[8px] uppercase text-gray-400 font-black">{band}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Stats */}
                {analysisResult.stats && (
                    <div>
                        <h3 className="flex items-center gap-2 text-[10px] font-black text-neon-green uppercase tracking-widest mb-3">
                            <ShieldAlert className="w-3 h-3" />
                            {isSpect ? 'Computed Spectral Features' : 'Computed Signal Parameters'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(analysisResult.stats).map(([key, val]) => (
                                <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest block mb-1">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-sm font-black text-white">{typeof val === 'number' ? val.toFixed(4) : val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-electric-purple uppercase tracking-widest mb-4">
                        <FileText className="w-5 h-5" /> AI Clinical Summary
                    </h3>
                    {isGeneratingSummary ? (
                        <div className="flex items-center gap-3 text-gray-400">
                            <Activity className="w-5 h-5 animate-spin" />
                            <span>Generating neuro-clinical summary...</span>
                        </div>
                    ) : (
                        <div
                            className="text-sm text-gray-300 leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-green">$1</strong>') }}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 text-[10px] text-gray-500 text-center">
                    This report was generated using NeuroShield AI models. This is an assistive tool and does not replace professional medical diagnosis.
                </div>
            </div>
        </div>
    );
};

export default ReportSummaryView;
