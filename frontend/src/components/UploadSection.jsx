import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadSection = ({ onUpload, type = "csv", label = "Upload EEG Data (CSV)" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const validateFile = (selectedFile) => {
        if (type === 'csv' && !selectedFile.name.endsWith('.csv')) {
            setError("Please upload a Valid CSV file.");
            return false;
        }
        if (type === 'image' && !selectedFile.type.startsWith('image/')) {
            setError("Please upload a valid image file.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                onUpload(droppedFile);
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                onUpload(selectedFile);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</h3>
                {error && (
                    <motion.span
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-400 text-[10px] font-bold uppercase flex items-center gap-1"
                    >
                        <AlertCircle className="w-3 h-3" /> {error}
                    </motion.span>
                )}
            </div>

            <motion.div
                whileHover={{ scale: 1.01, borderColor: "rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.99 }}
                className={`relative h-48 rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${isDragging
                    ? 'border-neon-green/30 bg-neon-green/5 shadow-[0_0_30px_rgba(57,255,20,0.1)]'
                    : file
                        ? 'border-green-500/20 bg-green-500/2'
                        : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                {/* Shimmer Effect */}
                <div className="animate-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={type === 'csv' ? ".csv" : "image/*"}
                    onChange={handleFileSelect}
                />

                <AnimatePresence mode='wait'>
                    {file ? (
                        <motion.div
                            key="file-selected"
                            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-3 text-green-400"
                        >
                            <div className="p-4 rounded-2xl bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div className="text-center px-4">
                                <p className="font-bold text-white text-sm truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mt-1">Ready for analysis • Click to replace</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload-prompt"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-white transition-colors"
                        >
                            <motion.div
                                animate={isDragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                                className="p-5 rounded-2xl bg-white/5 group-hover:bg-neon-purple/20 transition-colors shadow-inner"
                            >
                                <Upload className={`w-8 h-8 ${type === 'csv' ? 'text-neon-blue' : 'text-neon-purple'} transition-colors`} />
                            </motion.div>
                            <div className="text-center">
                                <p className="font-bold tracking-tight">Drag & Drop or Click</p>
                                <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mt-2">
                                    {type === 'csv' ? "CSV Raw Signal" : "PNG/JPG Spectrogram"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/10 rounded-tl group-hover:border-neon-blue transition-all" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/10 rounded-tr group-hover:border-neon-blue transition-all" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/10 rounded-bl group-hover:border-neon-blue transition-all" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/10 rounded-br group-hover:border-neon-blue transition-all" />
            </motion.div>
        </div>
    );
};

export default UploadSection;
