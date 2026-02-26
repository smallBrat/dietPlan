import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Plus, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-primary-100 max-w-xl">
          Track your meals, manage your conditions, and stay healthy with your personalized diet plan.
        </p>
      </div>


      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/upload-plan" className="group block p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mb-2">Upload Diet Plan</h3>
          <p className="text-sm text-slate-500 mb-4">Have a PDF or image from your doctor? Upload it here.</p>
          <span className="text-sm font-medium text-blue-600 flex items-center gap-1">Upload now <ArrowRight className="h-4 w-4" /></span>
        </Link>

        <Link to="/create-plan" className="group block p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all">
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mb-2">Create New Plan</h3>
          <p className="text-sm text-slate-500 mb-4">Use our guided tool to generate a personalized diet plan based on your needs.</p>
          <span className="text-sm font-medium text-primary-600 flex items-center gap-1">Start now <ArrowRight className="h-4 w-4" /></span>
        </Link>

        <Link to="/diet-plan" className="group block p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 mb-2">View Today's Meals</h3>
          <p className="text-sm text-slate-500 mb-4">Check your schedule for breakfast, lunch, snacks, and dinner.</p>
          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">View schedule <ArrowRight className="h-4 w-4" /></span>
        </Link>
      </div>

      {/* Recent Activity / Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Health Insights</h2>
        <div className="text-sm text-slate-500">
          <p>Connect your WhatsApp to receive instant diet advice. Our AI assistant helps you make better food choices in real-time.</p>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="font-medium text-slate-700">Try asking on WhatsApp:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-slate-600">
              <li>"Can I eat a banana with my diabetes medication?"</li>
              <li>"What is a good alternative to rice for lunch?"</li>
              <li>"Log my water intake for today."</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
