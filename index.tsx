import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Inject basic Tailwind directives since we are using CDN but might want local overrides
const style = document.createElement('style');
style.type = 'text/tailwindcss';
style.textContent = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* Custom Utility Classes */
  .input {
    @apply w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-slate-900 bg-white;
  }
  .label {
    @apply block text-sm font-medium text-slate-700 mb-1;
  }
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors;
  }
  .error {
    @apply text-red-500 text-xs mt-1;
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
