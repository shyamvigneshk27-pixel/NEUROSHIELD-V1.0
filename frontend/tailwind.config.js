/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                midnight: "#020617",
                "deep-midnight": "#01040a",
                "neon-cyan": "#00E5FF",
                "neon-green": "#39FF14",
                "electric-purple": "#7C3AED",
                "neon-purple": "#a78bfa",
                "neon-blue": "#00E5FF",
                "success-green": "#22C55E",
                "alert-red": "#EF4444",
                "glass": "rgba(255, 255, 255, 0.03)",
                "glass-white": "rgba(255, 255, 255, 0.08)",
                "glass-dark": "rgba(0, 0, 0, 0.2)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'drift': 'drift 20s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
                'waveform': 'waveform 10s linear infinite',
            },
            keyframes: {
                drift: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: 0.3, filter: 'blur(100px)' },
                    '50%': { opacity: 0.6, filter: 'blur(130px)' },
                },
                waveform: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [],
}
