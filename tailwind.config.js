/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0f172a',
                'bg-secondary': '#1e293b',
                'text-primary': '#f1f5f9',
                'text-secondary': '#94a3b8',
                'accent': '#6366f1',
                'accent-hover': '#4f46e5',
            },
        },
    },
    plugins: [],
}
