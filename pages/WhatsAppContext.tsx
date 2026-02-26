import React, { useEffect, useState } from 'react';
import { fetchWhatsAppQueries } from '../services/api';
import { WhatsAppQuery } from '../types';
import { MessageSquare, User, Smartphone } from 'lucide-react';

export const WhatsAppContext: React.FC = () => {
  const [queries, setQueries] = useState<WhatsAppQuery[]>([]);

  useEffect(() => {
    fetchWhatsAppQueries().then(setQueries);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Query Context</h1>
        <p className="text-slate-500">Real-time log of patient interactions with the AI assistant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Patient Context Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" /> Active Patient
            </h2>
            <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">JD</div>
                <div>
                    <p className="font-medium text-slate-900">Jane Doe</p>
                    <p className="text-sm text-slate-500">ID: P-9982</p>
                </div>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Condition</span>
                    <span className="font-medium">Type 2 Diabetes</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Last Plan</span>
                    <span className="font-medium">Generated 2 days ago</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                    </span>
                </div>
            </div>
         </div>

         {/* Chat Log */}
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" /> Recent Queries
                </h2>
                <span className="text-xs text-slate-500">Syncs with n8n</span>
            </div>
            
            <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                {queries.map((q) => (
                    <div key={q.id} className="flex flex-col gap-2">
                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm py-2 px-4 max-w-[80%] shadow-sm">
                                <p className="text-sm">{q.query}</p>
                                <p className="text-[10px] opacity-70 mt-1 text-right">{q.timestamp}</p>
                            </div>
                        </div>
                        {/* AI Response */}
                        <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm py-2 px-4 max-w-[80%] shadow-sm border border-slate-200">
                                <p className="text-sm">{q.response}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] text-slate-400">AI Assistant</span>
                                    <span className="text-[10px] text-slate-400">{q.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};
