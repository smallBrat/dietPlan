import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppContext: React.FC = () => {
    const openWhatsApp = () => {
        window.open('https://wa.me/919861353766', '_blank', 'noopener,noreferrer');
    };

  return (
        <div className="max-w-5xl mx-auto min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Have a Question?</h1>
                <p className="mt-3 text-slate-500">
                    Chat directly with our AI assistant on WhatsApp for instant help with your diet plan.
                </p>

                <button
                    type="button"
                    onClick={openWhatsApp}
                    className="mt-8 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] text-white font-semibold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                    <MessageCircle className="h-6 w-6" />
                    Chat on WhatsApp
                </button>

                <p className="mt-4 text-sm text-slate-500">
                    Available 24/7. Get today's meal plan, modify meals, or ask health-related queries instantly.
                </p>
            </div>
        </div>
  );
};
